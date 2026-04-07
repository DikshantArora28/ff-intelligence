'use client';

import { useState, useRef, useEffect } from 'react';
import { PriceData, SeasonalityPeriod, SeasonalityResult } from '@/types';
import {
  calculateMonthlySeason,
  calculateQuarterlySeason,
  calculateHalfYearlySeason,
  calculateYearlySeason,
  getQuarterlyAverages,
} from '@/lib/seasonality';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line,
} from 'recharts';
import { toPng } from 'html-to-image';
import PriceInput from './PriceInput';
import { usePriceData } from '@/lib/priceStore';

interface Props {
  productId?: string;
}

export default function SeasonalityModule({ productId }: Props) {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [period, setPeriod] = useState<SeasonalityPeriod>('monthly');
  const [seasonality, setSeasonality] = useState<SeasonalityResult | null>(null);
  const [quarterlyAvgs, setQuarterlyAvgs] = useState<Record<string, Record<number, number | null>> | null>(null);
  const [preloaded, setPreloaded] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const { getProductPrices, setProductPrices } = usePriceData();

  // Auto-load from global store
  useEffect(() => {
    if (productId) {
      const bulkData = getProductPrices(productId);
      if (bulkData && bulkData.length > 0 && priceData.length === 0) {
        setPriceData(bulkData);
        setPreloaded(true);
      }
    }
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleDataLoaded(data: PriceData[]) {
    setPriceData(data);
    setPreloaded(false);
    setSeasonality(null);
    setQuarterlyAvgs(null);
    // Also save to global store for cross-tab persistence
    if (productId) setProductPrices(productId, data);
  }

  function runAnalysis() {
    if (priceData.length === 0) return;
    doCalculation(priceData, period);
  }

  function doCalculation(data: PriceData[], p: SeasonalityPeriod) {
    let result: SeasonalityResult;
    switch (p) {
      case 'monthly':
        result = calculateMonthlySeason(data);
        setQuarterlyAvgs(null);
        break;
      case 'quarterly':
        result = calculateQuarterlySeason(data);
        setQuarterlyAvgs(getQuarterlyAverages(data));
        break;
      case 'half-yearly':
        result = calculateHalfYearlySeason(data);
        setQuarterlyAvgs(null);
        break;
      case 'yearly':
        result = calculateYearlySeason(data);
        setQuarterlyAvgs(null);
        break;
    }
    setSeasonality(result);
  }

  function handlePeriodChange(p: SeasonalityPeriod) {
    setPeriod(p);
    if (priceData.length > 0 && seasonality) {
      doCalculation(priceData, p);
    }
  }

  async function exportChart() {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `seasonality-${period}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  }

  const chartData = seasonality ? Object.entries(seasonality.data).map(([label, yearData]) => {
    const row: Record<string, string | number | null> = { period: label };
    seasonality.years.forEach(year => {
      row[String(year)] = yearData[year] !== null && yearData[year] !== undefined
        ? parseFloat((yearData[year] as number).toFixed(1)) : null;
    });
    return row;
  }) : [];

  const quarterlyChartData = quarterlyAvgs && period === 'quarterly'
    ? Object.entries(quarterlyAvgs).map(([q, yearData]) => {
        const row: Record<string, string | number | null> = { period: q };
        Object.entries(yearData).forEach(([year, val]) => { row[year] = val; });
        return row;
      }) : null;

  const yearColors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  return (
    <div className="space-y-6">
      {/* Data Input + Period Selector */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">Pricing & Seasonality Analysis</h2>
          <p className="text-sm text-[var(--muted)] mb-3">Upload or manually enter price data to analyze seasonal patterns</p>
          <PriceInput onDataLoaded={handleDataLoaded} existingData={priceData} onGenerate={runAnalysis} generateLabel="Generate Seasonality" />
        </div>
        <div className="lg:w-56 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Period</label>
            {seasonality && (
              <button onClick={exportChart} className="text-xs text-blue-500 hover:text-blue-400 font-medium">
                Export PNG
              </button>
            )}
          </div>
          {(['monthly', 'quarterly', 'half-yearly', 'yearly'] as SeasonalityPeriod[]).map(p => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                period === p
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:bg-[var(--card-hover)]'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ')}
            </button>
          ))}

          {/* Re-generate after period change */}
          {priceData.length > 0 && !seasonality && (
            <button onClick={runAnalysis} className="w-full mt-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md">
              Generate Seasonality
            </button>
          )}
        </div>
      </div>

      {/* Price trend shown immediately after data load */}
      {priceData.length > 0 && !seasonality && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
          <h3 className="font-semibold text-[var(--foreground)] mb-4">Uploaded Price Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...priceData].sort((a, b) => a.date.localeCompare(b.date)).map(d => ({ date: d.date, price: d.price }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted)' }} interval={Math.max(0, Math.floor(priceData.length / 12) - 1)} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-[var(--muted)] mt-2 text-center">Select a period and click <strong>Generate Seasonality</strong> above to analyze patterns.</p>
        </div>
      )}

      {/* Results */}
      {seasonality && priceData.length > 0 && (
        <>
          {quarterlyChartData && (
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Quarterly Averages</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-2 px-3 font-semibold text-[var(--muted)]">Quarter</th>
                      {seasonality.years.map(y => (
                        <th key={y} className="text-right py-2 px-3 font-semibold text-[var(--muted)]">{y}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {quarterlyChartData.map((row, idx) => (
                      <tr key={idx} className="border-b border-[var(--border)]">
                        <td className="py-2 px-3 font-medium text-[var(--foreground)]">{row.period}</td>
                        {seasonality.years.map(y => (
                          <td key={y} className="text-right py-2 px-3 text-[var(--muted)]">
                            {row[String(y)] !== null && row[String(y)] !== undefined ? (row[String(y)] as number).toFixed(1) : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quarterlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="period" tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                    <Legend />
                    {seasonality.years.map((year, i) => (
                      <Line key={year} type="monotone" dataKey={String(year)} stroke={yearColors[i % yearColors.length]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div ref={chartRef} className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">
              {period.charAt(0).toUpperCase() + period.slice(1).replace('-', ' ')} % Change (Period-over-Period)
            </h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 px-3 font-semibold text-[var(--muted)]">
                      {period === 'monthly' ? 'Month' : period === 'quarterly' ? 'Quarter' : period === 'half-yearly' ? 'Half' : 'Year'}
                    </th>
                    {seasonality.years.map(y => (
                      <th key={y} className="text-right py-2 px-3 font-semibold text-[var(--muted)]">{y}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, idx) => (
                    <tr key={idx} className="border-b border-[var(--border)]">
                      <td className="py-2 px-3 font-medium text-[var(--foreground)]">{row.period}</td>
                      {seasonality.years.map(y => {
                        const val = row[String(y)];
                        return (
                          <td key={y} className={`text-right py-2 px-3 font-mono text-xs ${
                            val === null || val === undefined ? 'text-[var(--muted)] opacity-30' :
                            (val as number) > 0 ? 'text-green-500' :
                            (val as number) < 0 ? 'text-red-500' : 'text-[var(--muted)]'
                          }`}>
                            {val !== null && val !== undefined ? `${(val as number) > 0 ? '+' : ''}${val}%` : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value: unknown) => `${Number(value)?.toFixed(1)}%`} contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                  <Legend />
                  {seasonality.years.map((year, i) => (
                    <Bar key={year} dataKey={String(year)} fill={yearColors[i % yearColors.length]} radius={[2, 2, 0, 0]} maxBarSize={20}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry[String(year)] === null ? 'var(--border)' : yearColors[i % yearColors.length]} opacity={entry[String(year)] === null ? 0.3 : 1} />
                      ))}
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Seasonality Line Chart */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Seasonality Line Chart (% Change by Year)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value: unknown) => `${Number(value)?.toFixed(1)}%`} contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                  <Legend />
                  {seasonality.years.map((year, i) => (
                    <Line key={year} type="monotone" dataKey={String(year)} stroke={yearColors[i % yearColors.length]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Historical Price Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData.sort((a, b) => a.date.localeCompare(b.date)).map(d => ({ date: d.date, price: d.price }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted)' }} interval={Math.max(0, Math.floor(priceData.length / 12) - 1)} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {priceData.length === 0 && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">No Data Yet</h3>
          <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
            Upload an Excel file or manually enter monthly prices above to generate seasonality analysis.
          </p>
        </div>
      )}
    </div>
  );
}

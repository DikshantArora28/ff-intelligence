'use client';

import { useState, useCallback, useEffect } from 'react';
import { PriceData, BacktestResult, ForwardForecastResult } from '@/types';
import { runBacktest, runForwardForecast } from '@/lib/forecasting/backtest';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import PriceInput from './PriceInput';
import { usePriceData } from '@/lib/priceStore';

const modelColors: Record<string, string> = {
  'arima': '#3b82f6',
  'holt-winters': '#22c55e',
  'regression': '#f59e0b',
};

type ForecastMode = 'backtest' | 'forward';

interface Props {
  productId?: string;
}

export default function ForecastModule({ productId }: Props) {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [mode, setMode] = useState<ForecastMode>('backtest');
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [forwardResult, setForwardResult] = useState<ForwardForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [testMonths, setTestMonths] = useState(12);
  const [forecastMonths, setForecastMonths] = useState(12);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const { getProductPrices, setProductPrices } = usePriceData();

  // Auto-load from global store
  useEffect(() => {
    if (productId) {
      const bulkData = getProductPrices(productId);
      if (bulkData && bulkData.length > 0 && priceData.length === 0) {
        setPriceData(bulkData);
      }
    }
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDataLoaded = useCallback((data: PriceData[]) => {
    setPriceData(data);
    setBacktestResult(null);
    setForwardResult(null);
    if (productId) setProductPrices(productId, data);
  }, [productId, setProductPrices]);

  function runAnalysis() {
    if (priceData.length < 24) return;
    setLoading(true);
    setTimeout(() => {
      if (mode === 'backtest') {
        const result = runBacktest(priceData, testMonths);
        setBacktestResult(result);
        setSelectedModel(result.bestModel);
        setForwardResult(null);
      } else {
        // For forward forecast, run backtest first to determine best model, then forecast
        const bt = runBacktest(priceData, Math.min(12, Math.floor(priceData.length * 0.2)));
        setBacktestResult(bt);
        setSelectedModel(bt.bestModel);
        const fwd = runForwardForecast(priceData, forecastMonths, bt.bestModel);
        setForwardResult(fwd);
      }
      setLoading(false);
    }, 100);
  }

  // Backtest chart data
  const backtestChartData = backtestResult ? backtestResult.models[0].dates.map((date, i) => {
    const row: Record<string, string | number> = { date };
    row['Actual'] = backtestResult.models[0].actual[i];
    backtestResult.models.forEach(m => { row[m.name] = parseFloat(m.forecast[i].toFixed(2)); });
    return row;
  }) : [];

  // Forward forecast chart data: historical + forecast
  const forwardChartData = forwardResult ? (() => {
    const data: Record<string, string | number | null>[] = [];
    // Historical portion
    forwardResult.historicalDates.forEach((date, i) => {
      const row: Record<string, string | number | null> = { date, Historical: forwardResult.historicalPrices[i] };
      forwardResult.models.forEach(m => { row[m.name] = null; });
      data.push(row);
    });
    // Forecast portion
    forwardResult.models[0].dates.forEach((date, i) => {
      const row: Record<string, string | number | null> = { date, Historical: null };
      forwardResult.models.forEach(m => { row[m.name] = parseFloat(m.forecast[i].toFixed(2)); });
      data.push(row);
    });
    // Bridge: last historical point connects to first forecast
    const lastHistIdx = forwardResult.historicalDates.length - 1;
    if (lastHistIdx >= 0 && data[lastHistIdx]) {
      forwardResult.models.forEach(m => {
        data[lastHistIdx][m.name] = forwardResult.historicalPrices[lastHistIdx];
      });
    }
    return data;
  })() : [];

  const lastHistDate = forwardResult ? forwardResult.historicalDates[forwardResult.historicalDates.length - 1] : '';

  return (
    <div className="space-y-6">
      {/* Data Input + Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">Forecasting Engine</h2>
          <p className="text-sm text-[var(--muted)] mb-3">Backtest models or forecast future prices</p>
          <PriceInput onDataLoaded={handleDataLoaded} existingData={priceData} onGenerate={runAnalysis} generateLabel={mode === 'backtest' ? 'Run Backtest' : 'Generate Forecast'} />
        </div>
        <div className="lg:w-56 space-y-3">
          {/* Mode Toggle */}
          <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">Mode</label>
          <div className="flex gap-1 bg-[var(--border)] rounded-lg p-0.5">
            <button onClick={() => { setMode('backtest'); setForwardResult(null); }} className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${mode === 'backtest' ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted)]'}`}>
              Backtest
            </button>
            <button onClick={() => { setMode('forward'); setBacktestResult(null); }} className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${mode === 'forward' ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted)]'}`}>
              Forecast
            </button>
          </div>

          {mode === 'backtest' ? (
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block mb-1">Test Period</label>
              <select value={testMonths} onChange={(e) => setTestMonths(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--foreground)]">
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={18}>18 months</option>
                <option value={24}>24 months</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block mb-1">Forecast Horizon</label>
              <select value={forecastMonths} onChange={(e) => setForecastMonths(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--foreground)]">
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={18}>18 months</option>
                <option value={24}>24 months</option>
              </select>
            </div>
          )}

          <button
            onClick={runAnalysis}
            disabled={priceData.length < 24 || loading}
            className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              priceData.length >= 24 && !loading
                ? mode === 'forward' ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                : 'bg-[var(--border)] text-[var(--muted)] cursor-not-allowed'
            }`}
          >
            {loading ? 'Running...' : mode === 'backtest' ? 'Run Backtest' : 'Generate Forecast'}
          </button>

          {priceData.length > 0 && priceData.length < 24 && (
            <p className="text-xs text-red-500">Need at least 24 data points ({priceData.length} loaded)</p>
          )}
        </div>
      </div>

      {loading && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-[var(--muted)]">{mode === 'backtest' ? 'Running backtest...' : 'Generating forecast...'}</p>
        </div>
      )}

      {/* ===== FORWARD FORECAST RESULTS ===== */}
      {forwardResult && !loading && (
        <>
          {/* Model Selection */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">Price Forecast — Next {forecastMonths} Months</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">Trained on all {priceData.length} data points</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-[var(--muted)]">Model:</label>
                <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="px-2 py-1 rounded-md border border-[var(--border)] text-xs bg-[var(--surface)] text-[var(--foreground)]">
                  <option value="">All Models</option>
                  {forwardResult.models.map(m => (
                    <option key={m.name} value={m.name}>{m.name} {m.name === forwardResult.bestModel ? '(Recommended)' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forwardChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                  <Legend />
                  {lastHistDate && <ReferenceLine x={lastHistDate} stroke="var(--muted)" strokeDasharray="3 3" label={{ value: 'Now', fill: 'var(--muted)', fontSize: 10 }} />}
                  <Line type="monotone" dataKey="Historical" stroke="var(--foreground)" strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
                  {forwardResult.models.map(m => {
                    if (selectedModel && selectedModel !== m.name) return null;
                    return (
                      <Line key={m.name} type="monotone" dataKey={m.name} stroke={modelColors[m.method] || '#888'} strokeWidth={2} strokeDasharray={m.name === forwardResult.bestModel ? '0' : '5 5'} dot={{ r: 3 }} connectNulls={false} />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Forecast Table */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Forecasted Prices</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 px-3 font-semibold text-[var(--muted)]">Month</th>
                    {forwardResult.models.map(m => (
                      <th key={m.name} className="text-right py-2 px-3 font-semibold" style={{ color: modelColors[m.method] || 'var(--muted)' }}>
                        {m.name} {m.name === forwardResult.bestModel ? '⭐' : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {forwardResult.models[0].dates.map((date, i) => {
                    const lastPrice = forwardResult.historicalPrices[forwardResult.historicalPrices.length - 1];
                    return (
                      <tr key={date} className="border-b border-[var(--border)]">
                        <td className="py-2 px-3 font-medium text-[var(--foreground)]">{date}</td>
                        {forwardResult.models.map(m => {
                          const val = m.forecast[i];
                          const chg = ((val - lastPrice) / lastPrice) * 100;
                          return (
                            <td key={m.name} className="text-right py-2 px-3 font-mono">
                              <span style={{ color: modelColors[m.method] }}>{val.toFixed(2)}</span>
                              <span className={`text-[10px] ml-1 ${chg > 0 ? 'text-green-500' : chg < 0 ? 'text-red-500' : 'text-[var(--muted)]'}`}>
                                ({chg > 0 ? '+' : ''}{chg.toFixed(1)}%)
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-[var(--muted)] mt-3 italic">% change shown relative to last known price. ⭐ = recommended model based on backtest accuracy.</p>
          </div>
        </>
      )}

      {/* ===== BACKTEST RESULTS ===== */}
      {backtestResult && !forwardResult && !loading && (
        <>
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--foreground)]">Model Comparison</h3>
              <div className="text-xs text-[var(--muted)]">Train: {backtestResult.trainPeriod} | Test: {backtestResult.testPeriod}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {backtestResult.models.map((model) => {
                const isBest = model.name === backtestResult.bestModel;
                const color = modelColors[model.method];
                return (
                  <div key={model.name} className={`rounded-xl border-2 p-4 ${isBest ? 'border-green-500/50 bg-green-500/10' : 'border-[var(--border)] bg-[var(--surface)]'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm font-semibold text-[var(--foreground)]">{model.name}</span>
                      </div>
                      {isBest && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">Best</span>}
                    </div>
                    <div className="mt-3">
                      <div className="text-xs text-[var(--muted)] uppercase tracking-wider">MAPE</div>
                      <div className={`text-2xl font-bold ${model.mape < 10 ? 'text-green-500' : model.mape < 20 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {model.mape.toFixed(1)}%
                      </div>
                      <div className="text-xs text-[var(--muted)] mt-1">Accuracy: {(100 - model.mape).toFixed(1)}%</div>
                    </div>
                    <div className="mt-3 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${model.mape < 10 ? 'bg-green-500' : model.mape < 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.max(0, 100 - model.mape)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <h4 className="font-medium text-[var(--foreground)] mb-3">Forecast vs Actual (Test Period)</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={backtestChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Actual" stroke="var(--foreground)" strokeWidth={3} dot={{ r: 4 }} />
                  {backtestResult.models.map(m => (
                    <Line key={m.name} type="monotone" dataKey={m.name} stroke={modelColors[m.method]} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick action: switch to forecast mode */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-purple-400">Ready to forecast future prices?</h4>
              <p className="text-xs text-[var(--muted)] mt-0.5">Best model: <strong>{backtestResult.bestModel}</strong> (MAPE: {backtestResult.models.find(m => m.name === backtestResult.bestModel)?.mape.toFixed(1)}%)</p>
            </div>
            <button
              onClick={() => { setMode('forward'); setTimeout(runAnalysis, 50); }}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors shadow-md"
            >
              Forecast Next {forecastMonths} Months →
            </button>
          </div>
        </>
      )}

      {!backtestResult && !forwardResult && !loading && priceData.length === 0 && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-12 text-center">
          <div className="text-4xl mb-3">📈</div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">Upload Price Data for Forecasting</h3>
          <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
            Upload at least 24 months of price data. Choose <strong>Backtest</strong> to validate models or <strong>Forecast</strong> to predict future prices.
          </p>
        </div>
      )}
    </div>
  );
}

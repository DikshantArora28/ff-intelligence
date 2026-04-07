'use client';

import { useState, useCallback } from 'react';
import { PriceData } from '@/types';
import * as XLSX from 'xlsx';

interface Props {
  onDataLoaded: (data: PriceData[]) => void;
  existingData?: PriceData[];
  onGenerate?: () => void; // callback to trigger analysis
  generateLabel?: string;  // e.g. "Generate Seasonality" or "Run Backtest"
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function PriceInput({ onDataLoaded, existingData, onGenerate, generateLabel }: Props) {
  const [mode, setMode] = useState<'upload' | 'manual'>('upload');
  const [fileName, setFileName] = useState('');
  const [startYear, setStartYear] = useState(2019);
  const [endYear, setEndYear] = useState(2025);
  const [manualPrices, setManualPrices] = useState<Record<string, string>>({});

  const dataLoaded = existingData && existingData.length > 0;

  const [error, setError] = useState('');

  function parseDate(val: unknown): string {
    if (typeof val === 'number') {
      // Excel serial date number
      try {
        const excelDate = XLSX.SSF.parse_date_code(val);
        if (excelDate && excelDate.y > 1900) {
          return `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}`;
        }
      } catch { /* fall through */ }
      return '';
    }
    if (typeof val === 'string') {
      const s = val.trim();
      // Try YYYY-MM-DD or YYYY-MM
      const isoMatch = s.match(/^(\d{4})[-/](\d{1,2})/);
      if (isoMatch) return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}`;
      // Try MM/DD/YYYY or DD/MM/YYYY
      const slashMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
      if (slashMatch) return `${slashMatch[3]}-${slashMatch[1].padStart(2, '0')}`;
      // Try month names: Jan 2019, January 2019
      const monthMatch = s.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*[\s,-]+(\d{4})$/i);
      if (monthMatch) {
        const months: Record<string, string> = { jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12' };
        const m = months[monthMatch[1].toLowerCase().slice(0,3)];
        if (m) return `${monthMatch[2]}-${m}`;
      }
      // Fallback: try Date constructor
      const d = new Date(s);
      if (!isNaN(d.getTime()) && d.getFullYear() > 1900) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }
    }
    return '';
  }

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        if (json.length === 0) {
          setError('No data rows found in the file. Check that data starts from row 2.');
          return;
        }

        // Find date and price columns
        const firstRow = json[0];
        const allCols = Object.keys(firstRow);
        const dateCol = allCols.find(k => /date|month|period|time|year/i.test(k));
        let priceCol = allCols.find(k => /price|value|amount|close|avg/i.test(k));

        // If no explicit price column found, use the first numeric column that isn't the date column
        if (!priceCol && dateCol) {
          priceCol = allCols.find(k => k !== dateCol && typeof firstRow[k] === 'number');
        }

        // Last resort: if we have exactly 2 columns, assume second is price
        if (!priceCol && allCols.length === 2) {
          priceCol = allCols.find(k => k !== dateCol) || allCols[1];
        }

        if (!dateCol || !priceCol) {
          setError(`Could not find Date and Price columns. Found columns: ${allCols.join(', ')}. Ensure one column has a date-like name (Date, Month, Period) and another has numeric values.`);
          return;
        }

        const parsed: PriceData[] = [];
        json.forEach((row) => {
          const dateStr = parseDate(row[dateCol]);
          const priceVal = row[priceCol];
          const price = typeof priceVal === 'number' ? priceVal : parseFloat(String(priceVal));
          if (dateStr && !isNaN(price) && price !== 0) {
            parsed.push({ date: dateStr, price });
          }
        });

        if (parsed.length === 0) {
          setError(`File parsed but 0 valid rows found. Check date format (use YYYY-MM-DD) and ensure Price is numeric.`);
          return;
        }

        onDataLoaded(parsed);
      } catch (err) {
        setError(`Failed to parse file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    reader.readAsBinaryString(file);
  }, [onDataLoaded]);

  function handleManualSubmit() {
    const parsed: PriceData[] = [];
    for (let y = startYear; y <= endYear; y++) {
      for (let m = 0; m < 12; m++) {
        const key = `${y}-${String(m + 1).padStart(2, '0')}`;
        const val = manualPrices[key];
        if (val && val.trim() !== '') {
          const price = parseFloat(val);
          if (!isNaN(price) && price !== 0) parsed.push({ date: key, price });
        }
      }
    }
    if (parsed.length > 0) onDataLoaded(parsed);
  }

  function updatePrice(key: string, value: string) {
    setManualPrices(prev => ({ ...prev, [key]: value }));
  }

  function downloadTemplate() {
    const wb = XLSX.utils.book_new();
    const samplePrices = [25.3,24.8,26.1,24.5,28.7,18.0,24.7,16.6,20.0,24.3,19.2,18.2,17.5,16.9,16.5,22.1,20.2,19.5,21.2,21.9,22.2,21.7,22.3,21.3,23.5,24.7,21.1,18.6,23.7,19.0,22.8,25.8,19.0,20.1,25.1,28.8,30.6,27.8,26.1,30.0,31.6,38.7,34.2,34.7,31.0,33.2,25.9,38.3,44.8,38.2,34.7,36.6,32.4,28.6,23.9,32.1,24.0,32.2,31.1,36.1,26.2,25.5,28.3,27.6,28.3,30.5,26.6,22.7,30.2,35.1,28.6,27.2,30.1,29.9,38.0,32.2,31.6,31.6,29.7,36.2,37.2,37.5,33.0,35.6];
    const rows: (string | number)[][] = [];
    for (let y = 2019; y <= 2025; y++) {
      for (let m = 1; m <= 12; m++) {
        const idx = (y - 2019) * 12 + (m - 1);
        if (idx < samplePrices.length) rows.push([`${y}-${String(m).padStart(2, '0')}-01`, samplePrices[idx]]);
      }
    }
    const ws = XLSX.utils.aoa_to_sheet([['Date', 'Price'], ...rows]);
    ws['!cols'] = [{ wch: 14 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Price Data');
    const instrWs = XLSX.utils.aoa_to_sheet([
      ['F&F Intelligence - Price Data Upload Format'], [''],
      ['INSTRUCTIONS:'],
      ['1. Column A: Date (YYYY-MM-DD or YYYY-MM)'],
      ['2. Column B: Price (numeric)'],
      ['3. One row per month'],
      ['4. Min 24 months recommended for forecasting'],
      ['5. Headers must contain "Date" and "Price"'],
    ]);
    instrWs['!cols'] = [{ wch: 50 }];
    XLSX.utils.book_append_sheet(wb, instrWs, 'Instructions');
    XLSX.writeFile(wb, 'FF_Intelligence_Price_Template.xlsx');
  }

  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setMode('upload')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === 'upload' ? 'bg-blue-600 text-white' : 'bg-[var(--surface-secondary)] text-[var(--muted)] border border-[var(--border)]'}`}>
          Upload Excel
        </button>
        <button onClick={() => setMode('manual')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === 'manual' ? 'bg-blue-600 text-white' : 'bg-[var(--surface-secondary)] text-[var(--muted)] border border-[var(--border)]'}`}>
          Manual Entry
        </button>
      </div>

      {/* Data loaded success banner + Generate button */}
      {dataLoaded && (
        <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-sm">✅</span>
            <div>
              <p className="text-sm font-semibold text-emerald-500">{existingData.length} data points loaded</p>
              {fileName && <p className="text-[10px] text-[var(--muted)]">from {fileName}</p>}
            </div>
          </div>
          {onGenerate && (
            <button
              onClick={onGenerate}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md"
            >
              {generateLabel || 'Generate'}
            </button>
          )}
        </div>
      )}

      {/* Error feedback */}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
          <span className="text-red-500 text-sm flex-shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-red-500">Upload Error</p>
            <p className="text-xs text-red-400 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {mode === 'upload' ? (
        <div className="space-y-3">
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--card-hover)] transition-colors">
            <div className="text-center">
              <p className="text-sm text-[var(--muted)]">
                {fileName
                  ? <span className="font-medium text-blue-500">{fileName}</span>
                  : <>Drop Excel file or <span className="font-medium text-blue-500">browse</span></>
                }
              </p>
              <p className="text-xs text-[var(--muted)] opacity-60 mt-1">Columns: Date/Month, Price/Value (.xlsx, .xls, .csv)</p>
            </div>
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1v9m0 0L5 7m3 3l3-3M2 12v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Download Excel Template
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] block mb-1">Start Year</label>
              <input type="number" value={startYear} onChange={(e) => setStartYear(parseInt(e.target.value) || 2019)} className="w-20 px-2 py-1 rounded-lg border border-[var(--border)] text-sm bg-[var(--surface-secondary)] text-[var(--foreground)]" min={2000} max={2030} />
            </div>
            <span className="text-[var(--muted)] mt-5">to</span>
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] block mb-1">End Year</label>
              <input type="number" value={endYear} onChange={(e) => setEndYear(parseInt(e.target.value) || 2025)} className="w-20 px-2 py-1 rounded-lg border border-[var(--border)] text-sm bg-[var(--surface-secondary)] text-[var(--foreground)]" min={2000} max={2030} />
            </div>
          </div>
          <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--surface-secondary)]">
                  <th className="text-left py-2 px-3 font-semibold text-[var(--muted)] sticky left-0 bg-[var(--surface-secondary)] z-10">Month</th>
                  {years.map(y => <th key={y} className="text-center py-2 px-2 font-semibold text-[var(--muted)] min-w-[72px]">{y}</th>)}
                </tr>
              </thead>
              <tbody>
                {MONTHS.map((month, mi) => (
                  <tr key={month} className="border-t border-[var(--border)]">
                    <td className="py-1 px-3 font-medium text-[var(--foreground)] sticky left-0 bg-[var(--surface)] z-10">{month}</td>
                    {years.map(y => {
                      const key = `${y}-${String(mi + 1).padStart(2, '0')}`;
                      return (
                        <td key={key} className="py-0.5 px-0.5">
                          <input type="number" step="0.01" placeholder="—" value={manualPrices[key] || ''} onChange={(e) => updatePrice(key, e.target.value)}
                            className="w-full px-1.5 py-1 rounded border border-[var(--border)] text-xs text-center bg-[var(--surface-secondary)] text-[var(--foreground)] focus:border-blue-400 focus:ring-1 focus:ring-blue-300 outline-none" />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-[var(--muted)]">Leave blank to skip — missing data ignored.</p>
            <button onClick={handleManualSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              Load Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

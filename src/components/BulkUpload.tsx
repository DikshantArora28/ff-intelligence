'use client';

import { useState, useCallback } from 'react';
import { PriceData } from '@/types';
import { products } from '@/data/products';
import { usePriceData } from '@/lib/priceStore';
import * as XLSX from 'xlsx';

interface Props {
  open: boolean;
  onClose: () => void;
}

function makeId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseDate(val: unknown): string {
  if (typeof val === 'number') {
    try {
      const d = XLSX.SSF.parse_date_code(val);
      if (d && d.y > 1900) return `${d.y}-${String(d.m).padStart(2, '0')}`;
    } catch { /* */ }
    return '';
  }
  if (typeof val === 'string') {
    const s = val.trim();
    const iso = s.match(/^(\d{4})[-/](\d{1,2})/);
    if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}`;
    const slash = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (slash) return `${slash[3]}-${slash[1].padStart(2, '0')}`;
    const month = s.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*[\s,-]+(\d{4})$/i);
    if (month) {
      const m: Record<string, string> = { jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12' };
      const mm = m[month[1].toLowerCase().slice(0,3)];
      if (mm) return `${month[2]}-${mm}`;
    }
    const d = new Date(s);
    if (!isNaN(d.getTime()) && d.getFullYear() > 1900) return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  }
  return '';
}

const productIds = new Set(products.map(p => p.id));
const productNameMap = new Map<string, string>(); // lowercase name/synonym → productId
products.forEach(p => {
  productNameMap.set(p.name.toLowerCase(), p.id);
  productNameMap.set(p.id, p.id);
  p.synonyms.forEach(s => productNameMap.set(s.toLowerCase(), p.id));
});

function findProductId(header: string): string | null {
  const lower = header.toLowerCase().trim();
  // Direct match on name or synonym
  if (productNameMap.has(lower)) return productNameMap.get(lower)!;
  // Try makeId match
  const id = makeId(header);
  if (productIds.has(id)) return id;
  // Fuzzy: check if header contains a product name
  for (const [name, pid] of productNameMap) {
    if (lower.includes(name) || name.includes(lower)) return pid;
  }
  return null;
}

interface ColumnMapping {
  header: string;
  productId: string | null;
  productName: string | null;
  rowCount: number;
}

export default function BulkUpload({ open, onClose }: Props) {
  const { setBulkPrices, productCount, clearAll } = usePriceData();
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [parsedData, setParsedData] = useState<Record<string, PriceData[]>>({});
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    setSuccess(false);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        if (json.length === 0) { setError('No data rows found.'); return; }

        const cols = Object.keys(json[0]);
        // First column with date-like values is the date column
        const dateCol = cols.find(k => {
          const val = json[0][k];
          return /date|month|period|time|year/i.test(k) || parseDate(val) !== '';
        }) || cols[0];

        const productCols = cols.filter(c => c !== dateCol);
        if (productCols.length === 0) { setError('No product columns found. Need at least 2 columns (Date + Products).'); return; }

        // Parse all product columns
        const dataMap: Record<string, PriceData[]> = {};
        const colMappings: ColumnMapping[] = [];

        productCols.forEach(col => {
          const pid = findProductId(col);
          const prices: PriceData[] = [];

          json.forEach(row => {
            const dateStr = parseDate(row[dateCol]);
            const priceVal = row[col];
            const price = typeof priceVal === 'number' ? priceVal : parseFloat(String(priceVal));
            if (dateStr && !isNaN(price) && price !== 0) {
              prices.push({ date: dateStr, price });
            }
          });

          colMappings.push({
            header: col,
            productId: pid,
            productName: pid ? products.find(p => p.id === pid)?.name || col : null,
            rowCount: prices.length,
          });

          if (pid && prices.length > 0) {
            dataMap[pid] = prices.sort((a, b) => a.date.localeCompare(b.date));
          }
        });

        setMappings(colMappings);
        setParsedData(dataMap);
      } catch (err) {
        setError(`Parse error: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  function confirmUpload() {
    if (Object.keys(parsedData).length === 0) return;
    setBulkPrices(parsedData);
    setSuccess(true);
  }

  const matched = mappings.filter(m => m.productId);
  const unmatched = mappings.filter(m => !m.productId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">Bulk Price Upload</h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">Upload one Excel with all product prices</p>
            </div>
            <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl leading-none">&times;</button>
          </div>

          {/* Current status */}
          {productCount > 0 && !success && (
            <div className="mb-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center justify-between">
              <span className="text-xs text-blue-400 font-medium">{productCount} products already have price data loaded</span>
              <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 font-medium">Clear All</button>
            </div>
          )}

          {/* Upload area */}
          {!success && (
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--card-hover)] transition-colors mb-4">
              <p className="text-sm text-[var(--muted)]">
                {fileName ? <span className="font-medium text-blue-500">{fileName}</span> : <>Drop Excel or <span className="font-medium text-blue-500">browse</span></>}
              </p>
              <p className="text-[10px] text-[var(--muted)] opacity-60 mt-1">First column: Date | Other columns: Product prices</p>
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleUpload} />
            </label>
          )}

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Mapping results */}
          {mappings.length > 0 && !success && (
            <>
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">{matched.length} matched</span>
                  {unmatched.length > 0 && (
                    <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">{unmatched.length} skipped</span>
                  )}
                </div>

                {/* Matched */}
                <div className="space-y-1 mb-3">
                  {matched.map((m, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 text-xs">✓</span>
                        <span className="text-xs font-medium text-[var(--foreground)]">{m.header}</span>
                        <span className="text-[10px] text-[var(--muted)]">→ {m.productName}</span>
                      </div>
                      <span className="text-[10px] text-[var(--muted)]">{m.rowCount} rows</span>
                    </div>
                  ))}
                </div>

                {/* Unmatched */}
                {unmatched.length > 0 && (
                  <div className="space-y-1">
                    {unmatched.map((m, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500 text-xs">⚠</span>
                          <span className="text-xs text-[var(--muted)]">{m.header}</span>
                          <span className="text-[10px] text-[var(--muted)]">(no matching product)</span>
                        </div>
                        <span className="text-[10px] text-[var(--muted)]">{m.rowCount} rows</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={confirmUpload} className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md">
                Load {matched.length} Products into Platform
              </button>
            </>
          )}

          {/* Success */}
          {success && (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-lg font-bold text-emerald-500 mb-1">{Object.keys(parsedData).length} Products Loaded!</h3>
              <p className="text-sm text-[var(--muted)] mb-4">
                Price data is now available across the platform. Visit any product's Seasonality or Forecasting tab — data will be pre-loaded.
              </p>
              <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

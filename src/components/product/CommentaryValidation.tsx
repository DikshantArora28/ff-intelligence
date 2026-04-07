'use client';

import { useState } from 'react';
import {
  validatePriceCommentary,
  getOverallStatus,
  PeriodValidation,
  Direction,
} from '@/lib/commentaryNlp';

type ValidationMode = 'quarterly' | 'half-yearly';

const dirLabel: Record<Direction, string> = {
  increase: '↑ Increase',
  decrease: '↓ Decrease',
  stable: '→ Stable',
  unknown: '? Unknown',
};

const dirColor: Record<Direction, string> = {
  increase: 'text-green-500',
  decrease: 'text-red-500',
  stable: 'text-[var(--muted)]',
  unknown: 'text-[var(--muted)] opacity-50',
};

export default function CommentaryValidation() {
  const [mode, setMode] = useState<ValidationMode>('quarterly');

  // Quarterly state
  const [qPrices, setQPrices] = useState({ Q1: '', Q2: '', Q3: '', Q4: '' });
  const [qCommentary, setQCommentary] = useState('');

  // Half-yearly state
  const [hPrices, setHPrices] = useState({ H1: '', H2: '' });
  const [hCommentary, setHCommentary] = useState('');

  const [results, setResults] = useState<PeriodValidation[] | null>(null);

  function runValidation() {
    if (mode === 'quarterly') {
      const prices = (['Q1', 'Q2', 'Q3', 'Q4'] as const)
        .map(q => ({ label: q, value: parseFloat(qPrices[q]) }))
        .filter(p => !isNaN(p.value));
      if (prices.length < 2 || !qCommentary.trim()) return;
      setResults(validatePriceCommentary(prices, qCommentary));
    } else {
      const prices = (['H1', 'H2'] as const)
        .map(h => ({ label: h, value: parseFloat(hPrices[h]) }))
        .filter(p => !isNaN(p.value));
      if (prices.length < 2 || !hCommentary.trim()) return;
      setResults(validatePriceCommentary(prices, hCommentary));
    }
  }

  function reset() {
    setResults(null);
  }

  const status = results ? getOverallStatus(results) : null;

  return (
    <div className="space-y-5">
      {/* Mode Toggle */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Price–Commentary Validation</h2>
            <p className="text-sm text-[var(--muted)] mt-0.5">Cross-check price movements against written commentary</p>
          </div>
          <div className="flex gap-1 bg-[var(--border)] rounded-lg p-0.5">
            <button onClick={() => { setMode('quarterly'); reset(); }} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${mode === 'quarterly' ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted)]'}`}>
              Quarterly
            </button>
            <button onClick={() => { setMode('half-yearly'); reset(); }} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${mode === 'half-yearly' ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted)]'}`}>
              Half-Yearly
            </button>
          </div>
        </div>

        {/* Price Inputs */}
        <div className="mb-4">
          <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block mb-2">
            {mode === 'quarterly' ? 'Quarterly Prices' : 'Half-Yearly Prices'}
          </label>
          <div className="flex gap-3">
            {mode === 'quarterly' ? (
              (['Q1', 'Q2', 'Q3', 'Q4'] as const).map(q => (
                <div key={q} className="flex-1">
                  <label className="text-[10px] font-semibold text-[var(--muted)] block mb-1">{q}</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={qPrices[q]}
                    onChange={e => { setQPrices(p => ({ ...p, [q]: e.target.value })); reset(); }}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--foreground)] text-sm text-center focus:border-blue-500 outline-none"
                  />
                </div>
              ))
            ) : (
              (['H1', 'H2'] as const).map(h => (
                <div key={h} className="flex-1">
                  <label className="text-[10px] font-semibold text-[var(--muted)] block mb-1">{h}</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={hPrices[h]}
                    onChange={e => { setHPrices(p => ({ ...p, [h]: e.target.value })); reset(); }}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--foreground)] text-sm text-center focus:border-blue-500 outline-none"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Commentary Input */}
        <div className="mb-4">
          <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block mb-2">
            {mode === 'quarterly' ? 'Quarterly Commentary' : 'Half-Yearly Commentary'}
          </label>
          <textarea
            value={mode === 'quarterly' ? qCommentary : hCommentary}
            onChange={e => {
              mode === 'quarterly' ? setQCommentary(e.target.value) : setHCommentary(e.target.value);
              reset();
            }}
            placeholder={`Enter your ${mode === 'quarterly' ? 'quarterly' : 'half-yearly'} price analysis commentary here. Include observations about price trends, market conditions, and directional movements for each period...`}
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--foreground)] text-sm resize-none focus:border-blue-500 outline-none placeholder:text-[var(--muted)]"
          />
        </div>

        <button
          onClick={runValidation}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-md"
        >
          Validate Commentary
        </button>
      </div>

      {/* Results */}
      {results && status && (
        <>
          {/* Overall Status */}
          <div className={`rounded-xl border-2 p-5 ${
            status === 'consistent' ? 'bg-green-500/5 border-green-500/30' :
            status === 'partial' ? 'bg-yellow-500/5 border-yellow-500/30' :
            'bg-red-500/5 border-red-500/30'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {status === 'consistent' ? '✅' : status === 'partial' ? '⚠️' : '❌'}
              </span>
              <div>
                <h3 className={`font-bold text-lg ${
                  status === 'consistent' ? 'text-green-500' :
                  status === 'partial' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {status === 'consistent' ? 'Fully Consistent' :
                   status === 'partial' ? 'Partial Mismatch' :
                   'Major Inconsistencies'}
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  {results.filter(r => r.isConsistent).length}/{results.length} period transitions are consistent
                </p>
              </div>
            </div>
          </div>

          {/* Period-by-Period Results */}
          {results.map((v, idx) => (
            <div key={idx} className={`bg-[var(--surface)] rounded-xl border ${v.isConsistent ? 'border-[var(--border)]' : 'border-red-500/40'} p-5`}>
              {/* Period Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${v.isConsistent ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {v.isConsistent ? '✓' : '✗'}
                  </span>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)]">{v.fromLabel} → {v.toLabel}</h4>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-[var(--muted)]">{v.priceFrom.toFixed(2)} → {v.priceTo.toFixed(2)}</span>
                      <span className={`text-xs font-bold ${v.priceChange > 0 ? 'text-green-500' : v.priceChange < 0 ? 'text-red-500' : 'text-[var(--muted)]'}`}>
                        {v.priceChange > 0 ? '+' : ''}{v.priceChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direction Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[var(--surface-secondary)] rounded-lg p-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Price Direction</p>
                  <p className={`text-sm font-semibold ${dirColor[v.priceDirection]}`}>{dirLabel[v.priceDirection]}</p>
                </div>
                <div className="bg-[var(--surface-secondary)] rounded-lg p-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Commentary Direction</p>
                  <p className={`text-sm font-semibold ${dirColor[v.commentaryDirection]}`}>{dirLabel[v.commentaryDirection]}</p>
                </div>
              </div>

              {/* Mismatch Alert */}
              {!v.isConsistent && v.mismatchReason && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3">
                  <p className="text-xs font-semibold text-red-500 mb-1">Mismatch Detected</p>
                  <p className="text-xs text-red-400">{v.mismatchReason}</p>
                  {v.suggestion && (
                    <p className="text-xs text-[var(--muted)] mt-2 italic">💡 {v.suggestion}</p>
                  )}
                </div>
              )}

              {/* Matched Sentences */}
              {v.matchedSentences.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Analyzed Sentences</p>
                  <div className="space-y-1.5">
                    {v.matchedSentences.filter(s => s.direction !== 'unknown').map((s, si) => (
                      <div key={si} className={`rounded-lg px-3 py-2 border text-xs ${
                        !v.isConsistent && s.direction !== v.priceDirection && s.direction !== 'unknown' && s.direction !== 'stable'
                          ? 'bg-red-500/5 border-red-500/20'
                          : 'bg-[var(--surface-secondary)] border-[var(--border)]'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[var(--foreground)] leading-relaxed flex-1">
                            &quot;{highlightKeywords(s.text, s.keywords, !v.isConsistent && s.direction !== v.priceDirection)}&quot;
                          </p>
                          <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${dirColor[s.direction]} bg-[var(--surface)]`}>
                            {dirLabel[s.direction]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function highlightKeywords(text: string, keywords: string[], isMismatch: boolean): React.ReactNode {
  if (keywords.length === 0) return text;
  const pattern = new RegExp(`\\b(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
  const parts = text.split(pattern);
  return parts.map((part, i) => {
    if (keywords.some(k => k.toLowerCase() === part.toLowerCase())) {
      return (
        <span key={i} className={`font-bold ${isMismatch ? 'text-red-500 underline decoration-wavy' : 'text-blue-500'}`}>
          {part}
        </span>
      );
    }
    return part;
  });
}

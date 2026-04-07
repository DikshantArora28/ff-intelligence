'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { getValueChain, generateGenericValueChain } from '@/data/valueChains';

interface Props {
  product: Product;
}

const lightStageStyles = [
  { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', chipBg: 'bg-amber-100 text-amber-800 border-amber-200', icon: '⛏️' },
  { gradient: 'from-orange-500 to-red-400', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', chipBg: 'bg-orange-100 text-orange-800 border-orange-200', icon: '⚙️' },
  { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', chipBg: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🧬' },
  { gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800', chipBg: 'bg-violet-100 text-violet-800 border-violet-200', icon: '🏭' },
  { gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', chipBg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '✅' },
];

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

export default function ValueChainModule({ product }: Props) {
  const chain = getValueChain(product.id) || generateGenericValueChain(product.name, product.feedstocks, product.category);
  const isDark = useDarkMode();

  return (
    <div className="space-y-4">
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
        <div className="flex items-center justify-between mb-4">
          {isDark ? (
            <h2 className="text-sm font-bold text-[var(--foreground)]">Manufacturing Value Chain</h2>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200">
                <span className="text-white text-sm">🔗</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Manufacturing Value Chain</h2>
                <p className="text-xs text-gray-400">End-to-end production pathway</p>
              </div>
            </div>
          )}
          {isDark ? (
            <span className="text-xs text-[var(--muted)]">{chain.steps.length} stages</span>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-amber-400 via-blue-400 to-emerald-400" />
              <span className="text-xs font-semibold text-gray-500">{chain.steps.length} stages</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <div className="flex items-stretch gap-0 min-w-max">
            {chain.steps.map((step, idx) => {
              const isLast = idx === chain.steps.length - 1;

              if (isDark) {
                // Dark mode: clean subtle cards
                return (
                  <div key={idx} className="flex items-stretch">
                    <div className="w-[190px] bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                        <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider leading-none">{step.stage}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {step.items.map((item, i) => (
                          <span key={i} className="text-[11px] text-[var(--foreground)] bg-[var(--primary)]/8 border border-[var(--border)] px-2 py-0.5 rounded leading-tight">{item}</span>
                        ))}
                      </div>
                      {step.description && <p className="text-[10px] text-[var(--muted)] mt-1.5 italic leading-snug">{step.description}</p>}
                    </div>
                    {!isLast && (
                      <div className="flex items-center px-2 flex-shrink-0">
                        <span className="text-[var(--muted)] opacity-40 text-sm">→</span>
                      </div>
                    )}
                  </div>
                );
              }

              // Light mode: colorful gradient cards
              const style = lightStageStyles[idx % lightStageStyles.length];
              return (
                <div key={idx} className="flex items-start">
                  <div className="group relative w-[200px]">
                    <div className={`h-1 rounded-t-xl bg-gradient-to-r ${style.gradient}`} />
                    <div className={`${style.bg} ${style.border} border border-t-0 rounded-b-xl px-3.5 py-3 transition-all hover:shadow-lg hover:-translate-y-0.5`}>
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-sm`}>
                          <span className="text-white text-[10px] font-black">{idx + 1}</span>
                        </div>
                        <h3 className={`text-[11px] font-extrabold ${style.text} uppercase tracking-wide leading-none flex-1`}>{step.stage}</h3>
                        <span className="text-sm">{style.icon}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {step.items.map((item, i) => (
                          <span key={i} className={`${style.chipBg} border px-2 py-1 rounded-lg text-[11px] font-medium leading-tight shadow-sm`}>{item}</span>
                        ))}
                      </div>
                      {step.description && (
                        <p className="text-[10px] text-gray-500 mt-2 leading-snug border-t border-gray-200/50 pt-1.5 italic">{step.description}</p>
                      )}
                    </div>
                  </div>
                  {!isLast && (
                    <div className="flex items-center self-center px-2 pt-4 flex-shrink-0">
                      <div className="relative flex items-center">
                        <div className="w-8 h-[2px] bg-gradient-to-r from-gray-300 to-gray-400 rounded" />
                        <svg width="10" height="14" viewBox="0 0 10 14" className="text-gray-400 -ml-0.5">
                          <path d="M1 1 L8 7 L1 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {isDark ? (
          <>
            <InfoCardDark title="Key Feedstocks" items={product.feedstocks} />
            <InfoCardDark title="Major Producers" items={product.producingCountries} />
            <InfoCardDark title="Major Importers" items={product.importingCountries} />
          </>
        ) : (
          <>
            <InfoCardLight icon="🧪" iconGradient="from-amber-500 to-orange-500" title="Key Feedstocks" items={product.feedstocks} chipColor="bg-amber-50 text-amber-700 border-amber-200" />
            <InfoCardLight icon="🌍" iconGradient="from-blue-500 to-cyan-500" title="Major Producers" items={product.producingCountries} chipColor="bg-blue-50 text-blue-700 border-blue-200" />
            <InfoCardLight icon="📦" iconGradient="from-emerald-500 to-teal-500" title="Major Importers" items={product.importingCountries} chipColor="bg-emerald-50 text-emerald-700 border-emerald-200" />
          </>
        )}
      </div>
    </div>
  );
}

function InfoCardDark({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] px-4 py-3">
      <h4 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2">{title}</h4>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <span key={i} className="text-xs text-[var(--foreground)] bg-[var(--surface-secondary)] border border-[var(--border)] px-2 py-0.5 rounded">{item}</span>
        ))}
      </div>
    </div>
  );
}

function InfoCardLight({ icon, iconGradient, title, items, chipColor }: {
  icon: string; iconGradient: string; title: string; items: string[]; chipColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-sm`}>
          <span className="text-sm">{icon}</span>
        </div>
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{title}</h4>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className={`text-xs ${chipColor} border px-2.5 py-1 rounded-lg font-medium`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

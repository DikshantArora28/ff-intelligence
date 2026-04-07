'use client';

import { getMarketShare, CountryShare } from '@/data/marketShare';

interface Props {
  productId: string;
  productName: string;
}

function ShareBar({ data, color }: { data: CountryShare[]; color: string }) {
  const sorted = [...data].sort((a, b) => b.share - a.share);
  return (
    <div className="space-y-2">
      {sorted.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <span className="text-xs font-medium text-[var(--foreground)] opacity-80 w-36 truncate" title={item.country}>
            {item.country}
          </span>
          <div className="flex-1 h-5 bg-[var(--border)] rounded-full overflow-hidden relative">
            <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${item.share}%` }} />
            <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-bold text-[var(--foreground)] opacity-70">
              {item.share}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MarketSharePanel({ productId, productName }: Props) {
  const data = getMarketShare(productId);
  if (!data) return null;

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
            <span className="text-white text-sm">🌐</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">Global Supply Landscape</h2>
            <p className="text-xs text-[var(--muted)]">{productName} — Tentative market distribution</p>
          </div>
        </div>
        {data.globalMarketSize && (
          <div className="text-right">
            <p className="text-xs text-[var(--muted)]">Est. Market Size</p>
            <p className="text-lg font-bold text-indigo-400">{data.globalMarketSize}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Global Production Share</h3>
          </div>
          <ShareBar data={data.productionShares} color="bg-gradient-to-r from-blue-400 to-blue-600" />
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[var(--border)]">
            {data.productionShares.slice(0, 4).map((item, idx) => (
              <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
                {item.country}: {item.share}%
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Global Import Share</h3>
          </div>
          <ShareBar data={data.importShares} color="bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[var(--border)]">
            {data.importShares.slice(0, 4).map((item, idx) => (
              <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                {item.country}: {item.share}%
              </span>
            ))}
          </div>
        </div>
      </div>

      {data.source && (
        <p className="text-[10px] text-[var(--muted)] mt-4 pt-3 border-t border-[var(--border)] italic">
          Sources: {data.source}. Figures are tentative estimates based on published market research and government trade data.
        </p>
      )}
    </div>
  );
}

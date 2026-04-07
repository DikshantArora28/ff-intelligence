'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, NewsItem } from '@/types';

interface Props {
  product: Product;
}

const impactColors = {
  Critical: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', dot: 'bg-red-500' },
  High: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20', dot: 'bg-orange-500' },
  Medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20', dot: 'bg-yellow-500' },
  Low: { bg: 'bg-[var(--surface-secondary)]', text: 'text-[var(--muted)]', border: 'border-[var(--border)]', dot: 'bg-[var(--muted)]' },
};

export default function MarketNewsModule({ product }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Critical' | 'High' | 'Medium' | 'Low'>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('global');

  // Build country list from product's producing + importing countries, plus global
  const countryOptions = (() => {
    const countries = new Set<string>();
    product.producingCountries.forEach(c => countries.add(c));
    product.importingCountries.forEach(c => countries.add(c));
    return ['global', ...Array.from(countries)];
  })();

  const loadNews = useCallback(async (country: string) => {
    setLoading(true);
    try {
      const searchTerms = [product.name, ...product.synonyms.slice(0, 2)].join(' OR ');
      const countryParam = country !== 'global' ? `&country=${encodeURIComponent(country)}` : '';
      const res = await fetch(`/api/news?q=${encodeURIComponent(searchTerms)}${countryParam}`);
      const data = await res.json();
      setNews(data.articles || []);
    } catch {
      setNews([]);
    }
    setLoading(false);
  }, [product.name, product.synonyms]);

  useEffect(() => {
    loadNews(selectedCountry);
  }, [selectedCountry, loadNews]);

  const filtered = filter === 'all' ? news : news.filter(n => n.impact === filter);

  const trendSummary = () => {
    const positive = news.filter(n => n.sentiment === 'positive').length;
    const negative = news.filter(n => n.sentiment === 'negative').length;
    if (positive > negative) return { direction: 'Bullish', color: 'text-green-500', bg: 'bg-green-500/10' };
    if (negative > positive) return { direction: 'Bearish', color: 'text-red-500', bg: 'bg-red-500/10' };
    return { direction: 'Neutral', color: 'text-[var(--muted)]', bg: 'bg-[var(--surface-secondary)]' };
  };
  const trend = trendSummary();

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-[var(--foreground)]">Market News</h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">Last 30 days | Auto-refreshed</p>
        </div>
        <div className={`${trend.bg} px-3 py-1 rounded-full`}>
          <span className={`text-xs font-semibold ${trend.color}`}>Trend: {trend.direction}</span>
        </div>
      </div>

      {/* Country Selector */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {countryOptions.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCountry(c)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                selectedCountry === c
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[var(--surface-secondary)] text-[var(--muted)] border border-[var(--border)] hover:bg-[var(--card-hover)]'
              }`}
            >
              {c === 'global' ? '🌐 Global' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Impact Filters */}
      <div className="flex gap-1 mb-3">
        {(['all', 'Critical', 'High', 'Medium', 'Low'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-[var(--surface-secondary)] text-[var(--muted)] hover:bg-[var(--card-hover)]'
            }`}
          >
            {f === 'all' ? 'All' : f}
            {f !== 'all' && <span className="ml-0.5 opacity-75">({news.filter(n => n.impact === f).length})</span>}
          </button>
        ))}
      </div>

      {/* News List */}
      <div className="space-y-2 max-h-[480px] overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-xs text-[var(--muted)]">
              {selectedCountry === 'global' ? 'Fetching global news...' : `Fetching ${selectedCountry} news...`}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--muted)]">No news articles found</p>
        ) : (
          filtered.map((item, idx) => {
            const colors = impactColors[item.impact];
            return (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${colors.bg} ${colors.border} border rounded-lg p-2.5 block hover:scale-[1.005] transition-all cursor-pointer`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} flex-shrink-0`} />
                      <span className={`text-[10px] font-semibold ${colors.text} uppercase`}>{item.impact}</span>
                      <span className="text-[10px] text-[var(--muted)]">{item.source}</span>
                    </div>
                    <span className="text-sm font-medium text-[var(--foreground)] leading-snug block line-clamp-2">
                      {item.title}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      item.sentiment === 'positive' ? 'bg-green-500/15 text-green-500' :
                      item.sentiment === 'negative' ? 'bg-red-500/15 text-red-500' :
                      'bg-[var(--surface-secondary)] text-[var(--muted)]'
                    }`}>
                      {item.sentiment === 'positive' ? '↑' : item.sentiment === 'negative' ? '↓' : '→'}
                    </span>
                    <p className="text-[10px] text-[var(--muted)] mt-0.5">
                      {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}

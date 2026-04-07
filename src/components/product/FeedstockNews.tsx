'use client';

import { useState, useEffect } from 'react';
import { Product, NewsItem } from '@/types';

interface Props {
  product: Product;
}

export default function FeedstockNewsModule({ product }: Props) {
  const [feedstockNews, setFeedstockNews] = useState<Record<string, NewsItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeFeedstock, setActiveFeedstock] = useState<string>(product.feedstocks[0] || '');

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      const newsMap: Record<string, NewsItem[]> = {};
      const feedstocksToFetch = product.feedstocks.slice(0, 3);
      await Promise.all(
        feedstocksToFetch.map(async (feedstock) => {
          try {
            const res = await fetch(`/api/news?q=${encodeURIComponent(feedstock + ' price market')}`);
            const data = await res.json();
            newsMap[feedstock] = data.articles || [];
          } catch { newsMap[feedstock] = []; }
        })
      );
      setFeedstockNews(newsMap);
      if (feedstocksToFetch.length > 0) setActiveFeedstock(feedstocksToFetch[0]);
      setLoading(false);
    }
    loadNews();
  }, [product.feedstocks]);

  const activeNews = feedstockNews[activeFeedstock] || [];

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
      <div className="mb-3">
        <h3 className="font-semibold text-[var(--foreground)]">Feedstock News</h3>
        <p className="text-xs text-[var(--muted)] mt-0.5">Impact analysis of upstream raw materials</p>
      </div>

      {/* Feedstock Tabs */}
      <div className="flex flex-wrap gap-1 mb-3">
        {product.feedstocks.slice(0, 5).map(fs => (
          <button
            key={fs}
            onClick={() => setActiveFeedstock(fs)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
              activeFeedstock === fs
                ? 'bg-indigo-600 text-white'
                : 'bg-[var(--surface-secondary)] text-[var(--muted)] border border-[var(--border)] hover:bg-[var(--card-hover)]'
            }`}
          >
            {fs}
          </button>
        ))}
      </div>

      {/* Impact Link */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-indigo-400 text-sm">🔗</span>
          <div>
            <p className="text-xs font-semibold text-indigo-400">Feedstock Impact on {product.name}</p>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              Changes in <strong className="text-[var(--foreground)]">{activeFeedstock}</strong> pricing directly affect {product.name} production costs and market pricing.
            </p>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-xs text-[var(--muted)]">Fetching feedstock news...</p>
          </div>
        ) : activeNews.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--muted)]">No feedstock news found for {activeFeedstock}</p>
        ) : (
          activeNews.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg p-2.5 block hover:scale-[1.005] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  item.impact === 'Critical' ? 'bg-red-500' :
                  item.impact === 'High' ? 'bg-orange-500' :
                  item.impact === 'Medium' ? 'bg-yellow-500' : 'bg-[var(--muted)]'
                }`} />
                <span className="text-[10px] font-medium text-[var(--muted)] uppercase">{item.impact}</span>
                <span className="text-[10px] text-[var(--muted)]">|</span>
                <span className="text-[10px] text-[var(--muted)]">{item.source}</span>
                <span className="text-[10px] text-[var(--muted)] ml-auto">
                  {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <span className="text-sm font-medium text-[var(--foreground)] leading-snug block line-clamp-2">
                {item.title}
              </span>
            </a>
          ))
        )}
      </div>
    </div>
  );
}

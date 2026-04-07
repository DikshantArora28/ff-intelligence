'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { getProductById } from '@/data/products';
import ValueChainModule from '@/components/product/ValueChain';
import MarketNewsModule from '@/components/product/MarketNews';
import FeedstockNewsModule from '@/components/product/FeedstockNews';
import SeasonalityModule from '@/components/product/SeasonalityChart';
import ForecastModule from '@/components/product/ForecastEngine';
import MarketSharePanel from '@/components/product/MarketSharePanel';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = getProductById(id);
  const [activeTab, setActiveTab] = useState<'value-chain' | 'news' | 'seasonality' | 'forecast'>('value-chain');

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-4">The product you are looking for does not exist.</p>
        <Link href="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const tabs = [
    { key: 'value-chain' as const, label: 'Value Chain', icon: '🔗' },
    { key: 'news' as const, label: 'Market Intelligence', icon: '📰' },
    { key: 'seasonality' as const, label: 'Seasonality', icon: '📊' },
    { key: 'forecast' as const, label: 'Forecasting', icon: '📈' },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--primary-light)] transition-colors mb-2 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                product.category === 'fragrance'
                  ? 'bg-purple-500/15 text-purple-400'
                  : 'bg-emerald-500/15 text-emerald-400'
              }`}>
                {product.category === 'fragrance' ? 'Fragrance' : 'Flavour'}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--muted)]/10 text-[var(--muted)] font-medium">
                {product.bucket}
              </span>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="text-[var(--muted)]">Synonyms: <span className="text-[var(--foreground)] opacity-80">{product.synonyms.join(', ') || 'N/A'}</span></div>
            <div className="text-[var(--muted)] mt-1">Key Producers: <span className="text-[var(--foreground)] opacity-80">{product.producingCountries.join(', ')}</span></div>
          </div>
        </div>
      </div>

      {/* Module Tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--border)] rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.key
                ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Module Content */}
      <div>
        {activeTab === 'value-chain' && (
          <div className="space-y-6">
            <ValueChainModule product={product} />
            <MarketSharePanel productId={product.id} productName={product.name} />
          </div>
        )}
        {activeTab === 'news' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MarketNewsModule product={product} />
            <FeedstockNewsModule product={product} />
          </div>
        )}
        {activeTab === 'seasonality' && <SeasonalityModule productId={product.id} />}
        {activeTab === 'forecast' && <ForecastModule productId={product.id} />}
      </div>
    </div>
  );
}

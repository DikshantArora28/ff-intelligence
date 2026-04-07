'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { products, fragranceBuckets, flavourBuckets } from '@/data/products';
import { Category, Bucket, Product } from '@/types';
import { usePriceData } from '@/lib/priceStore';
import BulkUpload from '@/components/BulkUpload';

const categoryConfig = {
  fragrance: {
    label: 'Fragrance',
    buckets: fragranceBuckets,
    activeBg: 'bg-purple-600',
    activeBucket: 'bg-purple-600/10 text-purple-400 border-purple-500/40',
    tag: 'text-purple-400 bg-purple-500/15',
  },
  flavour: {
    label: 'Flavour',
    buckets: flavourBuckets,
    activeBg: 'bg-emerald-600',
    activeBucket: 'bg-emerald-600/10 text-emerald-400 border-emerald-500/40',
    tag: 'text-emerald-400 bg-emerald-500/15',
  },
};

const bucketIcons: Record<string, string> = {
  'Petrochemical': '🧪', 'Oleo Chemical': '🫒', 'Turpentine': '🌲',
  'Naturals': '🌿', 'Others': '📦', 'Chicken / Beef / Meat': '🥩',
  'Dairy and Cheese': '🧀', 'Onion and Garlic': '🧅', 'Citrus': '🍋',
  'Fish / Seafood': '🐟', 'Spice': '🌶️', 'Herbs': '🌱',
};

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState<Category>('fragrance');
  const [activeBucket, setActiveBucket] = useState<Bucket>('Petrochemical');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { productCount } = usePriceData();

  const config = categoryConfig[activeCategory];

  // If searching, show results across all categories/buckets
  const isSearching = searchQuery.trim().length > 0;
  const filteredProducts = isSearching
    ? products.filter(p => {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q)
          || p.synonyms.some(s => s.toLowerCase().includes(q))
          || p.bucket.toLowerCase().includes(q)
          || p.feedstocks.some(f => f.toLowerCase().includes(q));
      })
    : products.filter(p => p.category === activeCategory && p.bucket === activeBucket);

  function handleCategoryChange(cat: Category) {
    setActiveCategory(cat);
    setActiveBucket(cat === 'fragrance' ? 'Petrochemical' : 'Chicken / Beef / Meat');
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-5">
      {/* Search + Category Tabs + Bulk Upload */}
      <div className="flex items-center gap-2 mb-4">
        {/* Search Bar */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-48 pl-9 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] text-xs">✕</button>
          )}
        </div>

        {(Object.keys(categoryConfig) as Category[]).map(cat => {
          const c = categoryConfig[cat];
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                isActive
                  ? `${c.activeBg} text-white shadow-lg`
                  : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:bg-[var(--card-hover)]'
              }`}
            >
              {c.label}
              <span className={`ml-2 text-xs ${isActive ? 'bg-white/20' : 'opacity-60'} px-1.5 py-0.5 rounded-full`}>
                {products.filter(p => p.category === cat).length}
              </span>
            </button>
          );
        })}

        {/* Bulk Upload Button */}
        <div className="ml-auto flex items-center gap-2">
          {productCount > 0 && (
            <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full font-medium">
              {productCount} products loaded
            </span>
          )}
          <button
            onClick={() => setShowBulkUpload(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1v9m0 0L5 7m3 3l3-3M2 12v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Upload All Prices
          </button>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      <BulkUpload open={showBulkUpload} onClose={() => setShowBulkUpload(false)} />

      {/* Sub-bucket Navigation (hidden when searching) */}
      {!isSearching && <div className="flex flex-wrap gap-1.5 mb-4">
        {config.buckets.map(bucket => {
          const isActive = activeBucket === bucket;
          const count = products.filter(p => p.category === activeCategory && p.bucket === bucket).length;
          return (
            <button
              key={bucket}
              onClick={() => setActiveBucket(bucket)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? `${config.activeBucket} border`
                  : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:bg-[var(--card-hover)]'
              }`}
            >
              <span className="text-sm">{bucketIcons[bucket] || '📦'}</span>
              {bucket}
              <span className="opacity-50">({count})</span>
            </button>
          );
        })}
      </div>}

      {/* Search results header */}
      {isSearching && (
        <div className="mb-3 text-sm text-[var(--muted)]">
          Found <strong className="text-[var(--foreground)]">{filteredProducts.length}</strong> results for &quot;{searchQuery}&quot;
        </div>
      )}

      {/* Products - Compact Table/List */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs text-[var(--muted)] uppercase tracking-wider">
              <th className="text-left py-2.5 px-4 font-semibold">Product</th>
              <th className="text-left py-2.5 px-4 font-semibold hidden sm:table-cell">Synonym</th>
              <th className="text-left py-2.5 px-4 font-semibold hidden md:table-cell">Key Producers</th>
              <th className="text-left py-2.5 px-4 font-semibold hidden lg:table-cell">Key Importers</th>
              <th className="text-right py-2.5 px-4 font-semibold w-8"></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, idx) => (
              <ProductRow key={product.id} product={product} config={config} isLast={idx === filteredProducts.length - 1} />
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-[var(--muted)]">
            <p>No products in this category yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductRow({ product, isLast }: { product: Product; config: typeof categoryConfig.fragrance; isLast: boolean }) {
  const router = useRouter();
  return (
    <tr
      onClick={() => router.push(`/product/${product.id}`)}
      className={`hover:bg-[var(--card-hover)] transition-colors cursor-pointer group ${!isLast ? 'border-b border-[var(--border)]' : ''}`}
    >
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-2.5">
          <span className="text-sm">{bucketIcons[product.bucket] || '📦'}</span>
          <span className="font-semibold text-sm text-[var(--foreground)] group-hover:text-[var(--primary-light)] transition-colors">
            {product.name}
          </span>
        </div>
      </td>
      <td className="py-2.5 px-4 hidden sm:table-cell">
        <span className="text-xs text-[var(--muted)] truncate block max-w-[180px]">
          {product.synonyms[0] || '—'}
        </span>
      </td>
      <td className="py-2.5 px-4 hidden md:table-cell">
        <div className="flex items-center gap-1 flex-wrap">
          {product.producingCountries.slice(0, 3).map((c, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">{c}</span>
          ))}
          {product.producingCountries.length > 3 && (
            <span className="text-[10px] text-[var(--muted)]">+{product.producingCountries.length - 3}</span>
          )}
        </div>
      </td>
      <td className="py-2.5 px-4 hidden lg:table-cell">
        <div className="flex items-center gap-1 flex-wrap">
          {product.importingCountries.slice(0, 3).map((c, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">{c}</span>
          ))}
          {product.importingCountries.length > 3 && (
            <span className="text-[10px] text-[var(--muted)]">+{product.importingCountries.length - 3}</span>
          )}
        </div>
      </td>
      <td className="py-2.5 px-4 text-right">
        <span className="text-[var(--muted)] group-hover:text-[var(--primary-light)] transition-colors text-xs">→</span>
      </td>
    </tr>
  );
}

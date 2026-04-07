export type Category = 'fragrance' | 'flavour';

export type FragranceBucket = 'Petrochemical' | 'Oleo Chemical' | 'Turpentine' | 'Naturals' | 'Others';
export type FlavourBucket = 'Chicken / Beef / Meat' | 'Dairy and Cheese' | 'Onion and Garlic' | 'Citrus' | 'Fish / Seafood' | 'Spice' | 'Herbs';

export type Bucket = FragranceBucket | FlavourBucket;

export interface Product {
  id: string;
  name: string;
  category: Category;
  bucket: Bucket;
  synonyms: string[];
  feedstocks: string[];
  producingCountries: string[];
  importingCountries: string[];
}

export interface ValueChainStep {
  stage: string;
  items: string[];
  description?: string;
}

export interface ValueChain {
  productId: string;
  steps: ValueChainStep[];
}

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface PriceData {
  date: string; // YYYY-MM format
  price: number;
}

export type SeasonalityPeriod = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

export interface SeasonalityResult {
  period: string;
  years: number[];
  data: Record<string, Record<number, number | null>>; // period label -> year -> % change
}

export interface ForecastModel {
  name: string;
  method: 'arima' | 'holt-winters' | 'regression';
  forecast: number[];
  actual: number[];
  mape: number;
  dates: string[];
}

export interface BacktestResult {
  models: ForecastModel[];
  bestModel: string;
  trainPeriod: string;
  testPeriod: string;
}

export interface ForwardForecastResult {
  models: { name: string; method: string; forecast: number[]; dates: string[] }[];
  bestModel: string; // recommended based on backtest
  historicalPrices: number[];
  historicalDates: string[];
}

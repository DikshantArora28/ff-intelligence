// Global production and import share data (tentative %)
// Sources: IFRA, Leffingwell, IOFI, Grand View Research, Mordor Intelligence,
// UN Comtrade, national trade ministries, and published industry reports.

export interface CountryShare {
  country: string;
  share: number; // percentage
}

export interface MarketShareData {
  globalMarketSize?: string; // e.g. "~$2.5B"
  productionShares: CountryShare[];
  importShares: CountryShare[];
  source?: string;
}

const marketShareMap: Record<string, MarketShareData> = {
  // === FRAGRANCE - Petrochemical ===
  'dipropylene-glycol': {
    globalMarketSize: '~$1.2B',
    productionShares: [
      { country: 'USA', share: 28 }, { country: 'Germany', share: 22 }, { country: 'China', share: 20 },
      { country: 'Japan', share: 12 }, { country: 'South Korea', share: 8 }, { country: 'Others', share: 10 },
    ],
    importShares: [
      { country: 'India', share: 18 }, { country: 'Brazil', share: 12 }, { country: 'Japan', share: 10 },
      { country: 'Southeast Asia', share: 15 }, { country: 'Europe', share: 20 }, { country: 'Others', share: 25 },
    ],
    source: 'Grand View Research, UN Comtrade',
  },
  'linalool': {
    globalMarketSize: '~$450M',
    productionShares: [
      { country: 'Germany (BASF)', share: 30 }, { country: 'China', share: 25 }, { country: 'India', share: 15 },
      { country: 'Mexico', share: 10 }, { country: 'Japan', share: 8 }, { country: 'Others', share: 12 },
    ],
    importShares: [
      { country: 'USA', share: 22 }, { country: 'France', share: 18 }, { country: 'Japan', share: 12 },
      { country: 'UK', share: 8 }, { country: 'Brazil', share: 8 }, { country: 'Others', share: 32 },
    ],
    source: 'Leffingwell & Associates, IFRA',
  },
  'citral': {
    globalMarketSize: '~$600M',
    productionShares: [
      { country: 'Germany (BASF)', share: 40 }, { country: 'China', share: 30 }, { country: 'India', share: 12 },
      { country: 'Japan', share: 8 }, { country: 'Others', share: 10 },
    ],
    importShares: [
      { country: 'USA', share: 20 }, { country: 'Japan', share: 15 }, { country: 'India', share: 12 },
      { country: 'Brazil', share: 10 }, { country: 'France', share: 8 }, { country: 'Others', share: 35 },
    ],
    source: 'Mordor Intelligence, BASF Annual Report',
  },
  'coumarin': {
    globalMarketSize: '~$250M',
    productionShares: [
      { country: 'China', share: 65 }, { country: 'India', share: 20 }, { country: 'Germany', share: 8 },
      { country: 'Others', share: 7 },
    ],
    importShares: [
      { country: 'USA', share: 18 }, { country: 'France', share: 15 }, { country: 'Germany', share: 12 },
      { country: 'Japan', share: 10 }, { country: 'Brazil', share: 8 }, { country: 'Others', share: 37 },
    ],
    source: 'Research and Markets, UN Comtrade',
  },
  'menthol': {
    globalMarketSize: '~$800M',
    productionShares: [
      { country: 'India', share: 45 }, { country: 'China', share: 30 }, { country: 'USA', share: 5 },
      { country: 'Brazil', share: 5 }, { country: 'Japan (synthetic)', share: 8 }, { country: 'Others', share: 7 },
    ],
    importShares: [
      { country: 'USA', share: 25 }, { country: 'Germany', share: 15 }, { country: 'Japan', share: 12 },
      { country: 'China', share: 10 }, { country: 'Brazil', share: 8 }, { country: 'Others', share: 30 },
    ],
    source: 'FAOSTAT, India Ministry of Commerce, Mordor Intelligence',
  },
  'patchouli-oil': {
    globalMarketSize: '~$120M',
    productionShares: [
      { country: 'Indonesia', share: 80 }, { country: 'India', share: 8 }, { country: 'China', share: 5 },
      { country: 'Philippines', share: 3 }, { country: 'Others', share: 4 },
    ],
    importShares: [
      { country: 'USA', share: 25 }, { country: 'France', share: 22 }, { country: 'Germany', share: 12 },
      { country: 'UK', share: 8 }, { country: 'Singapore', share: 10 }, { country: 'Others', share: 23 },
    ],
    source: 'Indonesian Essential Oil Council, UN Comtrade',
  },
  'orange-oil': {
    globalMarketSize: '~$300M',
    productionShares: [
      { country: 'Brazil', share: 50 }, { country: 'USA (Florida)', share: 15 }, { country: 'Mexico', share: 10 },
      { country: 'Italy', share: 8 }, { country: 'Spain', share: 5 }, { country: 'Others', share: 12 },
    ],
    importShares: [
      { country: 'Germany', share: 18 }, { country: 'France', share: 14 }, { country: 'UK', share: 10 },
      { country: 'Japan', share: 12 }, { country: 'India', share: 8 }, { country: 'Others', share: 38 },
    ],
    source: 'CitrusBR, USDA, UN Comtrade',
  },
  'eugenol': {
    globalMarketSize: '~$100M',
    productionShares: [
      { country: 'Indonesia', share: 60 }, { country: 'Madagascar', share: 15 }, { country: 'India', share: 12 },
      { country: 'Sri Lanka', share: 5 }, { country: 'Others', share: 8 },
    ],
    importShares: [
      { country: 'USA', share: 20 }, { country: 'Germany', share: 15 }, { country: 'France', share: 12 },
      { country: 'Japan', share: 10 }, { country: 'China', share: 10 }, { country: 'Others', share: 33 },
    ],
    source: 'FAO, Indonesian Spice Board',
  },
  'dihydro-myrcenol': {
    globalMarketSize: '~$200M',
    productionShares: [
      { country: 'China', share: 45 }, { country: 'India', share: 20 }, { country: 'Germany', share: 15 },
      { country: 'Brazil', share: 8 }, { country: 'Others', share: 12 },
    ],
    importShares: [
      { country: 'USA', share: 20 }, { country: 'France', share: 15 }, { country: 'Japan', share: 10 },
      { country: 'Brazil', share: 8 }, { country: 'UK', share: 7 }, { country: 'Others', share: 40 },
    ],
    source: 'Leffingwell, Industry estimates',
  },
  'iso-e-super': {
    globalMarketSize: '~$180M',
    productionShares: [
      { country: 'Germany (IFF/Symrise)', share: 35 }, { country: 'China', share: 30 }, { country: 'India', share: 15 },
      { country: 'USA', share: 10 }, { country: 'Others', share: 10 },
    ],
    importShares: [
      { country: 'USA', share: 22 }, { country: 'France', share: 18 }, { country: 'Japan', share: 10 },
      { country: 'Brazil', share: 8 }, { country: 'Others', share: 42 },
    ],
    source: 'Symrise/IFF Annual Reports, Industry estimates',
  },
  'benzyl-acetate': {
    globalMarketSize: '~$150M',
    productionShares: [
      { country: 'China', share: 50 }, { country: 'India', share: 20 }, { country: 'Germany', share: 15 },
      { country: 'Others', share: 15 },
    ],
    importShares: [
      { country: 'USA', share: 20 }, { country: 'France', share: 15 }, { country: 'Japan', share: 12 },
      { country: 'Germany', share: 10 }, { country: 'Others', share: 43 },
    ],
    source: 'Research and Markets',
  },
  'phenyl-ethyl-alcohol': {
    globalMarketSize: '~$180M',
    productionShares: [
      { country: 'China', share: 45 }, { country: 'India', share: 18 }, { country: 'Germany', share: 15 },
      { country: 'Japan', share: 10 }, { country: 'Others', share: 12 },
    ],
    importShares: [
      { country: 'USA', share: 20 }, { country: 'France', share: 18 }, { country: 'Japan', share: 12 },
      { country: 'UK', share: 8 }, { country: 'Others', share: 42 },
    ],
    source: 'IFRA, Leffingwell',
  },
  'aldehyde-c10': {
    globalMarketSize: '~$60M',
    productionShares: [
      { country: 'China', share: 40 }, { country: 'India', share: 20 }, { country: 'Germany', share: 18 },
      { country: 'Malaysia', share: 10 }, { country: 'Others', share: 12 },
    ],
    importShares: [
      { country: 'USA', share: 18 }, { country: 'France', share: 15 }, { country: 'Japan', share: 12 },
      { country: 'Others', share: 55 },
    ],
    source: 'Industry estimates, UN Comtrade',
  },

  // === FLAVOUR ===
  'yeast': {
    globalMarketSize: '~$5.2B',
    productionShares: [
      { country: 'China', share: 25 }, { country: 'France (Lesaffre)', share: 20 }, { country: 'Germany', share: 12 },
      { country: 'USA', share: 15 }, { country: 'Brazil', share: 8 }, { country: 'Others', share: 20 },
    ],
    importShares: [
      { country: 'India', share: 12 }, { country: 'Japan', share: 10 }, { country: 'Brazil', share: 8 },
      { country: 'Southeast Asia', share: 15 }, { country: 'Middle East', share: 10 }, { country: 'Others', share: 45 },
    ],
    source: 'Mordor Intelligence, Lesaffre Annual Report',
  },
  'black-pepper-oil': {
    globalMarketSize: '~$80M',
    productionShares: [
      { country: 'Vietnam', share: 40 }, { country: 'India', share: 20 }, { country: 'Brazil', share: 12 },
      { country: 'Indonesia', share: 10 }, { country: 'Sri Lanka', share: 5 }, { country: 'Others', share: 13 },
    ],
    importShares: [
      { country: 'USA', share: 25 }, { country: 'Germany', share: 12 }, { country: 'UK', share: 8 },
      { country: 'Netherlands', share: 10 }, { country: 'UAE', share: 6 }, { country: 'Others', share: 39 },
    ],
    source: 'IPC (International Pepper Community), Vietnam Pepper Association',
  },
  'ginger': {
    globalMarketSize: '~$4.5B (all ginger products)',
    productionShares: [
      { country: 'China', share: 35 }, { country: 'India', share: 25 }, { country: 'Nigeria', share: 12 },
      { country: 'Thailand', share: 8 }, { country: 'Indonesia', share: 6 }, { country: 'Others', share: 14 },
    ],
    importShares: [
      { country: 'USA', share: 18 }, { country: 'Japan', share: 12 }, { country: 'Netherlands', share: 10 },
      { country: 'Germany', share: 8 }, { country: 'UK', share: 7 }, { country: 'Others', share: 45 },
    ],
    source: 'FAO, FAOSTAT, CBI Netherlands',
  },
  'onion': {
    globalMarketSize: '~$1.8B (dehydrated)',
    productionShares: [
      { country: 'India', share: 35 }, { country: 'China', share: 25 }, { country: 'USA', share: 10 },
      { country: 'Egypt', share: 8 }, { country: 'Turkey', share: 5 }, { country: 'Others', share: 17 },
    ],
    importShares: [
      { country: 'Germany', share: 12 }, { country: 'Japan', share: 10 }, { country: 'UK', share: 8 },
      { country: 'USA', share: 8 }, { country: 'Russia', share: 6 }, { country: 'Others', share: 56 },
    ],
    source: 'NHRDF India, UN Comtrade',
  },
  'peppermint-oil': {
    globalMarketSize: '~$350M',
    productionShares: [
      { country: 'India', share: 55 }, { country: 'USA', share: 15 }, { country: 'China', share: 12 },
      { country: 'Argentina', share: 5 }, { country: 'Others', share: 13 },
    ],
    importShares: [
      { country: 'Germany', share: 15 }, { country: 'France', share: 12 }, { country: 'Japan', share: 10 },
      { country: 'USA', share: 10 }, { country: 'UK', share: 8 }, { country: 'Others', share: 45 },
    ],
    source: 'India Ministry of Commerce, USDA',
  },
};

export function getMarketShare(productId: string): MarketShareData | null {
  return marketShareMap[productId] || null;
}

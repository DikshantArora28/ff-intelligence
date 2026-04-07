import { NewsItem } from '@/types';

const NEWS_API_KEY = process.env.NEWS_API_KEY || '';

interface NewsApiArticle {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  publishedAt: string;
}

// Country-specific Google News config: language, geo code, and local product name translations
interface CountryNewsConfig {
  hl: string; // language code
  gl: string; // country code
  ceid: string; // country:language
  label: string;
}

const COUNTRY_NEWS_CONFIG: Record<string, CountryNewsConfig> = {
  'global': { hl: 'en', gl: 'US', ceid: 'US:en', label: 'Global' },
  'US': { hl: 'en', gl: 'US', ceid: 'US:en', label: 'United States' },
  'UK': { hl: 'en', gl: 'GB', ceid: 'GB:en', label: 'United Kingdom' },
  'India': { hl: 'en', gl: 'IN', ceid: 'IN:en', label: 'India' },
  'China': { hl: 'zh-CN', gl: 'CN', ceid: 'CN:zh-Hans', label: 'China' },
  'Germany': { hl: 'de', gl: 'DE', ceid: 'DE:de', label: 'Germany' },
  'France': { hl: 'fr', gl: 'FR', ceid: 'FR:fr', label: 'France' },
  'Japan': { hl: 'ja', gl: 'JP', ceid: 'JP:ja', label: 'Japan' },
  'Brazil': { hl: 'pt-BR', gl: 'BR', ceid: 'BR:pt-419', label: 'Brazil' },
  'Indonesia': { hl: 'id', gl: 'ID', ceid: 'ID:id', label: 'Indonesia' },
  'Vietnam': { hl: 'vi', gl: 'VN', ceid: 'VN:vi', label: 'Vietnam' },
  'Spain': { hl: 'es', gl: 'ES', ceid: 'ES:es', label: 'Spain' },
  'Italy': { hl: 'it', gl: 'IT', ceid: 'IT:it', label: 'Italy' },
  'South Korea': { hl: 'ko', gl: 'KR', ceid: 'KR:ko', label: 'South Korea' },
  'Thailand': { hl: 'th', gl: 'TH', ceid: 'TH:th', label: 'Thailand' },
  'Mexico': { hl: 'es', gl: 'MX', ceid: 'MX:es-419', label: 'Mexico' },
  'Turkey': { hl: 'tr', gl: 'TR', ceid: 'TR:tr', label: 'Turkey' },
  'Russia': { hl: 'ru', gl: 'RU', ceid: 'RU:ru', label: 'Russia' },
  'Netherlands': { hl: 'nl', gl: 'NL', ceid: 'NL:nl', label: 'Netherlands' },
  'Australia': { hl: 'en', gl: 'AU', ceid: 'AU:en', label: 'Australia' },
  'Singapore': { hl: 'en', gl: 'SG', ceid: 'SG:en', label: 'Singapore' },
  'Egypt': { hl: 'ar', gl: 'EG', ceid: 'EG:ar', label: 'Egypt' },
  'Nigeria': { hl: 'en', gl: 'NG', ceid: 'NG:en', label: 'Nigeria' },
  'Madagascar': { hl: 'fr', gl: 'FR', ceid: 'FR:fr', label: 'Madagascar' },
  'New Zealand': { hl: 'en', gl: 'NZ', ceid: 'NZ:en', label: 'New Zealand' },
  'Sri Lanka': { hl: 'en', gl: 'IN', ceid: 'IN:en', label: 'Sri Lanka' },
  'Argentina': { hl: 'es', gl: 'AR', ceid: 'AR:es-419', label: 'Argentina' },
  'Peru': { hl: 'es', gl: 'PE', ceid: 'PE:es-419', label: 'Peru' },
  'Philippines': { hl: 'en', gl: 'PH', ceid: 'PH:en', label: 'Philippines' },
  'Portugal': { hl: 'pt-PT', gl: 'PT', ceid: 'PT:pt-150', label: 'Portugal' },
  'UAE': { hl: 'en', gl: 'AE', ceid: 'AE:en', label: 'UAE' },
};

// Local language translations for common F&F product names
const LOCAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  'zh-CN': {
    'menthol': '薄荷醇', 'linalool': '芳樟醇', 'citral': '柠檬醛', 'coumarin': '香豆素',
    'eugenol': '丁香酚', 'vanillin': '香草醛', 'patchouli': '广藿香', 'camphor': '樟脑',
    'turpentine': '松节油', 'orange oil': '橙油', 'ginger': '生姜', 'pepper': '胡椒',
    'onion': '洋葱', 'garlic': '大蒜', 'clove': '丁香', 'cinnamon': '肉桂',
    'fragrance': '香料', 'flavour': '调味品', 'chemical': '化工', 'price': '价格',
  },
  'de': {
    'menthol': 'Menthol', 'linalool': 'Linalool', 'fragrance': 'Duftstoff',
    'flavour': 'Aroma', 'chemical': 'Chemie', 'price': 'Preis', 'turpentine': 'Terpentin',
    'orange oil': 'Orangenöl', 'peppermint': 'Pfefferminze',
  },
  'fr': {
    'menthol': 'menthol', 'linalool': 'linalol', 'fragrance': 'parfum',
    'flavour': 'arôme', 'chemical': 'chimique', 'price': 'prix', 'vanilla': 'vanille',
    'patchouli': 'patchouli', 'orange oil': "huile d'orange",
  },
  'ja': {
    'menthol': 'メントール', 'linalool': 'リナロール', 'fragrance': '香料', 'flavour': 'フレーバー',
    'chemical': '化学', 'price': '価格', 'ginger': '生姜', 'pepper': 'コショウ',
  },
  'pt-BR': {
    'orange oil': 'óleo de laranja', 'fragrance': 'fragrância', 'flavour': 'sabor',
    'chemical': 'químico', 'price': 'preço', 'pepper': 'pimenta',
  },
  'id': {
    'patchouli': 'nilam', 'clove': 'cengkeh', 'eugenol': 'eugenol',
    'fragrance': 'wewangian', 'price': 'harga',
  },
  'ko': {
    'menthol': '멘톨', 'fragrance': '향료', 'chemical': '화학', 'price': '가격',
  },
  'vi': {
    'pepper': 'hạt tiêu', 'price': 'giá', 'fragrance': 'hương liệu',
  },
  'es': {
    'fragrance': 'fragancia', 'flavour': 'sabor', 'chemical': 'químico',
    'price': 'precio', 'orange oil': 'aceite de naranja', 'vanilla': 'vainilla',
  },
  'hi': {
    'menthol': 'मेन्थॉल', 'peppermint': 'पुदीना', 'ginger': 'अदरक',
    'onion': 'प्याज', 'garlic': 'लहसुन', 'turmeric': 'हल्दी', 'pepper': 'काली मिर्च',
  },
};

export function getAvailableCountries(): { code: string; label: string }[] {
  return Object.entries(COUNTRY_NEWS_CONFIG).map(([code, config]) => ({
    code,
    label: config.label,
  }));
}

function getLocalQuery(query: string, langCode: string): string {
  const translations = LOCAL_TRANSLATIONS[langCode];
  if (!translations) return query;

  let localQuery = query;
  // Try to find a translation for any word in the query
  const queryLower = query.toLowerCase();
  for (const [eng, local] of Object.entries(translations)) {
    if (queryLower.includes(eng.toLowerCase())) {
      localQuery += ` OR ${local}`;
      break; // Add one local term to broaden search
    }
  }
  return localQuery;
}

function classifyImpact(title: string, description: string): NewsItem['impact'] {
  const text = `${title} ${description}`.toLowerCase();
  let score = 0;

  const critical = ['shortage', 'ban', 'sanctions', 'crisis', 'collapse', 'plummet', 'halt', 'shutdown', 'war', 'embargo', 'disruption', 'suspend', 'catastroph', 'emergency', 'recall', 'contaminat'];
  score += critical.filter(k => text.includes(k)).length * 4;

  const high = ['surge', 'soar', 'plunge', 'spike', 'crash', 'tariff', 'restrict', 'volatil', 'record high', 'record low', 'antidumping', 'anti-dumping', 'quota', 'penalty', 'fine', 'lawsuit'];
  score += high.filter(k => text.includes(k)).length * 3;

  const medHigh = ['price', 'cost', 'margin', 'revenue', 'profit', 'loss', 'import', 'export', 'trade', 'supply chain', 'inventory', 'capacity', 'acquisition', 'merger', 'regulation', 'compliance', 'fda', 'approval', 'patent', 'invest'];
  score += medHigh.filter(k => text.includes(k)).length * 2;

  const medium = ['market', 'demand', 'supply', 'production', 'growth', 'forecast', 'trend', 'expand', 'launch', 'partner', 'contract', 'deal', 'report', 'analysis', 'outlook', 'industry', 'global', 'annual', 'quarterly', 'research', 'develop'];
  score += medium.filter(k => text.includes(k)).length * 1;

  if (score >= 8) return 'Critical';
  if (score >= 5) return 'High';
  if (score >= 2) return 'Medium';
  return 'Low';
}

function classifySentiment(title: string, description: string): NewsItem['sentiment'] {
  const text = `${title} ${description}`.toLowerCase();
  const pos = ['increase', 'growth', 'rise', 'surge', 'expansion', 'recovery', 'gain', 'boost', 'strong', 'profit', 'up', 'high', 'launch', 'approve', 'success', 'grow', 'opportunity', 'bullish', 'outperform', 'upgrade'];
  const neg = ['decrease', 'decline', 'drop', 'fall', 'shortage', 'crisis', 'loss', 'weak', 'slump', 'down', 'crash', 'low', 'risk', 'warn', 'concern', 'bearish', 'downgrade', 'slow', 'cut', 'layoff', 'recall', 'suspend'];
  const p = pos.filter(w => text.includes(w)).length;
  const n = neg.filter(w => text.includes(w)).length;
  if (p > n) return 'positive';
  if (n > p) return 'negative';
  return 'neutral';
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!match) return '';
  return (match[1] || match[2] || '').trim();
}

function cleanHtml(raw: string): string {
  return raw
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'").replace(/&#x2F;/g, '/').replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const BLOCKED_SOURCES = [
  'future market insights', 'allied market research', 'spherical insights',
  'coherent market insights', 'data bridge market research', 'exactitude consultancy',
  'fortune business insights', 'grand view research', 'marketsandmarkets',
  'transparency market research', 'verified market research', 'zion market research',
  'polaris market research', 'emergen research', 'precedence research',
  'straitsresearch', 'straits research', 'indexbox', 'market research future', 'researchandmarkets',
  'factmr', 'fact.mr', 'persistence market research', 'vantage market research',
  'global market insights', 'imarc group', 'the insight partners',
  'mordor intelligence', 'technavio', 'maximize market research',
  'reportsanddata', 'reports and data', 'market study report',
  'the business research company', 'research nester', 'valuates reports',
  'barchart', 'globenewswire', 'prnewswire', 'pr newswire', 'businesswire',
  'accesswire', 'einpresswire', 'openpr', 'marketersmedia',
  'expertmarketresearch', 'inkwood research', 'custom market insights',
  'stellar market research', 'market.us', 'market research intellect',
  'adroit market research', 'databridgemarketresearch', 'kenresearch', 'ken research',
  'reportlinker', 'report linker', 'futuremarketinsights',
];

const BLOCKED_TITLE_PATTERNS = [
  /market\s+size.*\d{4}/i, /cagr.*through\s+\d{4}/i,
  /forecast\s+\d{4}\s*[-–]\s*\d{4}/i, /market\s+report\s+\d{4}/i,
  /industry\s+analysis\s+report/i, /market\s+share.*forecast/i,
  /market\s+growth.*\d{4}/i, /\$\s*[\d.]+\s*(billion|million|bn|mn).*\d{4}/i,
  /worth\s+usd\s+[\d.]+/i, /market\s+trends?\s*,?\s*analysis/i,
  /key\s+players?\s*,?\s*forecast/i,
];

const TRUSTED_SOURCES = [
  's&p global', 'icis', 'argus media', 'beje', 'platts',
  'reuters', 'bloomberg', 'chemical week', 'chemical & engineering news',
  'european chemical news', 'opis', 'fastmarkets',
  'the wall street journal', 'wsj', 'financial times', 'ft.com',
  'nikkei', 'cnbc', 'the economist', 'nature', 'science',
  'food business news', 'food navigator', 'perfumer & flavorist',
  'cosmetics design', 'happi', 'spice board', 'usda', 'fao',
  'bbc', 'ap news', 'associated press', 'the guardian',
  'new york times', 'washington post', 'economic times', 'mint', 'livemint',
  'jakarta post', 'south china morning post', 'nikkei asia',
];

function isBlockedSource(source: string, title: string): boolean {
  const srcLower = source.toLowerCase();
  const titleLower = title.toLowerCase();
  if (BLOCKED_SOURCES.some(b => srcLower.includes(b))) return true;
  if (BLOCKED_TITLE_PATTERNS.some(p => p.test(titleLower))) return true;
  return false;
}

function isTrustedSource(source: string): boolean {
  return TRUSTED_SOURCES.some(t => source.toLowerCase().includes(t));
}

async function fetchGoogleNewsRSS(query: string, country: string = 'global'): Promise<NewsItem[]> {
  try {
    const config = COUNTRY_NEWS_CONFIG[country] || COUNTRY_NEWS_CONFIG['global'];

    // Add local language terms for non-English countries
    let searchQuery = query;
    if (config.hl !== 'en') {
      searchQuery = getLocalQuery(query, config.hl);
    }

    // Add recency: prefer recent news by adding "when:7d" for last 7 days first
    const recentUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery + ' when:30d')}&hl=${config.hl}&gl=${config.gl}&ceid=${config.ceid}`;
    const res = await fetch(recentUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const xml = await res.text();
    const itemBlocks = xml.split('<item>').slice(1);
    let items: NewsItem[] = [];

    for (const block of itemBlocks.slice(0, 50)) {
      const title = cleanHtml(extractTag(block, 'title'));
      let link = extractTag(block, 'link');
      if (!link) {
        const linkMatch = block.match(/<link\s*\/?>\s*(https?:\/\/[^\s<]+)/);
        if (linkMatch) link = linkMatch[1];
      }
      const pubDate = extractTag(block, 'pubDate');
      const source = cleanHtml(extractTag(block, 'source'));
      const description = cleanHtml(extractTag(block, 'description')).slice(0, 250);

      if (!title || !link) continue;
      if (isBlockedSource(source, title)) continue;

      const item: NewsItem = {
        title,
        description: description || `Latest developments in ${query}`,
        url: link,
        source: source || 'Google News',
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        impact: classifyImpact(title, description),
        sentiment: classifySentiment(title, description),
      };

      if (isTrustedSource(source) && item.impact === 'Low') {
        item.impact = 'Medium';
      }

      items.push(item);
      if (items.length >= 15) break;
    }

    // If we got too few from recent, fetch broader timeframe
    if (items.length < 5) {
      const broaderUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=${config.hl}&gl=${config.gl}&ceid=${config.ceid}`;
      const res2 = await fetch(broaderUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 3600 } });
      if (res2.ok) {
        const xml2 = await res2.text();
        const blocks2 = xml2.split('<item>').slice(1);
        for (const block of blocks2.slice(0, 40)) {
          const title = cleanHtml(extractTag(block, 'title'));
          let link = extractTag(block, 'link');
          if (!link) { const m = block.match(/<link\s*\/?>\s*(https?:\/\/[^\s<]+)/); if (m) link = m[1]; }
          const pubDate = extractTag(block, 'pubDate');
          const source = cleanHtml(extractTag(block, 'source'));
          const desc = cleanHtml(extractTag(block, 'description')).slice(0, 250);
          if (!title || !link || isBlockedSource(source, title)) continue;
          // Skip duplicates
          if (items.some(i => i.title === title)) continue;
          const item: NewsItem = { title, description: desc || '', url: link, source: source || 'Google News', publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(), impact: classifyImpact(title, desc), sentiment: classifySentiment(title, desc) };
          if (isTrustedSource(source) && item.impact === 'Low') item.impact = 'Medium';
          items.push(item);
          if (items.length >= 15) break;
        }
      }
    }

    // Sort by date (most recent first)
    items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return items;
  } catch (err) {
    console.error('Google News RSS fetch failed:', err);
    return [];
  }
}

export async function fetchNews(query: string, fromDate?: string, country?: string): Promise<NewsItem[]> {
  if (NEWS_API_KEY && (!country || country === 'global')) {
    const from = fromDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    try {
      const res = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${from}&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_API_KEY}`,
        { next: { revalidate: 86400 } }
      );
      if (res.ok) {
        const data = await res.json();
        const articles = (data.articles || [])
          .filter((a: NewsApiArticle) => !isBlockedSource(a.source.name, a.title))
          .map((a: NewsApiArticle) => ({
            title: a.title, description: a.description || '', url: a.url,
            source: a.source.name, publishedAt: a.publishedAt,
            impact: classifyImpact(a.title, a.description || ''),
            sentiment: classifySentiment(a.title, a.description || ''),
          }));
        if (articles.length > 0) return articles;
      }
    } catch { /* fall through */ }
  }

  const results = await fetchGoogleNewsRSS(query, country || 'global');
  if (results.length > 0) return results;

  const firstWord = query.split(/\s+OR\s+/)[0]?.trim();
  if (firstWord && firstWord !== query) {
    return fetchGoogleNewsRSS(firstWord, country || 'global');
  }
  return [];
}

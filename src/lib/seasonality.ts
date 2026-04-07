import { PriceData, SeasonalityResult } from '@/types';

// Monthly: MoM % change - exactly replicating the user's Excel formula logic
export function calculateMonthlySeason(data: PriceData[]): SeasonalityResult {
  // Sort data by date
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

  // Group by year-month
  const priceMap: Record<string, number> = {};
  sorted.forEach(d => {
    priceMap[d.date] = d.price;
  });

  // Get unique years and months
  const years = [...new Set(sorted.map(d => parseInt(d.date.split('-')[0])))].sort();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const result: Record<string, Record<number, number | null>> = {};

  months.forEach((month, mi) => {
    result[month] = {};
    years.forEach(year => {
      const currentKey = `${year}-${String(mi + 1).padStart(2, '0')}`;
      let prevKey: string;
      if (mi === 0) {
        // January -> previous December
        prevKey = `${year - 1}-12`;
      } else {
        prevKey = `${year}-${String(mi).padStart(2, '0')}`;
      }

      const currentPrice = priceMap[currentKey];
      const prevPrice = priceMap[prevKey];

      if (currentPrice !== undefined && prevPrice !== undefined && prevPrice !== 0) {
        result[month][year] = ((currentPrice - prevPrice) / Math.abs(prevPrice)) * 100;
      } else {
        result[month][year] = null; // Ignore missing data
      }
    });
  });

  return { period: 'monthly', years, data: result };
}

// Quarterly: Average price per quarter, QoQ % change
export function calculateQuarterlySeason(data: PriceData[]): SeasonalityResult {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

  // Calculate quarterly averages
  const quarterlyAvg: Record<string, number> = {}; // "Q1-2019" -> avg price
  const dataByQuarter: Record<string, number[]> = {};

  sorted.forEach(d => {
    const [yearStr, monthStr] = d.date.split('-');
    const month = parseInt(monthStr);
    const quarter = Math.ceil(month / 3);
    const key = `Q${quarter}-${yearStr}`;
    if (!dataByQuarter[key]) dataByQuarter[key] = [];
    dataByQuarter[key].push(d.price);
  });

  Object.entries(dataByQuarter).forEach(([key, prices]) => {
    quarterlyAvg[key] = prices.reduce((a, b) => a + b, 0) / prices.length;
  });

  const years = [...new Set(sorted.map(d => parseInt(d.date.split('-')[0])))].sort();
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  // QoQ % change
  const result: Record<string, Record<number, number | null>> = {};

  quarters.forEach((q, qi) => {
    result[q] = {};
    years.forEach(year => {
      const currentKey = `${q}-${year}`;
      let prevKey: string;
      if (qi === 0) {
        prevKey = `Q4-${year - 1}`;
      } else {
        prevKey = `Q${qi}-${year}`;
      }

      const current = quarterlyAvg[currentKey];
      const prev = quarterlyAvg[prevKey];

      if (current !== undefined && prev !== undefined && prev !== 0) {
        result[q][year] = ((current - prev) / Math.abs(prev)) * 100;
      } else {
        result[q][year] = null;
      }
    });
  });

  return { period: 'quarterly', years, data: result };
}

// Half-Yearly: H1 (Jan-Jun), H2 (Jul-Dec)
export function calculateHalfYearlySeason(data: PriceData[]): SeasonalityResult {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

  const halfYearlyAvg: Record<string, number> = {};
  const dataByHalf: Record<string, number[]> = {};

  sorted.forEach(d => {
    const [yearStr, monthStr] = d.date.split('-');
    const month = parseInt(monthStr);
    const half = month <= 6 ? 'H1' : 'H2';
    const key = `${half}-${yearStr}`;
    if (!dataByHalf[key]) dataByHalf[key] = [];
    dataByHalf[key].push(d.price);
  });

  Object.entries(dataByHalf).forEach(([key, prices]) => {
    halfYearlyAvg[key] = prices.reduce((a, b) => a + b, 0) / prices.length;
  });

  const years = [...new Set(sorted.map(d => parseInt(d.date.split('-')[0])))].sort();
  const halves = ['H1', 'H2'];

  const result: Record<string, Record<number, number | null>> = {};

  halves.forEach((h, hi) => {
    result[h] = {};
    years.forEach(year => {
      const currentKey = `${h}-${year}`;
      let prevKey: string;
      if (hi === 0) {
        prevKey = `H2-${year - 1}`;
      } else {
        prevKey = `H1-${year}`;
      }

      const current = halfYearlyAvg[currentKey];
      const prev = halfYearlyAvg[prevKey];

      if (current !== undefined && prev !== undefined && prev !== 0) {
        result[h][year] = ((current - prev) / Math.abs(prev)) * 100;
      } else {
        result[h][year] = null;
      }
    });
  });

  return { period: 'half-yearly', years, data: result };
}

// Yearly: Annual average, YoY % change
export function calculateYearlySeason(data: PriceData[]): SeasonalityResult {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

  const yearlyAvg: Record<number, number> = {};
  const dataByYear: Record<number, number[]> = {};

  sorted.forEach(d => {
    const year = parseInt(d.date.split('-')[0]);
    if (!dataByYear[year]) dataByYear[year] = [];
    dataByYear[year].push(d.price);
  });

  Object.entries(dataByYear).forEach(([yearStr, prices]) => {
    yearlyAvg[parseInt(yearStr)] = prices.reduce((a, b) => a + b, 0) / prices.length;
  });

  const years = Object.keys(yearlyAvg).map(Number).sort();

  const result: Record<string, Record<number, number | null>> = {};
  result['Annual'] = {};

  years.forEach(year => {
    const current = yearlyAvg[year];
    const prev = yearlyAvg[year - 1];

    if (current !== undefined && prev !== undefined && prev !== 0) {
      result['Annual'][year] = ((current - prev) / Math.abs(prev)) * 100;
    } else {
      result['Annual'][year] = null;
    }
  });

  return { period: 'yearly', years, data: result };
}

// Get quarterly absolute values for display
export function getQuarterlyAverages(data: PriceData[]): Record<string, Record<number, number | null>> {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const dataByQuarter: Record<string, number[]> = {};

  sorted.forEach(d => {
    const [yearStr, monthStr] = d.date.split('-');
    const month = parseInt(monthStr);
    const quarter = Math.ceil(month / 3);
    const key = `Q${quarter}-${yearStr}`;
    if (!dataByQuarter[key]) dataByQuarter[key] = [];
    dataByQuarter[key].push(d.price);
  });

  const years = [...new Set(sorted.map(d => parseInt(d.date.split('-')[0])))].sort();
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const result: Record<string, Record<number, number | null>> = {};

  quarters.forEach(q => {
    result[q] = {};
    years.forEach(year => {
      const key = `${q}-${year}`;
      if (dataByQuarter[key] && dataByQuarter[key].length > 0) {
        result[q][year] = parseFloat((dataByQuarter[key].reduce((a, b) => a + b, 0) / dataByQuarter[key].length).toFixed(1));
      } else {
        result[q][year] = null;
      }
    });
  });

  return result;
}

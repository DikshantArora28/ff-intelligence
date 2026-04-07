import { BacktestResult, ForecastModel, ForwardForecastResult, PriceData } from '@/types';
import { arimaForecast } from './arima';
import { holtWintersForecast } from './holtWinters';
import { regressionForecast } from './regression';

function calculateMAPE(actual: number[], forecast: number[]): number {
  const n = Math.min(actual.length, forecast.length);
  if (n === 0) return 0;

  let sumAPE = 0;
  let count = 0;

  for (let i = 0; i < n; i++) {
    if (actual[i] !== 0) {
      sumAPE += Math.abs((actual[i] - forecast[i]) / actual[i]);
      count++;
    }
  }

  return count > 0 ? (sumAPE / count) * 100 : 0;
}

export function runBacktest(data: PriceData[], testMonths: number = 12): BacktestResult {
  // Sort data
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const prices = sorted.map(d => d.price);
  const dates = sorted.map(d => d.date);

  if (prices.length < testMonths + 24) {
    // Not enough data - use what we can
    const splitPoint = Math.max(Math.floor(prices.length * 0.7), 12);
    const trainPrices = prices.slice(0, splitPoint);
    const testPrices = prices.slice(splitPoint);
    const testDates = dates.slice(splitPoint);
    const actualTestMonths = testPrices.length;

    return runModels(trainPrices, testPrices, testDates, dates, actualTestMonths);
  }

  const trainPrices = prices.slice(0, -testMonths);
  const testPrices = prices.slice(-testMonths);
  const testDates = dates.slice(-testMonths);

  return runModels(trainPrices, testPrices, testDates, dates, testMonths);
}

function runModels(
  trainPrices: number[],
  testPrices: number[],
  testDates: string[],
  allDates: string[],
  steps: number
): BacktestResult {
  const models: ForecastModel[] = [];

  // 1. ARIMA/SARIMA
  try {
    const arimaFc = arimaForecast(trainPrices, steps, { p: 2, d: 1, q: 0, seasonalPeriod: 12 });
    const arimaMape = calculateMAPE(testPrices, arimaFc);
    models.push({
      name: 'ARIMA/SARIMA',
      method: 'arima',
      forecast: arimaFc,
      actual: testPrices,
      mape: arimaMape,
      dates: testDates,
    });
  } catch {
    models.push({
      name: 'ARIMA/SARIMA',
      method: 'arima',
      forecast: new Array(steps).fill(trainPrices[trainPrices.length - 1]),
      actual: testPrices,
      mape: 100,
      dates: testDates,
    });
  }

  // 2. Holt-Winters
  try {
    const hwFc = holtWintersForecast(trainPrices, steps, 12);
    const hwMape = calculateMAPE(testPrices, hwFc);
    models.push({
      name: 'Holt-Winters (Exp. Smoothing)',
      method: 'holt-winters',
      forecast: hwFc,
      actual: testPrices,
      mape: hwMape,
      dates: testDates,
    });
  } catch {
    models.push({
      name: 'Holt-Winters (Exp. Smoothing)',
      method: 'holt-winters',
      forecast: new Array(steps).fill(trainPrices[trainPrices.length - 1]),
      actual: testPrices,
      mape: 100,
      dates: testDates,
    });
  }

  // 3. Regression
  try {
    const regFc = regressionForecast(trainPrices, steps, 12, 2);
    const regMape = calculateMAPE(testPrices, regFc);
    models.push({
      name: 'Polynomial Regression',
      method: 'regression',
      forecast: regFc,
      actual: testPrices,
      mape: regMape,
      dates: testDates,
    });
  } catch {
    models.push({
      name: 'Polynomial Regression',
      method: 'regression',
      forecast: new Array(steps).fill(trainPrices[trainPrices.length - 1]),
      actual: testPrices,
      mape: 100,
      dates: testDates,
    });
  }

  // Find best model
  const bestModel = models.reduce((best, m) => m.mape < best.mape ? m : best, models[0]);

  const trainStart = allDates[0] || 'N/A';
  const trainEnd = allDates[allDates.length - steps - 1] || 'N/A';
  const testStart = testDates[0] || 'N/A';
  const testEnd = testDates[testDates.length - 1] || 'N/A';

  return {
    models,
    bestModel: bestModel.name,
    trainPeriod: `${trainStart} to ${trainEnd}`,
    testPeriod: `${testStart} to ${testEnd}`,
  };
}

// Generate future date strings from the last date in data
function generateFutureDates(lastDate: string, months: number): string[] {
  const [yearStr, monthStr] = lastDate.split('-');
  let year = parseInt(yearStr);
  let month = parseInt(monthStr);
  const dates: string[] = [];
  for (let i = 0; i < months; i++) {
    month++;
    if (month > 12) { month = 1; year++; }
    dates.push(`${year}-${String(month).padStart(2, '0')}`);
  }
  return dates;
}

export function runForwardForecast(data: PriceData[], forecastMonths: number = 12, bestModelName?: string): ForwardForecastResult {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const prices = sorted.map(d => d.price);
  const dates = sorted.map(d => d.date);
  const futureDates = generateFutureDates(dates[dates.length - 1], forecastMonths);

  const models: ForwardForecastResult['models'] = [];

  // Train on ALL data and forecast forward
  try {
    models.push({ name: 'ARIMA/SARIMA', method: 'arima', forecast: arimaForecast(prices, forecastMonths, { p: 2, d: 1, q: 0, seasonalPeriod: 12 }), dates: futureDates });
  } catch {
    models.push({ name: 'ARIMA/SARIMA', method: 'arima', forecast: new Array(forecastMonths).fill(prices[prices.length - 1]), dates: futureDates });
  }

  try {
    models.push({ name: 'Holt-Winters', method: 'holt-winters', forecast: holtWintersForecast(prices, forecastMonths, 12), dates: futureDates });
  } catch {
    models.push({ name: 'Holt-Winters', method: 'holt-winters', forecast: new Array(forecastMonths).fill(prices[prices.length - 1]), dates: futureDates });
  }

  try {
    models.push({ name: 'Regression', method: 'regression', forecast: regressionForecast(prices, forecastMonths, 12, 2), dates: futureDates });
  } catch {
    models.push({ name: 'Regression', method: 'regression', forecast: new Array(forecastMonths).fill(prices[prices.length - 1]), dates: futureDates });
  }

  // Show last 12 months of historical for context
  const histCount = Math.min(24, prices.length);

  return {
    models,
    bestModel: bestModelName || models[0].name,
    historicalPrices: prices.slice(-histCount),
    historicalDates: dates.slice(-histCount),
  };
}

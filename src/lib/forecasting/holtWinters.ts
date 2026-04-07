// Holt-Winters Triple Exponential Smoothing

export interface HWParams {
  alpha: number; // level smoothing (0-1)
  beta: number;  // trend smoothing (0-1)
  gamma: number; // seasonal smoothing (0-1)
  seasonalPeriod: number;
}

function initializeSeasonalComponents(data: number[], period: number): number[] {
  const nSeasons = Math.floor(data.length / period);
  const seasonal = new Array(period).fill(0);

  // Average each seasonal position across complete seasons
  for (let i = 0; i < period; i++) {
    let sum = 0;
    let count = 0;
    for (let j = 0; j < nSeasons; j++) {
      const idx = j * period + i;
      if (idx < data.length) {
        const seasonAvg = data.slice(j * period, (j + 1) * period).reduce((a, b) => a + b, 0) / period;
        sum += data[idx] - seasonAvg;
        count++;
      }
    }
    seasonal[i] = count > 0 ? sum / count : 0;
  }

  return seasonal;
}

function optimizeParams(data: number[], period: number): HWParams {
  let bestParams: HWParams = { alpha: 0.3, beta: 0.1, gamma: 0.1, seasonalPeriod: period };
  let bestError = Infinity;

  // Grid search over parameter space
  for (let a = 0.1; a <= 0.9; a += 0.2) {
    for (let b = 0.01; b <= 0.5; b += 0.1) {
      for (let g = 0.01; g <= 0.5; g += 0.1) {
        const params: HWParams = { alpha: a, beta: b, gamma: g, seasonalPeriod: period };
        const fitted = holtWintersFit(data, params);
        const error = calculateMSE(data.slice(period), fitted.slice(period));
        if (error < bestError) {
          bestError = error;
          bestParams = params;
        }
      }
    }
  }

  return bestParams;
}

function calculateMSE(actual: number[], predicted: number[]): number {
  const n = Math.min(actual.length, predicted.length);
  if (n === 0) return Infinity;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += Math.pow(actual[i] - predicted[i], 2);
  }
  return sum / n;
}

function holtWintersFit(data: number[], params: HWParams): number[] {
  const { alpha, beta, gamma, seasonalPeriod: period } = params;
  const n = data.length;

  if (n < period * 2) {
    // Not enough data for seasonal decomposition
    return [...data];
  }

  const seasonal = initializeSeasonalComponents(data, period);
  let level = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let trend = 0;
  for (let i = 0; i < period; i++) {
    trend += (data[period + i] - data[i]) / period;
  }
  trend /= period;

  const fitted: number[] = [];

  for (let i = 0; i < n; i++) {
    const seasonIdx = i % period;
    const observed = data[i];

    if (i === 0) {
      fitted.push(level + trend + seasonal[seasonIdx]);
      continue;
    }

    const prevLevel = level;
    level = alpha * (observed - seasonal[seasonIdx]) + (1 - alpha) * (prevLevel + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    seasonal[seasonIdx] = gamma * (observed - level) + (1 - gamma) * seasonal[seasonIdx];

    fitted.push(level + trend + seasonal[seasonIdx]);
  }

  return fitted;
}

export function holtWintersForecast(
  trainData: number[],
  steps: number,
  period: number = 12
): number[] {
  if (trainData.length < period * 2) {
    // Fallback to simple moving average if not enough data
    const avg = trainData.slice(-period).reduce((a, b) => a + b, 0) / Math.min(period, trainData.length);
    return new Array(steps).fill(avg);
  }

  const params = optimizeParams(trainData, period);
  const { alpha, beta, gamma } = params;

  const seasonal = initializeSeasonalComponents(trainData, period);
  let level = trainData.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let trend = 0;
  for (let i = 0; i < period; i++) {
    trend += (trainData[period + i] - trainData[i]) / period;
  }
  trend /= period;

  // Fit through training data
  for (let i = 0; i < trainData.length; i++) {
    const seasonIdx = i % period;
    const observed = trainData[i];
    const prevLevel = level;

    level = alpha * (observed - seasonal[seasonIdx]) + (1 - alpha) * (prevLevel + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    seasonal[seasonIdx] = gamma * (observed - level) + (1 - gamma) * seasonal[seasonIdx];
  }

  // Forecast
  const forecast: number[] = [];
  for (let i = 1; i <= steps; i++) {
    const seasonIdx = (trainData.length + i - 1) % period;
    forecast.push(level + i * trend + seasonal[seasonIdx]);
  }

  return forecast;
}

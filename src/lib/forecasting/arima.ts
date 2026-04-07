// Simplified ARIMA/SARIMA implementation for time series forecasting
// Uses autoregressive (AR) component with seasonal differencing

export interface ArimaParams {
  p: number; // AR order
  d: number; // differencing order
  q: number; // MA order (simplified)
  seasonalPeriod?: number; // seasonal period (12 for monthly)
}

function difference(series: number[], d: number): number[] {
  let result = [...series];
  for (let i = 0; i < d; i++) {
    const diffed: number[] = [];
    for (let j = 1; j < result.length; j++) {
      diffed.push(result[j] - result[j - 1]);
    }
    result = diffed;
  }
  return result;
}

function undifference(original: number[], diffed: number[], d: number): number[] {
  if (d === 0) return diffed;
  const result: number[] = [];
  let last = original[original.length - 1];
  for (const val of diffed) {
    last = last + val;
    result.push(last);
  }
  return result;
}

function fitAR(series: number[], p: number): number[] {
  // Simple least squares AR fit
  const n = series.length;
  if (n <= p) return new Array(p).fill(0);

  // Build matrices for AR(p)
  const X: number[][] = [];
  const y: number[] = [];

  for (let i = p; i < n; i++) {
    const row: number[] = [];
    for (let j = 1; j <= p; j++) {
      row.push(series[i - j]);
    }
    X.push(row);
    y.push(series[i]);
  }

  // Solve using normal equations: coeffs = (X'X)^-1 X'y
  const XtX: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  const Xty: number[] = new Array(p).fill(0);

  for (let i = 0; i < X.length; i++) {
    for (let j = 0; j < p; j++) {
      for (let k = 0; k < p; k++) {
        XtX[j][k] += X[i][j] * X[i][k];
      }
      Xty[j] += X[i][j] * y[i];
    }
  }

  // Add small regularization
  for (let i = 0; i < p; i++) {
    XtX[i][i] += 0.01;
  }

  // Solve via Gaussian elimination
  const augmented = XtX.map((row, i) => [...row, Xty[i]]);
  const m = augmented.length;

  for (let col = 0; col < m; col++) {
    let maxRow = col;
    for (let row = col + 1; row < m; row++) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[maxRow][col])) {
        maxRow = row;
      }
    }
    [augmented[col], augmented[maxRow]] = [augmented[maxRow], augmented[col]];

    if (Math.abs(augmented[col][col]) < 1e-10) continue;

    for (let row = col + 1; row < m; row++) {
      const factor = augmented[row][col] / augmented[col][col];
      for (let j = col; j <= m; j++) {
        augmented[row][j] -= factor * augmented[col][j];
      }
    }
  }

  const coeffs = new Array(m).fill(0);
  for (let i = m - 1; i >= 0; i--) {
    if (Math.abs(augmented[i][i]) < 1e-10) continue;
    let sum = augmented[i][m];
    for (let j = i + 1; j < m; j++) {
      sum -= augmented[i][j] * coeffs[j];
    }
    coeffs[i] = sum / augmented[i][i];
  }

  return coeffs;
}

export function arimaForecast(
  trainData: number[],
  steps: number,
  params: ArimaParams = { p: 2, d: 1, q: 0, seasonalPeriod: 12 }
): number[] {
  const { p, d, seasonalPeriod } = params;

  // Apply seasonal differencing if applicable
  let workingSeries = [...trainData];
  const originalSeries = [...trainData];

  if (seasonalPeriod && seasonalPeriod > 0 && trainData.length > seasonalPeriod) {
    const seasonalDiffed: number[] = [];
    for (let i = seasonalPeriod; i < workingSeries.length; i++) {
      seasonalDiffed.push(workingSeries[i] - workingSeries[i - seasonalPeriod]);
    }
    workingSeries = seasonalDiffed;
  }

  // Apply regular differencing
  const diffedSeries = difference(workingSeries, d);

  // Fit AR model
  const coeffs = fitAR(diffedSeries, p);

  // Forecast on differenced series
  const extended = [...diffedSeries];
  for (let i = 0; i < steps; i++) {
    let pred = 0;
    for (let j = 0; j < p; j++) {
      const idx = extended.length - 1 - j;
      if (idx >= 0) {
        pred += coeffs[j] * extended[idx];
      }
    }
    extended.push(pred);
  }

  const diffedForecast = extended.slice(-steps);

  // Reverse differencing
  const undiffed = undifference(workingSeries, diffedForecast, d);

  // Reverse seasonal differencing
  if (seasonalPeriod && seasonalPeriod > 0 && trainData.length > seasonalPeriod) {
    const result: number[] = [];
    for (let i = 0; i < steps; i++) {
      const seasonalRef = originalSeries[originalSeries.length - seasonalPeriod + (i % seasonalPeriod)];
      result.push(seasonalRef + undiffed[i]);
    }
    return result;
  }

  return undiffed;
}

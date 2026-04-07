// Polynomial Regression with seasonal features for time series forecasting

export function regressionForecast(
  trainData: number[],
  steps: number,
  period: number = 12,
  degree: number = 2
): number[] {
  const n = trainData.length;

  // Build feature matrix: [1, t, t^2, sin(2*pi*t/period), cos(2*pi*t/period)]
  const numFeatures = degree + 3; // polynomial terms + sin + cos

  function buildFeatures(t: number): number[] {
    const features: number[] = [1]; // bias
    const tNorm = t / n; // normalize time
    for (let d = 1; d <= degree; d++) {
      features.push(Math.pow(tNorm, d));
    }
    features.push(Math.sin((2 * Math.PI * t) / period));
    features.push(Math.cos((2 * Math.PI * t) / period));
    return features;
  }

  // Build X matrix and y vector
  const X: number[][] = [];
  const y: number[] = [];

  for (let i = 0; i < n; i++) {
    X.push(buildFeatures(i));
    y.push(trainData[i]);
  }

  // Solve normal equations: coeffs = (X'X + lambda*I)^-1 X'y (Ridge regression)
  const lambda = 0.01; // regularization
  const XtX: number[][] = Array.from({ length: numFeatures }, () => new Array(numFeatures).fill(0));
  const Xty: number[] = new Array(numFeatures).fill(0);

  for (let i = 0; i < X.length; i++) {
    for (let j = 0; j < numFeatures; j++) {
      for (let k = 0; k < numFeatures; k++) {
        XtX[j][k] += X[i][j] * X[i][k];
      }
      Xty[j] += X[i][j] * y[i];
    }
  }

  // Add regularization
  for (let i = 0; i < numFeatures; i++) {
    XtX[i][i] += lambda;
  }

  // Gaussian elimination
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

  // Forecast
  const forecast: number[] = [];
  for (let i = 0; i < steps; i++) {
    const t = n + i;
    const features = buildFeatures(t);
    let pred = 0;
    for (let j = 0; j < numFeatures; j++) {
      pred += coeffs[j] * features[j];
    }
    forecast.push(pred);
  }

  return forecast;
}

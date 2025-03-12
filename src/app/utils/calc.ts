export function blackScholes(S: number, K: number, T: number, r: number, sigma: number, optionType = 'call') {
  function normalCDF(x: number) {
    return (1.0 + erf(x / Math.SQRT2)) / 2.0
  }

  function erf(x: number) {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911

    const sign = x < 0 ? -1 : 1
    x = Math.abs(x)

    const t = 1.0 / (1.0 + p * x)
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

    return sign * y
  }
  if (S <= 0 || K <= 0 || T <= 0) return NaN
  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T))
  if (isNaN(d1)) return 0

  const d2 = d1 - sigma * Math.sqrt(T)

  const Nd1 = normalCDF(d1)
  const Nd2 = normalCDF(d2)
  const Nd1_neg = normalCDF(-d1)
  const Nd2_neg = normalCDF(-d2)

  if (optionType === 'call')
    return S * Nd1 - K * Math.exp(-r * T) * Nd2
  else
    return K * Math.exp(-r * T) * Nd2_neg - S * Nd1_neg
}


// Vega (Sensitivity of BS Price to Volatility)
function vega(S: number, K: number, T: number, r: number, sigma: number) {
  if (S <= 0 || K <= 0 || T <= 0) return NaN

  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T))
  const pdf = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI)
  return S * pdf * Math.sqrt(T)
}

export function calculateIV(marketPrice: number, S: number, K: number, T: number, r: number, sigma: number, optionType = 'call') {
  if (S <= 0 || K <= 0 || T <= 0 || marketPrice <= 0) return NaN

  const tol = 1e-5
  const maxIter = 100
  const ivLow = 0.01, ivHigh = 5.0
  let iv = sigma
  for (let i = 0; i < maxIter; i++) {
    const price = blackScholes(S, K, T, r, iv, optionType)
    const diff = price - marketPrice

    if (Math.abs(diff) < tol)
      return iv

    const vegaVal = vega(S, K, T, r, iv)
    if (vegaVal < 1e-4) break
    
    // Newton-Raphson update
    iv -= diff / vegaVal

    // Ensure sigma stays within bisection bounds
    if (iv < ivLow) iv = ivLow
    else if (iv > ivHigh) iv = ivHigh
      
  }
  return NaN // Return best estimate
}
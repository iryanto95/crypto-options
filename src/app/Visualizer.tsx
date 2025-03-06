import { useCallback, useState } from 'react'
import {
  Box,
  Grid2 as Grid,
} from '@mui/material'
import {
  ArrowLeft,
  ArrowRight
} from '@mui/icons-material'

import NeuIconButton from './components/NeuIconButton'
import NeuTypography from './components/NeuTypography'

const STRIKE_INCR: { [key: string]: number } = {
  'BTCUSDT': 1000,
  'ETHUSDT': 25,
  'SOLUSDT': 2,
  'BNBUSDT': 5,
  'XRPUSDT': 0.05
}

type propsType = {
  currentPrice: number
  pair: string
  volatility: number
  riskFreeRate: number
  optionType: string
  marketPrices: {
    s: string
    mp: string
  }[]
  display: string
}

export default function Visualizer(props: propsType) {
  const [lowestDTE, setLowestDTE] = useState(0)

  const blackScholes = useCallback((strike: number, timeToExpiration: number, sigma: number) => {
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

    const d1 = (Math.log(props.currentPrice / strike) + (props.riskFreeRate + sigma * sigma / 2) * timeToExpiration) / (sigma * Math.sqrt(timeToExpiration))
    if (isNaN(d1)) return 0

    const d2 = d1 - sigma * Math.sqrt(timeToExpiration)

    const Nd1 = normalCDF(d1)
    const Nd2 = normalCDF(d2)
    const Nd1_neg = normalCDF(-d1)
    const Nd2_neg = normalCDF(-d2)

    if (props.optionType === 'call')
      return props.currentPrice * Nd1 - strike * Math.exp(-props.riskFreeRate * timeToExpiration) * Nd2
    else
      return strike * Math.exp(-props.riskFreeRate * timeToExpiration) * Nd2_neg - props.currentPrice * Nd1_neg
  }, [props.currentPrice, props.riskFreeRate, props.optionType])

  // Vega (Sensitivity of BS Price to Volatility)
  const vega = useCallback((strike: number, timeToExpiration: number, sigma: number) => {
    const d1 = (Math.log(props.currentPrice / strike) + (props.riskFreeRate + props.volatility * props.volatility / 2) * timeToExpiration) / (props.volatility * Math.sqrt(timeToExpiration))
    let pdf = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI)
    return props.currentPrice * pdf * Math.sqrt(timeToExpiration)
  }, [props.currentPrice, props.riskFreeRate])

  const impliedVolatility = useCallback((marketPrice: number, strike: number, timeToExpiration: number) => {
    const tol = 1e-5
    const maxIter = 100
    let sigmaLow = 0.01, sigmaHigh = 5.0
    let sigma = props.volatility

    for (let i = 0; i < maxIter; i++) {
      const price = blackScholes(strike, timeToExpiration, sigma)
      const vegaVal = vega(strike, timeToExpiration, sigma)
      const diff = price - marketPrice

      if (Math.abs(diff) < tol)
        return sigma

      if (vegaVal < 1e-4)
        sigma = (sigmaLow + sigmaHigh) / 2
      else {
        // Newton-Raphson update
        const newSigma = sigma - diff / vegaVal

        // Ensure sigma stays within bisection bounds
        if (newSigma < sigmaLow || newSigma > sigmaHigh)
          sigma = (sigmaLow + sigmaHigh) / 2
        else
          sigma = newSigma
      }

      // Update bisection bounds
      if (blackScholes(strike, timeToExpiration, sigma) > marketPrice)
        sigmaHigh = sigma
      else
        sigmaLow = sigma
    }

    return sigma // Return best estimate
  }, [props.currentPrice, props.volatility])

  const incr = STRIKE_INCR[props.pair]
  const refPrice = Math.floor(props.currentPrice / incr) * incr

  const rows = []
  const dates = []
  const opts: { [key: string]: number } = {}
  for (const marketPrice of props.marketPrices) {
    const symbol = marketPrice.s.split('-')
    if ((symbol[3] === 'C' && props.optionType === 'call') || (symbol[3] === 'P' && props.optionType === 'put')) {
      opts[`${symbol[1]}_${parseFloat(symbol[2]).toFixed(2)}`] = parseFloat(marketPrice.mp)
    }
  }
  for (let day = -1; day < 10; day++) {
    if (day === -1)
      dates.push(
        <Grid key={day} size={12/11} sx={{ textAlign: 'right', fontSize: '10pt', padding: '2px' }}>
          <NeuTypography fontSize={12}>Strike\DTE</NeuTypography>
        </Grid>
      )
    else
      dates.push(
        <Grid key={day} size={12/11} sx={{ textAlign: 'center', padding: '2px', borderBottom: '0.01px solid rgba(51, 27, 95, 0.30)', }}>
          <NeuTypography fontSize={12}>{day + lowestDTE}</NeuTypography>
        </Grid>
      )
  }
  rows.push(dates)

  const today = new Date()
  today.setTime(today.getTime() + lowestDTE * 24 * 2600 * 1000)
  const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1, 0, 0, 0, 0))
  const remainingToday = (endOfDay.getTime() - today.getTime()) / 3600000
  let maxDiff = 0

  for (let strike = refPrice + 5 * incr; strike >= refPrice - 5 * incr; strike -= incr) {
    const row = []
    row.push(
      <Grid key={strike} size={12/11} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', paddingRight: '8px', fontSize: '10pt', borderRight: '0.01px solid rgba(51, 27, 95, 0.30)' }}>
        <NeuTypography fontSize={12}>{strike.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</NeuTypography>
      </Grid>
    )
    
    const cells = []
    for (let day = 0; day < 10; day++) {
      today.setTime(today.getTime() + 24 * 2600 * 1000)
      const todayString = `${today.getFullYear() % 100}${today.getMonth() + 1 < 10 ? 0 : ''}${today.getMonth() + 1}${today.getDate() < 10 ? 0 : ''}${today.getDate()}`
      const optPrice = opts[`${todayString}_${strike.toFixed(2)}`]
      const bsPrice = blackScholes(strike, (day + lowestDTE + remainingToday) / 365, props.volatility)
      const iv = optPrice ? impliedVolatility(optPrice, strike, (day + lowestDTE + remainingToday) / 365) : null
      const diff = optPrice ? optPrice - bsPrice : 0

      if (Math.abs(diff) > maxDiff)
        maxDiff = Math.abs(diff)

      cells.push({
        diff,
        iv: iv !== null ? (iv * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %' : '',
        optPrice,
        bsPrice
      })
    }
    
    for (const cell of cells) {
      row.push(
        <Grid key={row.length} size={12/11} 
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '0.01px solid rgba(51, 27, 95, 0.30)',
            borderRight: '0.01px solid rgba(51, 27, 95, 0.30)',
            textAlign: 'center',
            padding: '2px', 
            minHeight: '50px',
            backgroundColor: cell.diff < 0 ? 
              `rgba(100,200,130,${0.1 + 0.9 * Math.abs(cell.diff / maxDiff)})` 
              : cell.diff > 0 ? 
              `rgba(200,100,130,${0.1 + 0.9 * Math.abs(cell.diff / maxDiff)})` : undefined
          }}>
            <Box >
              <Box sx={{visibility: cell.optPrice ? 'visible' : 'hidden', fontWeight: 600}}><NeuTypography fontSize={12}>{cell.optPrice ? cell.optPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : <>-</>}</NeuTypography></Box>
              <Box>
                { props.display === 'fv' ? 
                  <NeuTypography fontSize={10}>{cell.bsPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</NeuTypography>
                  : <NeuTypography fontSize={10}>{cell.iv}</NeuTypography>
                }
              </Box>
            </Box>
        </Grid>
      )
    }
    rows.push(row)
  }

  return (
    <Box sx={{position: 'relative'}}>
      <Box sx={{textAlign: 'center', marginBottom: '16px'}}>
        <NeuTypography variant='h5'>{props.optionType === 'call' ? 'Calls' : 'Puts'}</NeuTypography>
      </Box>
      <Box sx={{position: 'absolute', top: '0px', right: '0px'}}>
        <NeuIconButton sx={{marginRight: '16px'}} disabled={lowestDTE === 0} onClick={() => setLowestDTE(lowestDTE - 10)}>
          <ArrowLeft sx={{color: 'rgba(51, 27, 95, 0.8)'}}/>
        </NeuIconButton>
        <NeuIconButton disabled={lowestDTE === 90} onClick={() => setLowestDTE(lowestDTE + 10)}>
          <ArrowRight sx={{color: 'rgba(51, 27, 95, 0.8)'}}/>
        </NeuIconButton>
      </Box>
      <Grid container spacing={0} sx={{marginTop: '24px'}}>
        {rows}
      </Grid>
    </Box>
  )
}

import {
  Box,
  Grid2 as Grid,
} from '@mui/material'

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
}

export default function Visualizer(props: propsType) {
  const blackScholes = ((strike: number, timeToExpiration: number) => {
    function normalCDF(x: number) {
      return (1.0 + erf(x / Math.sqrt(2.0))) / 2.0
    }

    function erf(x: number) {
      const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741
      const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911

      const sign = x < 0 ? -1 : 1
      x = Math.abs(x)

      const t = 1.0 / (1.0 + p * x)
      const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

      return sign * y
    }

    const d1 = (Math.log(props.currentPrice / strike) + (props.riskFreeRate + props.volatility * props.volatility / 2) * timeToExpiration) / (props.volatility * Math.sqrt(timeToExpiration))
    const d2 = d1 - props.volatility * Math.sqrt(timeToExpiration)

    if (isNaN(d1)) return 0

    const Nd1 = normalCDF(d1)
    const Nd2 = normalCDF(d2)
    const Nd1_neg = normalCDF(-d1)
    const Nd2_neg = normalCDF(-d2)

    if (props.optionType === 'call')
      return props.currentPrice * Nd1 - strike * Math.exp(-props.riskFreeRate * timeToExpiration) * Nd2
    else
      return strike * Math.exp(-props.riskFreeRate * timeToExpiration) * Nd2_neg - props.currentPrice * Nd1_neg
  })

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
          <NeuTypography fontSize={12}>Strike \ DTE</NeuTypography>
        </Grid>
      )
    else
      dates.push(
        <Grid key={day} size={12/11} sx={{ textAlign: 'center', padding: '2px', borderBottom: '0.01px solid rgba(51, 27, 95, 0.30)', }}>
          <NeuTypography fontSize={12}>{day}</NeuTypography>
        </Grid>
      )
  }
  rows.push(dates)

  const today = new Date()
  
  let maxDiff = 0

  for (let strike = refPrice + 5 * incr; strike >= refPrice - 5 * incr; strike -= incr) {
    const row = []
    row.push(
      <Grid key={strike} size={12/11} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', paddingRight: '8px', fontSize: '10pt', borderRight: '0.01px solid rgba(51, 27, 95, 0.30)' }}>
        <NeuTypography fontSize={12}>{strike.toFixed(2)}</NeuTypography>
      </Grid>
    )
    
    const cells = []
    for (let day = 0; day < 10; day++) {
      today.setDate(today.getDate() + 1)
      const todayString = `${today.getFullYear() % 100}${today.getMonth() + 1 < 10 ? 0 : ''}${today.getMonth() + 1}${today.getDate() < 10 ? 0 : ''}${today.getDate()}`
      const optPrice = opts[`${todayString}_${strike.toFixed(2)}`]
      const bsPrice = blackScholes(strike, day / 365).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const diff = optPrice ? optPrice - parseFloat(bsPrice) : 0

      if (Math.abs(diff) > maxDiff)
        maxDiff = Math.abs(diff)

      cells.push({
        diff,
        optPrice,
        bsPrice
      })
    }
    

    for (const cell of cells) {
      row.push(
        <Grid key={row.length} size={12/11} 
          sx={{
            borderBottom: '0.01px solid rgba(51, 27, 95, 0.30)',
            borderRight: '0.01px solid rgba(51, 27, 95, 0.30)',
            textAlign: 'center',
            padding: '2px', 
            minHeight: '50px',
            backgroundColor: cell.diff < 0 ? `rgba(100,200,130,${Math.abs(cell.diff/maxDiff)})` : cell.diff > 0 ? `rgba(200,100,130,${Math.abs(cell.diff/maxDiff)})` : undefined
          }}>
          <Box sx={{display: 'block', marginTop: '4px', fontWeight: 600}}><NeuTypography fontSize={14}>{cell.optPrice ? cell.optPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</NeuTypography></Box>
          <Box sx={{marginTop: '4px'}}><NeuTypography fontSize={10}>{cell.bsPrice}</NeuTypography></Box>
        </Grid>
      )
    }
    rows.push(row)
  }

  return (
    <Grid container spacing={0}>
      {rows}
    </Grid>
  )
}

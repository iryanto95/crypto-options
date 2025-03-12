/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo, useState } from 'react'
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
import { blackScholes, calculateIV } from './utils/calc'

const STRIKE_INCR: { [key: string]: number } = {
  'BTCUSDT': 2000,
  'ETHUSDT': 25,
  'SOLUSDT': 2,
  'BNBUSDT': 5,
  'XRPUSDT': 0.05
}

type propsType = {
  currentPrice: number
  pair: string
  hv: number
  riskFreeRate: number
  optionType: string
  marketPrices: {[key:string]: number }
  displayVal: string,
  displayDay: string,
}

export default function Visualizer(props: propsType) {
  const [lowestDTE, setLowestDTE] = useState(0)

  const today = useMemo(() => {
    return new Date()
  }, [])
  const remainingToday = useMemo(() => {
    const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1, 0, 0, 0, 0))
    return (endOfDay.getTime() - today.getTime()) / 86400000
  }, [today])

  const incr = STRIKE_INCR[props.pair]
  const refPrice = Math.floor(props.currentPrice / incr) * incr

  const rows = []
  const dates = []
  for (let day = -1; day < 10; day++) {
    const theDate = new Date(today.getTime() + (day + 1 + lowestDTE) * 24 * 3600 * 1000)
    if (day === -1)
      dates.push(
        <Grid key={day} size={12/11} sx={{ textAlign: 'right', fontSize: '10pt', padding: '2px' }}>
          <NeuTypography fontSize={12}>Strike\{ props.displayDay === 'expd' ? 'Expiry' : 'DTE' }</NeuTypography>
        </Grid>
      )
    else
      dates.push(
        <Grid key={day} size={12/11} sx={{ textAlign: 'center', padding: '2px', borderBottom: '0.01px solid rgba(51, 27, 95, 0.30)', }}>
          { props.displayDay === 'expd' ?
            <NeuTypography fontSize={12}>{`${theDate.getDate()}/${theDate.getMonth() + 1}/${theDate.getFullYear()}`}</NeuTypography>
            : <NeuTypography fontSize={12}>{day + lowestDTE + 1}</NeuTypography>
          }
        </Grid>
      )
  }
  rows.push(dates)

  let maxDiff = 0
  const cells: {[key: number]: Array<{diff: number, iv: string, optPrice: number, bsPrice: number, isRef: boolean}>} = {}

  for (let strike = refPrice + 5 * incr; strike >= refPrice - 5 * incr; strike -= incr) {
    const row = []
    row.push(
      <Grid key={strike} size={12/11} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', paddingRight: '8px', fontSize: '10pt', borderRight: '0.01px solid rgba(51, 27, 95, 0.30)' }}>
        <NeuTypography fontSize={12}>{strike.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</NeuTypography>
      </Grid>
    )

    const strikeCells = []
    for (let day = 1; day < 11; day++) {
      const thisDay = new Date(today.getTime() + day * 24 * 2600 * 1000)
      const thisDayString = `${thisDay.getFullYear() % 100}${thisDay.getMonth() + 1 < 10 ? 0 : ''}${thisDay.getMonth() + 1}${thisDay.getDate() < 10 ? 0 : ''}${thisDay.getDate()}`
      
      const optPrice = props.marketPrices[`${props.pair.substring(0, props.pair.length - 4)}-${thisDayString}-${(strike).toFixed(2)}-${props.optionType === 'call' ? 'C' : 'P'}`]
      const bsPrice = blackScholes(props.currentPrice, strike, (day + lowestDTE + remainingToday) / 365, props.riskFreeRate, props.hv, props.optionType)
      const iv = optPrice ? calculateIV(optPrice, props.currentPrice, strike, (day + lowestDTE + remainingToday) / 365, props.riskFreeRate, props.hv, props.optionType) : null
      const diff = optPrice > 0 ? optPrice - bsPrice : 0

      if (Math.abs(diff) > maxDiff)
        maxDiff = Math.abs(diff)

      strikeCells.push({
        diff,
        iv: iv !== null ? (iv * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %' : '',
        optPrice,
        bsPrice,
        isRef: strike === refPrice
      })
    }
    cells[strike] = strikeCells
  }
  for (let strike = refPrice + 5 * incr; strike >= refPrice - 5 * incr; strike -= incr) {
    const row = []
    row.push(
      <Grid key={strike} size={12/11} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', paddingRight: '8px', fontSize: '10pt', borderRight: '0.01px solid rgba(51, 27, 95, 0.30)' }}>
        <NeuTypography fontSize={12}>{strike.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</NeuTypography>
      </Grid>
    )
      for (const cell of cells[strike]) {
        row.push(
          <Grid key={row.length} size={12/11} 
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderTop: cell.isRef ? '3px solid rgba(51, 27, 95, 0.30)' : null,
              borderBottom: `${cell.isRef ? 4 : 0.01}px solid rgba(51, 27, 95, 0.30)`,
              borderRight: '0.01px solid rgba(51, 27, 95, 0.30)',
              textAlign: 'center',
              padding: '2px', 
              minHeight: '50px',
              backgroundColor: cell.diff < 0 ? 
                `rgba(100,200,130,${0.5 + 0.5 * Math.abs(cell.diff / maxDiff)})` 
                : cell.diff > 0 ? 
                `rgba(200,100,130,${0.5 + 0.5 * Math.abs(cell.diff / maxDiff)})` : undefined
            }}>
              <Box >
                <Box sx={{visibility: cell.optPrice ? 'visible' : 'hidden', fontWeight: 600}}><NeuTypography fontSize={12}>{cell.optPrice ? cell.optPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : <>-</>}</NeuTypography></Box>
                <Box>
                  { props.displayVal === 'fv' ? 
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

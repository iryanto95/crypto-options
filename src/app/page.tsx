'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import {
  Box,
  CardContent,
  Grid2 as Grid,
  InputAdornment
} from '@mui/material'

import NeuCard from './components/NeuCard'
import NeuMenuItem from './components/NeuMenuItem'
import NeuSelect from './components/NeuSelect'
import NeuSlider from './components/NeuSlider'
import NeuTextField from './components/NeuTextField'
import NeuTypography from './components/NeuTypography'

import Visualizer from './Visualizer'

const INTERVAL_TO_DAYS: {[key: string]: number} = {
  '4h': 1/6,
  '12h': 0.5,
  '1d': 1,
  '3d': 3,
  '1w': 7,
  '1M': 30,
}

export default function Home() {
  const [pair, setPair] = useState('BTCUSDT')
  const [riskFreeRate, setRiskFreeRate] = useState(5)
  const [interval, setInterval] = useState('1d')
  const [window, setWindow] = useState(30)
  const [volatility, setVolatility] = useState(-1)
  const [currentPrice, setCurrentPrice] = useState(-1)
  const [marketPrices, setMarketPrices] = useState([])

  const calculateVolatility = useCallback(async () => {
    // Fetch historical prices
    const { data: candles } = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${window}`)
    const prices = candles.map((c: Array<string>) => parseFloat(c[4]))

    // Calculate volatility
    const logReturns = []
    for (let i = 1; i < prices.length; i++)
      logReturns.push(Math.log(prices[i] / prices[i - 1]))

    const meanReturn = logReturns.reduce((a, b) => a + b, 0) / logReturns.length
    const variance   = logReturns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (logReturns.length - 1)
    setVolatility(Math.sqrt(variance) * Math.sqrt(365 / INTERVAL_TO_DAYS[interval]))
  }, [pair, interval, window])

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.toLocaleLowerCase()}@trade`)
    ws.onmessage = (e) => {
      setCurrentPrice(parseFloat(JSON.parse(e.data).p))
    }

    const ws2 = new WebSocket(`wss://nbstream.binance.com/eoptions/ws/${pair.substring(0, pair.length - 4)}@markPrice`)
    ws2.onmessage = (e) => {
      setMarketPrices(JSON.parse(e.data))
    }

    return () => {
      ws.close()
      ws2.close()
    }
  }, [pair])

  useEffect(() => {
    calculateVolatility()
  }, [calculateVolatility])

  return (
    <Box sx={{ padding: '16px 128px 16px 128px', background: '#cbc3db' }}>
      <Grid container spacing={4}>
        <Grid size={6}>
          <NeuCard sx={{ width: '100%', height: '100%', padding: '16px' }}>
            <CardContent>
              <Grid container spacing={2} sx={{ height: '100%' }}>
                <Grid size={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image src={`/${pair.substring(0, pair.length - 4).toLowerCase()}.svg`} alt='logo' width={200} height={200} style={{opacity: '0.8'}}/>
                </Grid>
                <Grid size={8} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Grid container spacing={2}>
                    <Grid size={4} sx={{ display: 'flex', alignItems: 'center' }}><NeuTypography>Pair</NeuTypography></Grid>
                    <Grid size={8}>
                      <NeuSelect value={pair} onChange={e => setPair(e.target.value as string)} inputProps={{ MenuProps: { MenuListProps: { sx: { backgroundColor: '#cbc3db' } } } }}>
                        <NeuMenuItem value={'BTCUSDT'}><NeuTypography>BTC/USDT</NeuTypography></NeuMenuItem>
                        <NeuMenuItem value={'ETHUSDT'}><NeuTypography>ETH/USDT</NeuTypography></NeuMenuItem>
                        <NeuMenuItem value={'SOLUSDT'}><NeuTypography>SOL/USDT</NeuTypography></NeuMenuItem>
                        <NeuMenuItem value={'BNBUSDT'}><NeuTypography>BNB/USDT</NeuTypography></NeuMenuItem>
                        <NeuMenuItem value={'XRPUSDT'}><NeuTypography>XRP/USDT</NeuTypography></NeuMenuItem>
                      </NeuSelect>
                    </Grid>
                    <Grid size={4}><NeuTypography>Underlying Price</NeuTypography></Grid>
                    <Grid size={8}><NeuTypography>{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</NeuTypography></Grid>
                    <Grid size={4}><NeuTypography>Historical Volatility</NeuTypography></Grid>
                    <Grid size={8}><NeuTypography>{(volatility * 100).toFixed(2)} %</NeuTypography></Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </NeuCard>
        </Grid>
        <Grid size={6}>
          <NeuCard sx={{ width: '100%', padding: '16px' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={4} sx={{ display: 'flex', alignItems: 'center' }}><NeuTypography>Risk Free Rate</NeuTypography></Grid>
                <Grid size={8}>
                  <NeuTextField
                    value={riskFreeRate} 
                    onChange={e => setRiskFreeRate(e.target.value !== '' ? parseFloat(e.target.value) : 0)}
                    slotProps={{ input: { endAdornment: <InputAdornment position='end'><NeuTypography>%</NeuTypography></InputAdornment> } }}/>
                </Grid>
                <Grid size={4} sx={{ display: 'flex', alignItems: 'center' }}><NeuTypography>Historical Volatility Interval</NeuTypography></Grid>
                <Grid size={8}>
                  <NeuSelect value={interval} onChange={e => setInterval(e.target.value as string)} inputProps={{ MenuProps: { MenuListProps: { sx: { backgroundColor: '#cbc3db' } } } }}>
                    <NeuMenuItem value={'4h'}><NeuTypography>4 hours</NeuTypography></NeuMenuItem>
                    <NeuMenuItem value={'12h'}><NeuTypography>12 hours</NeuTypography></NeuMenuItem>
                    <NeuMenuItem value={'1d'}><NeuTypography>1 day</NeuTypography></NeuMenuItem>
                    <NeuMenuItem value={'3d'}><NeuTypography>3 days</NeuTypography></NeuMenuItem>
                    <NeuMenuItem value={'1w'}><NeuTypography>1 week</NeuTypography></NeuMenuItem>
                    <NeuMenuItem value={'1M'}><NeuTypography>1 month</NeuTypography></NeuMenuItem>
                  </NeuSelect>
                </Grid>
                <Grid size={4} sx={{ display: 'flex', alignItems: 'center' }}><NeuTypography>Historical Volatility Window</NeuTypography></Grid>
                <Grid size={8}>
                  <NeuSlider value={window} max={360} min={10} onChange={e => setWindow(parseInt((e.target as HTMLInputElement).value))} step={10} valueLabelDisplay={'on'} />
                </Grid>
              </Grid>
            </CardContent>
          </NeuCard>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={4}>
            <Grid size={6}>
              <NeuCard>
                <CardContent>
                <Box sx={{textAlign: 'center', marginBottom: '16px'}}><NeuTypography variant='h5'>Calls</NeuTypography></Box>
                <Visualizer currentPrice={currentPrice} pair={pair} volatility={volatility} riskFreeRate={riskFreeRate/100} marketPrices={marketPrices} optionType={'call'}/>
                </CardContent>
              </NeuCard>
            </Grid>
            <Grid size={6}>
            <NeuCard>
            <CardContent>
            <Box sx={{textAlign: 'center', marginBottom: '16px'}}><NeuTypography variant='h5'>Puts</NeuTypography></Box>
              <Visualizer currentPrice={currentPrice} pair={pair} volatility={volatility} riskFreeRate={riskFreeRate/100} marketPrices={marketPrices} optionType={'put'}/>
              </CardContent></NeuCard></Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

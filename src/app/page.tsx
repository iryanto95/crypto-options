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
import NeuSwitch from './components/NeuSwitch'
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

type mp = {
  s: string
  mp: string
}

export default function Home() {
  const [pair, setPair] = useState('BTCUSDT')
  const [riskFreeRate, setRiskFreeRate] = useState(5)
  const [interval, setInterval] = useState('1d')
  const [window, setWindow] = useState(30)
  const [volatility, setVolatility] = useState(-1)
  const [currentPrice, setCurrentPrice] = useState(-1)
  const [marketPrices, setMarketPrices] = useState({}) 
  const [isClient, setIsClient] = useState(false)
  const [displayVal, setDisplayVal] = useState('fv')
  const [displayDay, setDisplayDay] = useState('expd')
 
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const ws_spotPrice = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.toLocaleLowerCase()}@trade`)
    ws_spotPrice.onmessage = (e) => {
      setCurrentPrice(parseFloat(JSON.parse(e.data).p))
    }

    const ws_optionMarketPrice = new WebSocket(`wss://nbstream.binance.com/eoptions/ws/${pair.substring(0, pair.length - 4)}@markPrice`)
    ws_optionMarketPrice.onmessage = (e) => {
      const incomingData = JSON.parse(e.data)
      
      const markets: {[key: string]: number} = {}
      incomingData.forEach((row: mp) => {
        const symbolArr = row.s.split('-')
        markets[`${symbolArr[0]}-${symbolArr[1]}-${parseFloat(symbolArr[2]).toFixed(2)}-${symbolArr[3]}`] = parseFloat(row.mp)
      })
      
      setMarketPrices((prev: {[key: string]: number}) => {
        return {
          ...prev,
          ...markets
        }
      })
    }

    return () => {
      ws_spotPrice.close()
      ws_optionMarketPrice.close()
    }
  }, [pair])

  const calculateHV = useCallback(async () => {
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
    calculateHV()
  }, [calculateHV])

  if (!isClient)
    return

  return (
    <Box sx={{ padding: '16px 8px 16px 8px', minHeight: '100vh', background: '#cbc3db', overflow: 'scroll' }}>
      <Grid container spacing={4} sx={{minWidth: '1460px', margin: '0px auto'}}>
        <Grid size={6}>
          <NeuCard sx={{ width: '100%', height: '100%', padding: '16px' }}>
            <CardContent>
              <Grid container spacing={2} sx={{ height: '100%' }}>
                <Grid size={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image priority src={`./${pair.substring(0, pair.length - 4).toLowerCase()}.svg`} alt='logo' width={200} height={200} style={{opacity: '0.8'}}/>
                </Grid>
                <Grid size={8} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Grid container spacing={2}>
                    <Grid size={5} sx={{ display: 'flex', alignItems: 'center' }}><NeuTypography>Pair</NeuTypography></Grid>
                    <Grid size={7}>
                      <NeuSelect 
                        value={pair} 
                        onChange={e => setPair(e.target.value as string)} 
                        sx={{ width: '100%' }}
                        inputProps={{ MenuProps: { MenuListProps: { sx: { backgroundColor: '#cbc3db' } } } }}>
                        <NeuMenuItem value={'BTCUSDT'}><NeuTypography>BTC/USDT</NeuTypography></NeuMenuItem>
                        <NeuMenuItem value={'ETHUSDT'}><NeuTypography>ETH/USDT</NeuTypography></NeuMenuItem>
                        <NeuMenuItem value={'SOLUSDT'}><NeuTypography>SOL/USDT</NeuTypography></NeuMenuItem>
                        <NeuMenuItem value={'BNBUSDT'}><NeuTypography>BNB/USDT</NeuTypography></NeuMenuItem>
                        <NeuMenuItem value={'XRPUSDT'}><NeuTypography>XRP/USDT</NeuTypography></NeuMenuItem>
                      </NeuSelect>
                    </Grid>
                    <Grid size={5}><NeuTypography>Spot Price</NeuTypography></Grid>
                    <Grid size={7}><NeuTypography>{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</NeuTypography></Grid>
                    <Grid size={5}><NeuTypography>Historical Volatility</NeuTypography></Grid>
                    <Grid size={7}><NeuTypography>{(volatility * 100).toFixed(2)} %</NeuTypography></Grid>
                    <Grid size={12}>
                      <Grid container spacing={0}>
                        <Grid size={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
                          <NeuTypography fontSize={12} display='inline'>Theoretical Value</NeuTypography>
                        </Grid>
                        <Grid size={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <NeuSwitch checked={displayVal === 'iv'} onChange={e => setDisplayVal(e.target.checked ? 'iv' : 'fv')}/>
                        </Grid>
                        <Grid size={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                          <NeuTypography fontSize={12} display='inline'>Implied Volatility (IV)</NeuTypography>
                        </Grid>
                        <Grid size={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
                          <NeuTypography fontSize={12} display='inline'>Expiry Date</NeuTypography>
                        </Grid>
                        <Grid size={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <NeuSwitch checked={displayDay === 'dte'} onChange={e => setDisplayDay(e.target.checked ? 'dte' : 'expd')}/>
                        </Grid>
                        <Grid size={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                          <NeuTypography fontSize={12} display='inline'>DTE</NeuTypography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </NeuCard>
        </Grid>
        <Grid size={6}>
          <NeuCard sx={{ width: '100%', padding: '16px', height: '100%' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={5} sx={{ display: 'flex', alignItems: 'center' }}><NeuTypography>Risk Free Rate</NeuTypography></Grid>
                <Grid size={7}>
                  <NeuTextField
                    value={riskFreeRate}
                    onChange={e => setRiskFreeRate(e.target.value !== '' ? parseFloat(e.target.value) : 0)}
                    sx={{ width: '50%' }}
                    slotProps={{ input: { endAdornment: <InputAdornment position='end'><NeuTypography>%</NeuTypography></InputAdornment> } }}/>
                </Grid>
                <Grid size={5} sx={{ display: 'flex', alignItems: 'center' }}><NeuTypography>Historical Volatility Interval</NeuTypography></Grid>
                <Grid size={7}>
                  <NeuSelect 
                    value={interval} 
                    onChange={e => setInterval(e.target.value as string)} 
                    sx={{ width: '50%' }}
                    inputProps={{ MenuProps: { MenuListProps: { sx: { backgroundColor: '#cbc3db' } } } }}>
                    <NeuMenuItem value={'4h'}><NeuTypography>4 hours</NeuTypography></NeuMenuItem>
                    <NeuMenuItem value={'12h'}><NeuTypography>12 hours</NeuTypography></NeuMenuItem>
                    <NeuMenuItem value={'1d'}><NeuTypography>1 day</NeuTypography></NeuMenuItem>
                    <NeuMenuItem value={'3d'}><NeuTypography>3 days</NeuTypography></NeuMenuItem>
                    <NeuMenuItem value={'1w'}><NeuTypography>1 week</NeuTypography></NeuMenuItem>
                    <NeuMenuItem value={'1M'}><NeuTypography>1 month</NeuTypography></NeuMenuItem>
                  </NeuSelect>
                </Grid>
                <Grid size={5} sx={{ display: 'flex', alignItems: 'center' }}><NeuTypography>Historical Volatility Window</NeuTypography></Grid>
                <Grid size={7}>
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
                  <Visualizer 
                    currentPrice={currentPrice} 
                    pair={pair} 
                    hv={volatility} 
                    riskFreeRate={riskFreeRate / 100} 
                    marketPrices={marketPrices} 
                    optionType={'call'}
                    displayVal={displayVal}
                    displayDay={displayDay}/>
                </CardContent>
              </NeuCard>
            </Grid>
            <Grid size={6}>
            <NeuCard>
              <CardContent>
                <Visualizer 
                  currentPrice={currentPrice} 
                  pair={pair} 
                  hv={volatility} 
                  riskFreeRate={riskFreeRate / 100} 
                  marketPrices={marketPrices} 
                  optionType={'put'}
                  displayVal={displayVal}
                  displayDay={displayDay}/>
                </CardContent>
              </NeuCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

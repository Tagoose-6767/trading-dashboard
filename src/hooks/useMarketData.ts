import { useState, useEffect, useCallback, useRef } from 'react'
import {
  generateWeatherSignal, generateWeatherTimeSeries,
  generateShippingSignal, generateBDITimeSeries,
  generateSatelliteSignal,
  generateAlphaScore, generateTrades, generateAlerts,
} from '../data/mockDataGenerator'
import type {
  WeatherSignal, WeatherDataPoint,
  ShippingSignal, BDIDataPoint,
  SatelliteSignal, AlphaScore, Trade, Alert,
} from '../types/signals'

export function useMarketData() {
  const [weather, setWeather] = useState<WeatherSignal>(generateWeatherSignal)
  const [weatherSeries, setWeatherSeries] = useState<WeatherDataPoint[]>(() => generateWeatherTimeSeries())
  const [shipping, setShipping] = useState<ShippingSignal>(generateShippingSignal)
  const [bdiSeries, setBdiSeries] = useState<BDIDataPoint[]>(() => generateBDITimeSeries())
  const [satellite, setSatellite] = useState<SatelliteSignal>(generateSatelliteSignal)
  const [alpha, setAlpha] = useState<AlphaScore>(generateAlphaScore)
  const [trades, setTrades] = useState<Trade[]>(() => generateTrades())
  const [alerts, setAlerts] = useState<Alert[]>(() => generateAlerts())
  const [tick, setTick] = useState(0)

  const tickRef = useRef(0)

  // Simulate WebSocket-like updates
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current++
      setTick(tickRef.current)
      const t = tickRef.current

      // Stagger updates so not everything refreshes at once
      if (t % 2 === 0) {
        setWeather(generateWeatherSignal())
        setWeatherSeries(prev => {
          const next = generateWeatherTimeSeries(1)[0]
          return [...prev.slice(-47), next]
        })
      }
      if (t % 3 === 0) {
        setShipping(generateShippingSignal())
        setBdiSeries(prev => {
          const last = generateBDITimeSeries(1)[0]
          return [...prev.slice(-59), last]
        })
      }
      if (t % 5 === 0) {
        setSatellite(generateSatelliteSignal())
      }
      if (t % 4 === 0) {
        setAlpha(generateAlphaScore())
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a))
  }, [])

  const closeTrade = useCallback((id: string) => {
    setTrades(prev => prev.map(t => t.id === id ? { ...t, status: 'closed' as const } : t))
  }, [])

  return {
    weather, weatherSeries,
    shipping, bdiSeries,
    satellite,
    alpha, trades, alerts,
    dismissAlert, closeTrade,
    tick,
  }
}

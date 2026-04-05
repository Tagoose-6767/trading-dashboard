import type {
  WeatherSignal, WeatherDataPoint,
  ShippingSignal, ShippingRoute, BDIDataPoint,
  SatelliteSignal, OilPort, RetailLot, NightLightRegion,
  AlphaScore, TradeRecommendation, Trade, Alert,
  Direction,
} from '../types/signals'

// ─── Seeded randomness helpers ───────────────────────────────────────────────
let seed = Date.now()
function rand(min = 0, max = 1): number {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff
  const t = ((seed >>> 0) / 0xffffffff)
  return min + t * (max - min)
}
function pick<T>(arr: T[]): T { return arr[Math.floor(rand(0, arr.length))] }
function dir(v: number, threshold = 0): Direction {
  if (v > threshold) return 'bullish'
  if (v < -threshold) return 'bearish'
  return 'neutral'
}

// ─── Weather ─────────────────────────────────────────────────────────────────
const REGIONS = ['Midwest US', 'Gulf Coast', 'Pacific Northwest', 'Great Plains', 'Southeast US', 'Northeast US']
const COMMODITIES = ['corn', 'wheat', 'soybeans', 'cattle', 'natural_gas', 'heating_oil', 'crude_oil']

export function generateWeatherSignal(): WeatherSignal {
  const severity = Math.round(rand(20, 95))
  const region = pick(REGIONS)
  const numAssets = Math.floor(rand(2, 5))
  const assets = Array.from({ length: numAssets }, () => {
    const impact = parseFloat(rand(0.3, 0.95).toFixed(2))
    return {
      commodity: pick(COMMODITIES),
      impact_score: impact,
      direction: rand() > 0.5 ? 'bullish' : 'bearish' as Direction,
    }
  })
  const signals = ['BUY_CORN_FUTURES', 'SELL_WHEAT_FUTURES', 'BUY_NATGAS', 'BUY_HEATOIL', 'SELL_SOYBEANS', 'BUY_CRUDE']
  return {
    timestamp: new Date().toISOString(),
    region,
    severity,
    forecast_days: Math.floor(rand(3, 14)),
    impacted_assets: assets,
    confidence: parseFloat(rand(0.6, 0.95).toFixed(2)),
    trade_signal: pick(signals),
  }
}

export function generateWeatherTimeSeries(points = 48): WeatherDataPoint[] {
  let baseSeverity = 45
  let baseCorn = 450
  let baseWheat = 580
  let baseNatgas = 2.8
  let baseHeatoil = 3.1
  return Array.from({ length: points }, (_, i) => {
    baseSeverity = Math.max(10, Math.min(95, baseSeverity + rand(-5, 5)))
    baseCorn = Math.max(400, baseCorn + rand(-8, 8))
    baseWheat = Math.max(500, baseWheat + rand(-10, 10))
    baseNatgas = Math.max(2.0, baseNatgas + rand(-0.1, 0.1))
    baseHeatoil = Math.max(2.5, baseHeatoil + rand(-0.08, 0.08))
    const t = new Date(Date.now() - (points - i) * 30 * 60 * 1000)
    return {
      time: t.toISOString(),
      severity: Math.round(baseSeverity),
      corn: Math.round(baseCorn * 10) / 10,
      wheat: Math.round(baseWheat * 10) / 10,
      natgas: Math.round(baseNatgas * 100) / 100,
      heatoil: Math.round(baseHeatoil * 100) / 100,
    }
  })
}

// ─── Shipping ─────────────────────────────────────────────────────────────────
const ROUTES: { name: string; origin: string; destination: string }[] = [
  { name: 'Shanghai–Rotterdam', origin: 'Shanghai', destination: 'Rotterdam' },
  { name: 'LA–Ningbo', origin: 'Los Angeles', destination: 'Ningbo' },
  { name: 'Singapore–Hamburg', origin: 'Singapore', destination: 'Hamburg' },
  { name: 'Hong Kong–Felixstowe', origin: 'Hong Kong', destination: 'Felixstowe' },
  { name: 'Santos–Rotterdam', origin: 'Santos', destination: 'Rotterdam' },
  { name: 'Busan–Long Beach', origin: 'Busan', destination: 'Long Beach' },
  { name: 'Dubai–Antwerp', origin: 'Dubai', destination: 'Antwerp' },
]

let bdiBase = 1240

export function generateShippingSignal(): ShippingSignal {
  bdiBase = Math.max(800, Math.min(3500, bdiBase + rand(-40, 40)))
  const bdiChange = parseFloat(rand(-2.5, 2.5).toFixed(2))
  const routes: ShippingRoute[] = ROUTES.map(r => {
    const ma20 = Math.round(rand(5000, 12000))
    const deviation = rand(-15, 20)
    const spot = Math.round(ma20 * (1 + deviation / 100))
    return {
      ...r,
      spot_rate: spot,
      ma20,
      deviation_pct: parseFloat(deviation.toFixed(2)),
      anomaly_severity: Math.abs(deviation) / 20,
      direction: dir(deviation, 2),
    }
  })
  return {
    timestamp: new Date().toISOString(),
    bdi: Math.round(bdiBase),
    bdi_change: bdiChange,
    routes,
    supply_chain_inflation_4w: parseFloat(rand(-0.5, 4.5).toFixed(2)),
    sector_recommendation: bdiBase > 1500 ? 'favor_domestic_suppliers' : 'favor_import_chains',
  }
}

export function generateBDITimeSeries(points = 60): BDIDataPoint[] {
  let bdi = 1240
  let ma = 1240
  return Array.from({ length: points }, (_, i) => {
    bdi = Math.max(700, Math.min(3500, bdi + rand(-60, 60)))
    ma = ma * 0.95 + bdi * 0.05
    const t = new Date(Date.now() - (points - i) * 24 * 60 * 60 * 1000)
    return {
      time: t.toISOString().split('T')[0],
      bdi: Math.round(bdi),
      ma20: Math.round(ma),
    }
  })
}

// ─── Satellite ────────────────────────────────────────────────────────────────
const PORTS: Omit<OilPort, 'tanker_count' | 'change_24h' | 'trend'>[] = [
  { port: 'Singapore', lat: 1.29, lng: 103.85 },
  { port: 'Rotterdam', lat: 51.9, lng: 4.47 },
  { port: 'Fujairah', lat: 25.12, lng: 56.34 },
  { port: 'Houston', lat: 29.75, lng: -95.36 },
  { port: 'Ningbo', lat: 29.86, lng: 121.54 },
  { port: 'Trieste', lat: 45.65, lng: 13.77 },
  { port: 'Kharg Island', lat: 29.24, lng: 50.32 },
]

const RETAILERS: { retailer: string; ticker: string }[] = [
  { retailer: 'Walmart', ticker: 'WMT' },
  { retailer: 'Target', ticker: 'TGT' },
  { retailer: 'Costco', ticker: 'COST' },
  { retailer: 'Home Depot', ticker: 'HD' },
  { retailer: 'Lowe\'s', ticker: 'LOW' },
  { retailer: 'Best Buy', ticker: 'BBY' },
  { retailer: 'Kohl\'s', ticker: 'KSS' },
  { retailer: 'Macy\'s', ticker: 'M' },
  { retailer: 'Dollar Tree', ticker: 'DLTR' },
  { retailer: 'TJX', ticker: 'TJX' },
]

const NIGHT_REGIONS: { region: string }[] = [
  { region: 'Northeast Asia' },
  { region: 'Western Europe' },
  { region: 'Eastern US' },
  { region: 'Southeast Asia' },
  { region: 'Middle East' },
  { region: 'South Asia' },
]

export function generateSatelliteSignal(): SatelliteSignal {
  const oil_ports: OilPort[] = PORTS.map(p => {
    const count = Math.round(rand(40, 120))
    const change = Math.round(rand(-8, 10))
    return { ...p, tanker_count: count, change_24h: change, trend: dir(change, 2) }
  })
  const retail_lots: RetailLot[] = RETAILERS.map(r => {
    const fill = parseFloat(rand(0.5, 0.95).toFixed(2))
    const vs_normal = parseFloat(rand(-0.15, 0.15).toFixed(2))
    const stock_change = parseFloat(rand(-3, 4).toFixed(2))
    return { ...r, fill_rate: fill, vs_normal, stock_change, trend: dir(vs_normal, 0.02) }
  })
  const night_light: NightLightRegion[] = NIGHT_REGIONS.map(r => {
    const intensity = parseFloat(rand(0.45, 0.92).toFixed(2))
    const mom = parseFloat(rand(-0.08, 0.12).toFixed(2))
    return { ...r, intensity, mom_change: mom, trend: dir(mom, 0.01) }
  })
  return { timestamp: new Date().toISOString(), oil_ports, retail_lots, night_light }
}

// ─── Alpha Score ──────────────────────────────────────────────────────────────
const TRADEABLE_ASSETS = [
  'CORN', 'WHEAT', 'SOYB', 'NG', 'CL', 'HO', 'XLE', 'XLI', 'XLY', 'WMT', 'TGT', 'COST'
]

export function generateAlphaScore(): AlphaScore {
  const w = Math.round(rand(45, 85))
  const s = Math.round(rand(40, 80))
  const sat = Math.round(rand(50, 90))
  const composite = Math.round(0.3 * w + 0.4 * s + 0.3 * sat)
  const consensus = parseFloat(rand(0.4, 0.95).toFixed(2))

  const best_trades: TradeRecommendation[] = Array.from({ length: 5 }, (_, i) => ({
    id: `rec-${Date.now()}-${i}`,
    asset: pick(TRADEABLE_ASSETS),
    direction: rand() > 0.45 ? 'bullish' : 'bearish' as Direction,
    confidence: parseFloat(rand(0.6, 0.97).toFixed(2)),
    signal_sources: [
      rand() > 0.5 ? 'weather' : '',
      rand() > 0.5 ? 'shipping' : '',
      rand() > 0.5 ? 'satellite' : '',
    ].filter(Boolean),
    expected_return: parseFloat(rand(1.5, 12).toFixed(1)),
    time_horizon: pick(['2-5 days', '1-2 weeks', '3-4 weeks', '1-2 months']),
    risk_level: pick(['low', 'medium', 'high']) as 'low' | 'medium' | 'high',
  }))

  return { composite, weather_score: w, shipping_score: s, satellite_score: sat, consensus, best_trades }
}

// ─── Trades ──────────────────────────────────────────────────────────────────
export function generateTrades(count = 8): Trade[] {
  return Array.from({ length: count }, (_, i) => {
    const direction: Direction = rand() > 0.5 ? 'bullish' : 'bearish'
    const entry = parseFloat(rand(10, 500).toFixed(2))
    const pnl_pct = parseFloat(rand(-8, 15).toFixed(2))
    const current = parseFloat((entry * (1 + pnl_pct / 100)).toFixed(2))
    const pnl = parseFloat(((current - entry) * rand(100, 1000)).toFixed(2))
    return {
      id: `trade-${i}`,
      asset: pick(TRADEABLE_ASSETS),
      direction,
      size: Math.round(rand(100, 1000)),
      entry_price: entry,
      current_price: current,
      pnl,
      pnl_pct,
      timestamp: new Date(Date.now() - rand(0, 7) * 86400000).toISOString(),
      status: rand() > 0.3 ? 'open' : 'closed',
      signal_source: pick(['weather', 'shipping', 'satellite', 'composite']),
    }
  })
}

// ─── Alerts ──────────────────────────────────────────────────────────────────
const ALERT_MESSAGES = [
  { type: 'weather' as const, sev: 'high' as const, msg: 'Cat-3 storm system detected over Gulf Coast — Energy positions at risk' },
  { type: 'shipping' as const, sev: 'critical' as const, msg: 'Shanghai-Rotterdam route anomaly: +18% above 20-day MA' },
  { type: 'satellite' as const, sev: 'medium' as const, msg: 'Singapore tanker accumulation +12 vessels in 24h — Bullish crude signal' },
  { type: 'weather' as const, sev: 'medium' as const, msg: 'Drought conditions expanding in Midwest corn belt' },
  { type: 'shipping' as const, sev: 'high' as const, msg: 'BDI broke above 200-day MA — Supply chain inflation risk rising' },
  { type: 'satellite' as const, sev: 'low' as const, msg: 'Walmart parking lot fill rates +5% vs seasonal norm — Consumer strength signal' },
  { type: 'trade' as const, sev: 'high' as const, msg: 'CORN position approaching max drawdown threshold (-7.2%)' },
  { type: 'satellite' as const, sev: 'medium' as const, msg: 'Northeast Asia nighttime light intensity up 8% MoM — Industrial expansion' },
]

export function generateAlerts(): Alert[] {
  return ALERT_MESSAGES.map((a, i) => ({
    id: `alert-${i}`,
    type: a.type,
    severity: a.sev,
    message: a.msg,
    timestamp: new Date(Date.now() - rand(0, 120) * 60 * 1000).toISOString(),
    dismissed: false,
  }))
}

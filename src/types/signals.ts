export type Direction = 'bullish' | 'bearish' | 'neutral'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type NavSection =
  | 'overview'
  | 'weather'
  | 'shipping'
  | 'satellite'
  | 'trades'
  | 'analytics'
  | 'risk'

export interface WeatherAssetImpact {
  commodity: string
  impact_score: number
  direction: Direction
}

export interface WeatherSignal {
  timestamp: string
  region: string
  severity: number // 0-100
  forecast_days: number
  impacted_assets: WeatherAssetImpact[]
  confidence: number
  trade_signal: string
}

export interface WeatherDataPoint {
  time: string
  severity: number
  corn: number
  wheat: number
  natgas: number
  heatoil: number
}

export interface ShippingRoute {
  name: string
  origin: string
  destination: string
  spot_rate: number
  ma20: number
  deviation_pct: number
  anomaly_severity: number
  direction: Direction
}

export interface ShippingSignal {
  timestamp: string
  bdi: number
  bdi_change: number
  routes: ShippingRoute[]
  supply_chain_inflation_4w: number
  sector_recommendation: string
}

export interface BDIDataPoint {
  time: string
  bdi: number
  ma20: number
}

export interface OilPort {
  port: string
  lat: number
  lng: number
  tanker_count: number
  change_24h: number
  trend: Direction
}

export interface RetailLot {
  retailer: string
  ticker: string
  fill_rate: number
  vs_normal: number
  stock_change: number
  trend: Direction
}

export interface NightLightRegion {
  region: string
  intensity: number
  mom_change: number
  trend: Direction
}

export interface SatelliteSignal {
  timestamp: string
  oil_ports: OilPort[]
  retail_lots: RetailLot[]
  night_light: NightLightRegion[]
}

export interface AlphaScore {
  composite: number
  weather_score: number
  shipping_score: number
  satellite_score: number
  consensus: number // 0-1 agreement strength
  best_trades: TradeRecommendation[]
}

export interface TradeRecommendation {
  id: string
  asset: string
  direction: Direction
  confidence: number
  signal_sources: string[]
  expected_return: number
  time_horizon: string
  risk_level: Severity
}

export interface Trade {
  id: string
  asset: string
  direction: Direction
  size: number
  entry_price: number
  current_price: number
  pnl: number
  pnl_pct: number
  timestamp: string
  status: 'open' | 'closed'
  signal_source: string
}

export interface Alert {
  id: string
  type: 'weather' | 'shipping' | 'satellite' | 'trade'
  severity: Severity
  message: string
  timestamp: string
  dismissed: boolean
}

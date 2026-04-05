import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { Zap, TrendingUp, TrendingDown, Target, CheckCircle2, XCircle } from 'lucide-react'
import { fmtPct, fmtUSD } from '../utils/formatting'
import type { AlphaScore, WeatherSignal, ShippingSignal, SatelliteSignal, TradeRecommendation } from '../types/signals'
import clsx from 'clsx'

const SEVERITY_LEVELS = [
  { label: 'low', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' },
  { label: 'medium', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40' },
  { label: 'high', color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/40' },
]

function AlphaGauge({ score }: { score: number }) {
  const angle = (score / 100) * 180
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#e11d48'
  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 80 }}>
      <svg viewBox="0 0 140 80" className="absolute inset-0 w-full h-full">
        {/* Background arc */}
        <path
          d="M 10,70 A 60,60 0 0,1 130,70"
          fill="none" stroke="#1e3a5f" strokeWidth="12" strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d="M 10,70 A 60,60 0 0,1 130,70"
          fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 188} 188`}
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
        {/* Needle */}
        <line
          x1="70" y1="70"
          x2={70 + 50 * Math.cos((180 - angle) * Math.PI / 180)}
          y2={70 - 50 * Math.sin((180 - angle) * Math.PI / 180)}
          stroke={color} strokeWidth="2" strokeLinecap="round"
        />
        <circle cx="70" cy="70" r="4" fill={color} />
      </svg>
      <div className="absolute bottom-0 text-center">
        <div className="font-mono text-2xl font-bold" style={{ color }}>{score}</div>
        <div className="text-[10px] text-slate-500">/ 100</div>
      </div>
    </div>
  )
}

function RecommendationCard({ rec }: { rec: TradeRecommendation }) {
  const isBull = rec.direction === 'bullish'
  return (
    <div className={clsx(
      'rounded-lg border p-3 transition-all hover:scale-[1.01]',
      isBull ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-rose-500/40 bg-rose-500/5'
    )}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold text-white">{rec.asset}</span>
            <span className={clsx(
              'text-[10px] px-1.5 py-0.5 rounded font-bold',
              isBull ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            )}>
              {isBull ? '▲ LONG' : '▼ SHORT'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span>{rec.time_horizon}</span>
            <span>·</span>
            <span>{rec.signal_sources.join(', ') || 'composite'}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={clsx('font-mono text-sm font-bold', isBull ? 'text-emerald-400' : 'text-rose-400')}>
            +{rec.expected_return.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500">expected</div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-slate-700">
          <div
            className={isBull ? 'bg-emerald-400 h-full rounded-full' : 'bg-rose-400 h-full rounded-full'}
            style={{ width: `${rec.confidence * 100}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-slate-400">{(rec.confidence * 100).toFixed(0)}% conf</span>
      </div>
    </div>
  )
}

interface OverviewModuleProps {
  alpha: AlphaScore
  weather: WeatherSignal
  shipping: ShippingSignal
  satellite: SatelliteSignal
}

export default function OverviewModule({ alpha, weather, shipping, satellite }: OverviewModuleProps) {
  const radarData = [
    { subject: 'Weather', score: alpha.weather_score },
    { subject: 'Shipping', score: alpha.shipping_score },
    { subject: 'Satellite', score: alpha.satellite_score },
    { subject: 'Momentum', score: Math.round((alpha.composite + alpha.consensus * 100) / 2) },
    { subject: 'Risk-Adj', score: Math.round(100 - (alpha.composite * 0.3)) },
  ]

  // Simulated portfolio equity curve
  const equityCurve = Array.from({ length: 30 }, (_, i) => {
    const t = new Date(Date.now() - (29 - i) * 86400000)
    return {
      date: t.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: 1_200_000 + i * 1800 + Math.sin(i * 0.5) * 15000,
    }
  })

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h2 className="text-lg font-bold text-white">AlphaSignal Overview</h2>
        <div className="ml-auto text-xs text-slate-500">Composite signal dashboard — all three sources</div>
      </div>

      {/* Alpha score + radar + equity */}
      <div className="grid grid-cols-3 gap-4">
        {/* Alpha gauge */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 flex flex-col items-center">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Composite Alpha Score</div>
          <AlphaGauge score={alpha.composite} />
          <div className="mt-3 w-full space-y-2">
            {[
              { label: 'Weather (30%)', value: alpha.weather_score, color: 'bg-blue-400' },
              { label: 'Shipping (40%)', value: alpha.shipping_score, color: 'bg-amber-400' },
              { label: 'Satellite (30%)', value: alpha.satellite_score, color: 'bg-purple-400' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-mono text-white">{item.value}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full">
                  <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center">
            <div className="text-xs text-slate-500">Signal Consensus</div>
            <div className={clsx(
              'font-mono text-lg font-bold',
              alpha.consensus > 0.7 ? 'text-emerald-400' : alpha.consensus > 0.4 ? 'text-amber-400' : 'text-rose-400'
            )}>
              {(alpha.consensus * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Radar */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Signal Strength Radar</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#1e3a5f" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar
                name="Score" dataKey="score"
                stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Equity curve */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Portfolio Equity (30d)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={equityCurve} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#64748b' }} interval={7} />
              <YAxis tick={{ fontSize: 8, fill: '#64748b' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [fmtUSD(v), 'Portfolio']}
              />
              <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#equityGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Signal status row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Weather Signal', region: weather.region, severity: weather.severity, signal: weather.trade_signal, src: 'NOAA' },
          { label: 'Shipping Signal', region: `BDI ${shipping.bdi.toLocaleString()}`, severity: Math.abs(shipping.bdi_change) * 10, signal: shipping.sector_recommendation.replace(/_/g, ' '), src: 'Baltic Exchange' },
          { label: 'Satellite Signal', region: satellite.oil_ports[0]?.port ?? 'Global', severity: 60, signal: satellite.oil_ports[0]?.trend ?? 'neutral', src: 'Orbital Analytics' },
        ].map(s => (
          <div key={s.label} className="bg-[#1e293b] border border-[#334155] rounded-xl p-3">
            <div className="text-xs text-slate-500 mb-1">{s.label}</div>
            <div className="flex items-center gap-2">
              <div className={clsx(
                'w-2 h-2 rounded-full',
                s.severity >= 70 ? 'bg-rose-400' : s.severity >= 40 ? 'bg-amber-400' : 'bg-emerald-400'
              )} />
              <span className="text-sm font-semibold text-white">{s.region}</span>
            </div>
            <div className="text-xs font-mono text-amber-400 mt-1 truncate">{s.signal.toUpperCase()}</div>
            <div className="text-[10px] text-slate-600 mt-1">Source: {s.src}</div>
          </div>
        ))}
      </div>

      {/* Top recommendations */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Top Trade Recommendations</span>
          </div>
          <span className="text-xs text-slate-600">Ranked by confidence × expected return</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {alpha.best_trades.map(rec => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      </div>
    </div>
  )
}

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, AreaChart, Area,
} from 'recharts'
import { Cloud, Thermometer, Wind, Droplets } from 'lucide-react'
import { severityColor, severityBg, fmtPct } from '../utils/formatting'
import type { WeatherSignal, WeatherDataPoint } from '../types/signals'
import clsx from 'clsx'

const REGION_MAP: Record<string, { x: number; y: number }> = {
  'Midwest US': { x: 45, y: 38 },
  'Gulf Coast': { x: 42, y: 62 },
  'Pacific Northwest': { x: 12, y: 28 },
  'Great Plains': { x: 35, y: 42 },
  'Southeast US': { x: 57, y: 58 },
  'Northeast US': { x: 70, y: 30 },
}

interface WeatherModuleProps {
  signal: WeatherSignal
  series: WeatherDataPoint[]
}

function SeverityBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            value >= 80 ? 'bg-rose-500' : value >= 60 ? 'bg-amber-500' : value >= 40 ? 'bg-yellow-400' : 'bg-emerald-400'
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={clsx('font-mono text-sm font-bold', severityColor(value))}>{value}</span>
    </div>
  )
}

export default function WeatherModule({ signal, series }: WeatherModuleProps) {
  const chartData = series.slice(-24).map(d => ({
    time: new Date(d.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    Severity: d.severity,
    Corn: d.corn,
    Wheat: d.wheat,
    'Nat Gas': d.natgas,
  }))

  const regionPos = REGION_MAP[signal.region] ?? { x: 50, y: 50 }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Weather Derivative Cross-Signals</h2>
        </div>
        <div className={clsx('text-xs px-3 py-1 rounded-full border font-semibold', severityBg(signal.severity))}>
          <span className={severityColor(signal.severity)}>
            {signal.severity >= 80 ? 'CRITICAL' : signal.severity >= 60 ? 'HIGH' : signal.severity >= 40 ? 'MODERATE' : 'LOW'} SEVERITY
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-1">Active Region</div>
          <div className="text-sm font-semibold text-white">{signal.region}</div>
        </div>
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-1">Forecast Window</div>
          <div className="text-sm font-semibold text-white">{signal.forecast_days} days</div>
        </div>
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-1">Model Confidence</div>
          <div className="text-sm font-semibold text-emerald-400 font-mono">{(signal.confidence * 100).toFixed(0)}%</div>
        </div>
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-1">Trade Signal</div>
          <div className="text-xs font-bold text-amber-400 font-mono">{signal.trade_signal}</div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-4 flex-1">
        {/* US heatmap */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">Regional Risk Map (US)</div>
          <div className="relative w-full" style={{ paddingBottom: '75%' }}>
            <div className="absolute inset-0 rounded-lg overflow-hidden bg-[#0f172a]">
              {/* Simplified US outline SVG */}
              <svg viewBox="0 0 100 70" className="w-full h-full opacity-30">
                <path
                  d="M10,15 L20,12 L40,10 L60,10 L80,12 L90,18 L92,30 L88,45 L80,55 L70,60 L50,62 L30,60 L15,52 L8,40 L10,25 Z"
                  fill="none" stroke="#334155" strokeWidth="0.5"
                />
              </svg>
              {/* Risk blobs per region */}
              {Object.entries(REGION_MAP).map(([name, pos]) => {
                const isCurrent = name === signal.region
                const sev = isCurrent ? signal.severity : Math.round(20 + Math.random() * 50)
                const color = sev >= 80 ? '#e11d48' : sev >= 60 ? '#f59e0b' : sev >= 40 ? '#eab308' : '#10b981'
                return (
                  <div
                    key={name}
                    className="absolute rounded-full transition-all duration-700"
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      width: isCurrent ? 28 : 18,
                      height: isCurrent ? 28 : 18,
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: color,
                      opacity: isCurrent ? 0.8 : 0.4,
                      boxShadow: isCurrent ? `0 0 20px ${color}80` : undefined,
                    }}
                  />
                )
              })}
              {/* Label */}
              <div
                className="absolute text-[8px] text-white font-bold bg-black/60 px-1 rounded"
                style={{ left: `${regionPos.x}%`, top: `${regionPos.y + 8}%`, transform: 'translateX(-50%)' }}
              >
                {signal.region.split(' ')[0]}
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-3 text-[10px]">
            {[['LOW','bg-emerald-400'],['MOD','bg-yellow-400'],['HIGH','bg-amber-500'],['CRIT','bg-rose-500']].map(([l,c]) => (
              <div key={l} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${c}`} />
                <span className="text-slate-500">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Severity over time */}
        <div className="col-span-2 bg-[#1e293b] border border-[#334155] rounded-xl p-4">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">
            Weather Severity &amp; Commodity Price Correlation (24h)
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b' }} interval={5} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="Severity" stroke="#f59e0b" fill="url(#sevGrad)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Corn" stroke="#10b981" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Wheat" stroke="#60a5fa" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Impacted assets */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">Asset Impact Matrix</div>
        <div className="grid grid-cols-2 gap-3">
          {signal.impacted_assets.map((asset, i) => (
            <div key={i} className="flex items-center justify-between bg-[#0f172a] rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                  asset.direction === 'bullish' ? 'bg-emerald-400' : 'bg-rose-400'
                )} />
                <span className="text-sm font-semibold text-white capitalize">{asset.commodity.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={asset.direction === 'bullish' ? 'bg-emerald-400 h-full rounded-full' : 'bg-rose-400 h-full rounded-full'}
                    style={{ width: `${asset.impact_score * 100}%` }}
                  />
                </div>
                <span className={clsx(
                  'text-xs font-mono font-bold',
                  asset.direction === 'bullish' ? 'text-emerald-400' : 'text-rose-400'
                )}>
                  {asset.direction === 'bullish' ? '▲' : '▼'} {(asset.impact_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Severity gauge */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">Current Severity Score</div>
        <SeverityBar value={signal.severity} />
        <div className="flex justify-between mt-1 text-[10px] text-slate-600">
          <span>Low Risk</span><span>Moderate</span><span>High</span><span>Critical</span>
        </div>
      </div>
    </div>
  )
}

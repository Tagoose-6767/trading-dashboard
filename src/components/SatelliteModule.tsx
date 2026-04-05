import {
  ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { Satellite, MapPin, ShoppingCart, Globe } from 'lucide-react'
import type { SatelliteSignal } from '../types/signals'
import clsx from 'clsx'

const DIR_COLOR: Record<string, string> = {
  bullish: 'text-emerald-400',
  bearish: 'text-rose-400',
  neutral: 'text-slate-400',
}

const DIR_ICON: Record<string, string> = {
  bullish: '▲',
  bearish: '▼',
  neutral: '–',
}

function GaugeChart({ value, label }: { value: number; label: string }) {
  const data = [{ name: 'fill', value, fill: value > 0.8 ? '#10b981' : value > 0.6 ? '#3b82f6' : '#f59e0b' }]
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 80, height: 50 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="80%"
            innerRadius="60%" outerRadius="100%"
            startAngle={180} endAngle={0}
            data={data}
          >
            <RadialBar dataKey="value" cornerRadius={4} background={{ fill: '#1e3a5f' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="font-mono text-xs font-bold text-white">{(value * 100).toFixed(0)}%</span>
        </div>
      </div>
      <div className="text-[10px] text-slate-500 text-center mt-1 max-w-16 leading-tight">{label}</div>
    </div>
  )
}

interface SatelliteModuleProps {
  signal: SatelliteSignal
}

export default function SatelliteModule({ signal }: SatelliteModuleProps) {
  const retailBarData = signal.retail_lots.slice(0, 8).map(r => ({
    name: r.ticker,
    fill: r.fill_rate * 100,
    normal: (0.7) * 100,
  }))

  const nightLightBar = signal.night_light.map(n => ({
    region: n.region.split(' ')[0],
    intensity: Math.round(n.intensity * 100),
    change: Math.round(n.mom_change * 100),
  }))

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Satellite className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-bold text-white">Satellite-Derived Inventory Signals</h2>
      </div>

      {/* Oil Ports */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Oil Tanker Port Monitoring</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {signal.oil_ports.map((port, i) => (
            <div
              key={i}
              className={clsx(
                'rounded-lg border p-2 text-center transition-all',
                port.trend === 'bullish' ? 'border-emerald-500/40 bg-emerald-500/10' :
                port.trend === 'bearish' ? 'border-rose-500/40 bg-rose-500/10' :
                'border-[#334155] bg-[#0f172a]'
              )}
            >
              <div className="text-[9px] text-slate-500 mb-1 truncate">{port.port}</div>
              <div className="font-mono text-sm font-bold text-white">{port.tanker_count}</div>
              <div className="text-[9px] text-slate-500">tankers</div>
              <div className={clsx('text-[10px] font-bold mt-1', DIR_COLOR[port.trend])}>
                {DIR_ICON[port.trend]} {port.change_24h > 0 ? '+' : ''}{port.change_24h}
              </div>
            </div>
          ))}
        </div>

        {/* Simplified world map dots */}
        <div className="relative mt-3 rounded-lg bg-[#0a1628] overflow-hidden" style={{ height: 100 }}>
          <div className="absolute inset-0 opacity-20">
            {/* Continent silhouettes via divs */}
            <div className="absolute rounded-lg bg-slate-700" style={{ left: '8%', top: '20%', width: '18%', height: '55%' }} />
            <div className="absolute rounded-lg bg-slate-700" style={{ left: '30%', top: '15%', width: '22%', height: '50%' }} />
            <div className="absolute rounded-lg bg-slate-700" style={{ left: '56%', top: '10%', width: '20%', height: '60%' }} />
            <div className="absolute rounded-lg bg-slate-700" style={{ left: '78%', top: '20%', width: '12%', height: '50%' }} />
          </div>
          {signal.oil_ports.map((port, i) => {
            const x = ((port.lng + 180) / 360) * 100
            const y = ((90 - port.lat) / 180) * 100
            return (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full border-2 border-white/30 transition-all"
                title={`${port.port}: ${port.tanker_count} tankers`}
                style={{
                  left: `${Math.max(2, Math.min(97, x))}%`,
                  top: `${Math.max(5, Math.min(90, y))}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: port.trend === 'bullish' ? '#10b981' : port.trend === 'bearish' ? '#e11d48' : '#64748b',
                  width: Math.max(8, port.tanker_count / 10),
                  height: Math.max(8, port.tanker_count / 10),
                  boxShadow: `0 0 8px ${port.trend === 'bullish' ? '#10b98150' : '#e11d4850'}`,
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Retail lots + night light grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Retail parking lots */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Retail Parking Fill Rates</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={retailBarData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [`${v.toFixed(1)}%`, 'Fill Rate']}
              />
              <Bar dataKey="fill" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="normal" fill="#334155" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {/* Gauge row */}
          <div className="flex justify-around mt-3 border-t border-[#334155] pt-3">
            {signal.retail_lots.slice(0, 4).map((r, i) => (
              <GaugeChart key={i} value={r.fill_rate} label={r.ticker} />
            ))}
          </div>
        </div>

        {/* Night light intensity */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Nighttime Light Intensity</span>
          </div>
          <div className="flex flex-col gap-2">
            {signal.night_light.map((region, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-xs text-slate-400 w-24 shrink-0">{region.region}</div>
                <div className="flex-1 h-4 rounded-full bg-[#0f172a] overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${region.intensity * 100}%`,
                      background: `linear-gradient(90deg, #1d4ed8, #7c3aed, #fbbf24)`,
                    }}
                  />
                </div>
                <div className={clsx(
                  'text-xs font-mono font-bold w-12 text-right',
                  DIR_COLOR[region.trend]
                )}>
                  {DIR_ICON[region.trend]} {Math.abs(region.mom_change * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {nightLightBar.slice(0, 3).map((r, i) => (
              <div key={i} className="bg-[#0f172a] rounded-lg p-2 text-center">
                <div className="text-[10px] text-slate-500 truncate">{r.region}</div>
                <div className="font-mono text-sm font-bold text-white">{r.intensity}</div>
                <div className={clsx(
                  'text-[10px] font-bold',
                  r.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                )}>
                  {r.change >= 0 ? '▲' : '▼'} {Math.abs(r.change)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Retail details table */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">Retail Inventory Health Signals</div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-[#334155]">
              <th className="text-left pb-2 font-medium">Retailer</th>
              <th className="text-right pb-2 font-medium">Ticker</th>
              <th className="text-right pb-2 font-medium">Fill Rate</th>
              <th className="text-right pb-2 font-medium">vs Normal</th>
              <th className="text-right pb-2 font-medium">Stock Δ</th>
              <th className="text-center pb-2 font-medium">Signal</th>
            </tr>
          </thead>
          <tbody>
            {signal.retail_lots.map((r, i) => (
              <tr key={i} className="border-b border-[#1e3a5f]/50 hover:bg-[#334155]/20">
                <td className="py-2 text-white font-medium">{r.retailer}</td>
                <td className="py-2 text-right font-mono text-slate-400">{r.ticker}</td>
                <td className="py-2 text-right font-mono">{(r.fill_rate * 100).toFixed(1)}%</td>
                <td className={clsx('py-2 text-right font-mono font-bold', r.vs_normal >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                  {r.vs_normal >= 0 ? '+' : ''}{(r.vs_normal * 100).toFixed(1)}%
                </td>
                <td className={clsx('py-2 text-right font-mono font-bold', r.stock_change >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                  {r.stock_change >= 0 ? '+' : ''}{r.stock_change.toFixed(2)}%
                </td>
                <td className="py-2 text-center">
                  <span className={clsx(
                    'px-2 py-0.5 rounded text-[10px] font-bold',
                    r.trend === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                    r.trend === 'bearish' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-slate-500/20 text-slate-400'
                  )}>
                    {r.trend.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

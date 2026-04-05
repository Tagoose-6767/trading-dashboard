import {
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts'
import { Ship, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { fmtPrice, fmtPct } from '../utils/formatting'
import type { ShippingSignal, BDIDataPoint, ShippingRoute } from '../types/signals'
import clsx from 'clsx'

function DirectionIcon({ dir }: { dir: ShippingRoute['direction'] }) {
  if (dir === 'bullish') return <TrendingUp className="w-4 h-4 text-emerald-400" />
  if (dir === 'bearish') return <TrendingDown className="w-4 h-4 text-rose-400" />
  return <Minus className="w-4 h-4 text-slate-500" />
}

function DeviationBadge({ pct }: { pct: number }) {
  const abs = Math.abs(pct)
  const col = abs > 10 ? 'text-rose-400 bg-rose-500/20' : abs > 5 ? 'text-amber-400 bg-amber-500/20' : 'text-emerald-400 bg-emerald-500/20'
  return (
    <span className={clsx('font-mono text-xs px-2 py-0.5 rounded font-bold', col)}>
      {fmtPct(pct)}
    </span>
  )
}

interface ShippingModuleProps {
  signal: ShippingSignal
  bdiSeries: BDIDataPoint[]
}

export default function ShippingModule({ signal, bdiSeries }: ShippingModuleProps) {
  const chartData = bdiSeries.slice(-30).map(d => ({
    date: d.time.slice(5),
    BDI: d.bdi,
    'MA-20': d.ma20,
  }))

  const anomalies = signal.routes.filter(r => Math.abs(r.deviation_pct) > 5)
  const favoring = signal.sector_recommendation === 'favor_domestic_suppliers' ? 'Domestic Suppliers' : 'Import Chains'

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ship className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Shipping Container Rate Anomalies</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2">
            <div className="text-xs text-slate-500">Baltic Dry Index</div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold text-white">{fmtPrice(signal.bdi, 0)}</span>
              <span className={clsx(
                'text-xs font-mono font-semibold',
                signal.bdi_change >= 0 ? 'text-emerald-400' : 'text-rose-400'
              )}>
                {fmtPct(signal.bdi_change)}
              </span>
            </div>
          </div>
          <div className="text-center bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2">
            <div className="text-xs text-slate-500">Inflation Outlook (4w)</div>
            <div className={clsx(
              'font-mono text-xl font-bold',
              signal.supply_chain_inflation_4w > 2 ? 'text-rose-400' : signal.supply_chain_inflation_4w > 0 ? 'text-amber-400' : 'text-emerald-400'
            )}>
              {fmtPct(signal.supply_chain_inflation_4w, 1)}
            </div>
          </div>
          <div className="text-center bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-2">
            <div className="text-xs text-slate-500">Rotation Signal</div>
            <div className="text-xs font-bold text-blue-400 mt-0.5">{favoring}</div>
          </div>
        </div>
      </div>

      {/* BDI Chart */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">
          Baltic Dry Index — 30 Day History
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} interval={4} />
            <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="BDI" fill="#3b82f6" opacity={0.6} radius={[2, 2, 0, 0]} />
            <Line type="monotone" dataKey="MA-20" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Routes table */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Major Shipping Routes</div>
          {anomalies.length > 0 && (
            <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
              {anomalies.length} anomalies detected
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-[#334155]">
                <th className="text-left pb-2 font-medium">Route</th>
                <th className="text-right pb-2 font-medium">Spot Rate</th>
                <th className="text-right pb-2 font-medium">MA-20</th>
                <th className="text-right pb-2 font-medium">Deviation</th>
                <th className="text-center pb-2 font-medium">Trend</th>
                <th className="text-center pb-2 font-medium">Anomaly</th>
              </tr>
            </thead>
            <tbody>
              {signal.routes.map((route, i) => (
                <tr
                  key={i}
                  className={clsx(
                    'border-b border-[#1e3a5f]/50 hover:bg-[#334155]/20 transition-colors',
                    Math.abs(route.deviation_pct) > 10 && 'bg-amber-500/5'
                  )}
                >
                  <td className="py-2.5 font-medium text-white">{route.name}</td>
                  <td className="py-2.5 text-right font-mono text-slate-300">${fmtPrice(route.spot_rate, 0)}</td>
                  <td className="py-2.5 text-right font-mono text-slate-500">${fmtPrice(route.ma20, 0)}</td>
                  <td className="py-2.5 text-right">
                    <DeviationBadge pct={route.deviation_pct} />
                  </td>
                  <td className="py-2.5 text-center">
                    <div className="flex justify-center">
                      <DirectionIcon dir={route.direction} />
                    </div>
                  </td>
                  <td className="py-2.5 text-center">
                    <div className="flex justify-center">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: route.anomaly_severity > 0.7 ? '#e11d48' :
                            route.anomaly_severity > 0.4 ? '#f59e0b' : '#10b981',
                          boxShadow: route.anomaly_severity > 0.7 ? '0 0 6px #e11d4880' : undefined,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sector rotation cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className={clsx(
          'rounded-xl border p-4',
          signal.bdi > 1500
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-[#1e293b] border-[#334155] opacity-50'
        )}>
          <div className="text-xs font-bold text-emerald-400 mb-2">FAVOR: Domestic Suppliers</div>
          <div className="text-xs text-slate-400 leading-relaxed">
            High shipping rates → Import costs elevated → Domestic producers gain margin advantage. Consider XLI, domestic retail.
          </div>
        </div>
        <div className={clsx(
          'rounded-xl border p-4',
          signal.bdi <= 1500
            ? 'bg-blue-500/10 border-blue-500/30'
            : 'bg-[#1e293b] border-[#334155] opacity-50'
        )}>
          <div className="text-xs font-bold text-blue-400 mb-2">FAVOR: Import Chains</div>
          <div className="text-xs text-slate-400 leading-relaxed">
            Low shipping rates → Cheap imports → Retailers and consumer goods with Asian supply chains benefit. Consider XLY, retail.
          </div>
        </div>
      </div>
    </div>
  )
}

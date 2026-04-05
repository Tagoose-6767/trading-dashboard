import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ScatterChart, Scatter, ZAxis,
} from 'recharts'
import { History } from 'lucide-react'
import type { Trade } from '../types/signals'
import clsx from 'clsx'

const MONTHLY_DATA = [
  { month: 'Oct', pnl: 12400, trades: 14, winRate: 71 },
  { month: 'Nov', pnl: -3200, trades: 11, winRate: 45 },
  { month: 'Dec', pnl: 18900, trades: 16, winRate: 75 },
  { month: 'Jan', pnl: 8700, trades: 13, winRate: 62 },
  { month: 'Feb', pnl: 22100, trades: 18, winRate: 78 },
  { month: 'Mar', pnl: 15600, trades: 15, winRate: 67 },
]

const SIGNAL_ACCURACY = [
  { signal: 'Weather', accuracy: 68, avgReturn: 4.2, trades: 42 },
  { signal: 'Shipping', accuracy: 74, avgReturn: 5.8, trades: 38 },
  { signal: 'Satellite', accuracy: 71, avgReturn: 4.9, trades: 29 },
  { signal: 'Composite', accuracy: 79, avgReturn: 6.3, trades: 51 },
]

const CORR_MATRIX = [
  { asset: 'CORN', weather: 0.82, shipping: 0.23, satellite: 0.41 },
  { asset: 'WHEAT', weather: 0.78, shipping: 0.19, satellite: 0.35 },
  { asset: 'CL', weather: 0.44, shipping: 0.67, satellite: 0.89 },
  { asset: 'NG', weather: 0.91, shipping: 0.18, satellite: 0.52 },
  { asset: 'XLE', weather: 0.39, shipping: 0.71, satellite: 0.78 },
  { asset: 'XLI', weather: 0.21, shipping: 0.88, satellite: 0.45 },
]

function CorrCell({ value }: { value: number }) {
  const abs = Math.abs(value)
  const opacity = 0.2 + abs * 0.8
  return (
    <td
      className="px-3 py-2 text-center font-mono text-xs font-semibold"
      style={{
        backgroundColor: value > 0
          ? `rgba(16, 185, 129, ${opacity * 0.3})`
          : `rgba(225, 29, 72, ${opacity * 0.3})`,
        color: value > 0.6 ? '#10b981' : value > 0.3 ? '#94a3b8' : '#64748b',
      }}
    >
      {value.toFixed(2)}
    </td>
  )
}

interface AnalyticsModuleProps {
  trades: Trade[]
}

export default function AnalyticsModule({ trades }: AnalyticsModuleProps) {
  const closedTrades = trades.filter(t => t.status === 'closed')
  const allPnL = trades.map(t => t.pnl)
  const totalReturn = allPnL.reduce((s, v) => s + v, 0)
  const maxDD = Math.min(...allPnL) / 1_250_000 * 100
  const sharpe = (totalReturn / 1_250_000 * 100) / (8.5) // simplified

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-bold text-white">Historical Analysis & Performance</h2>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total Return', value: `${((totalReturn / 1_250_000) * 100).toFixed(1)}%`, color: totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'Sharpe Ratio', value: sharpe.toFixed(2), color: sharpe > 1 ? 'text-emerald-400' : 'text-amber-400' },
          { label: 'Max Drawdown', value: `${maxDD.toFixed(1)}%`, color: 'text-rose-400' },
          { label: 'Avg Win Rate', value: '69.8%', color: 'text-emerald-400' },
          { label: 'Avg Hold Time', value: '8.3 days', color: 'text-blue-400' },
        ].map(m => (
          <div key={m.label} className="bg-[#1e293b] border border-[#334155] rounded-xl p-3">
            <div className="text-xs text-slate-500">{m.label}</div>
            <div className={clsx('font-mono text-xl font-bold mt-1', m.color)}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Monthly P&L + Win Rate */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">Monthly P&L</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MONTHLY_DATA} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={v => `$${v / 1000}K`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, 'P&L']}
              />
              <Bar dataKey="pnl" radius={[3, 3, 0, 0]}
                fill="#10b981"
                label={false}
              >
                {MONTHLY_DATA.map((d, i) => (
                  <rect key={i} fill={d.pnl >= 0 ? '#10b981' : '#e11d48'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">Win Rate by Month</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={MONTHLY_DATA} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [`${v}%`, 'Win Rate']}
              />
              <Line type="monotone" dataKey="winRate" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Signal accuracy */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">Signal Accuracy by Type</div>
        <div className="grid grid-cols-4 gap-3">
          {SIGNAL_ACCURACY.map(s => (
            <div key={s.signal} className="bg-[#0f172a] rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-2 font-semibold">{s.signal}</div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-blue-400"
                    style={{ width: `${s.accuracy}%` }}
                  />
                </div>
                <span className="font-mono text-sm font-bold text-blue-400">{s.accuracy}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <div>
                  <div className="text-slate-500">Avg Return</div>
                  <div className="font-mono text-emerald-400 font-bold">+{s.avgReturn}%</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500">Trades</div>
                  <div className="font-mono text-white font-bold">{s.trades}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Correlation matrix */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">
          Asset–Signal Correlation Matrix
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-[#334155]">
              <th className="text-left px-3 py-2 font-medium">Asset</th>
              <th className="text-center px-3 py-2 font-medium">Weather Signal</th>
              <th className="text-center px-3 py-2 font-medium">Shipping Signal</th>
              <th className="text-center px-3 py-2 font-medium">Satellite Signal</th>
            </tr>
          </thead>
          <tbody>
            {CORR_MATRIX.map((row, i) => (
              <tr key={i} className="border-b border-[#1e3a5f]/50">
                <td className="px-3 py-2 font-mono font-bold text-white">{row.asset}</td>
                <CorrCell value={row.weather} />
                <CorrCell value={row.shipping} />
                <CorrCell value={row.satellite} />
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500/40" />
            <span>Strong positive correlation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-rose-500/40" />
            <span>Negative correlation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-700" />
            <span>Weak / no correlation</span>
          </div>
        </div>
      </div>
    </div>
  )
}

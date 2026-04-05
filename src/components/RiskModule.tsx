import { ShieldAlert, AlertTriangle } from 'lucide-react'
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import type { Trade } from '../types/signals'
import clsx from 'clsx'

const RISK_METRICS = [
  { label: 'Portfolio Beta', value: '0.87', status: 'ok', threshold: '< 1.2' },
  { label: 'Value at Risk (95%)', value: '$18,400', status: 'warn', threshold: '< $20,000' },
  { label: 'Max Sector Concentration', value: '34%', status: 'warn', threshold: '< 30%' },
  { label: 'Leverage Ratio', value: '1.4x', status: 'ok', threshold: '< 2.0x' },
  { label: 'Correlation Risk', value: '0.62', status: 'ok', threshold: '< 0.75' },
  { label: 'Liquidity Score', value: '8.2/10', status: 'ok', threshold: '> 6.0' },
]

const SECTOR_EXPOSURE = [
  { sector: 'Energy', pct: 28 },
  { sector: 'Agriculture', pct: 34 },
  { sector: 'Industrials', pct: 18 },
  { sector: 'Consumer', pct: 12 },
  { sector: 'Financials', pct: 8 },
]

const RISK_RADAR = [
  { subject: 'Market Risk', score: 42 },
  { subject: 'Liquidity', score: 25 },
  { subject: 'Concentration', score: 60 },
  { subject: 'Leverage', score: 35 },
  { subject: 'Signal Risk', score: 30 },
  { subject: 'Drawdown', score: 48 },
]

const STATUS_STYLE: Record<string, string> = {
  ok: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  warn: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  danger: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
}

interface RiskModuleProps {
  trades: Trade[]
}

export default function RiskModule({ trades }: RiskModuleProps) {
  const openTrades = trades.filter(t => t.status === 'open')
  const totalExposure = openTrades.reduce((s, t) => s + t.size * t.current_price, 0)
  const maxDrawdown = Math.min(...openTrades.map(t => t.pnl_pct), 0)

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-bold text-white">Risk Management</h2>
        <div className="ml-auto flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-amber-400 font-semibold">2 warnings active</span>
        </div>
      </div>

      {/* Risk metric cards */}
      <div className="grid grid-cols-3 gap-3">
        {RISK_METRICS.map(m => (
          <div key={m.label} className={clsx('rounded-xl border p-3', STATUS_STYLE[m.status])}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">{m.label}</span>
              <span className={clsx(
                'text-[10px] px-1.5 py-0.5 rounded font-bold',
                m.status === 'ok' ? 'bg-emerald-500/20 text-emerald-400' :
                m.status === 'warn' ? 'bg-amber-500/20 text-amber-400' :
                'bg-rose-500/20 text-rose-400'
              )}>
                {m.status === 'ok' ? 'SAFE' : m.status === 'warn' ? 'WARN' : 'DANGER'}
              </span>
            </div>
            <div className="font-mono text-xl font-bold text-white">{m.value}</div>
            <div className="text-[10px] text-slate-500 mt-1">Limit: {m.threshold}</div>
          </div>
        ))}
      </div>

      {/* Risk radar + sector exposure */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Risk Factor Radar</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={RISK_RADAR} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#1e3a5f" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar
                name="Risk" dataKey="score"
                stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">Sector Concentration</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SECTOR_EXPOSURE} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} unit="%" domain={[0, 40]} />
              <YAxis type="category" dataKey="sector" tick={{ fontSize: 10, fill: '#94a3b8' }} width={70} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [`${v}%`, 'Exposure']}
              />
              <Bar dataKey="pct" radius={[0, 3, 3, 0]}>
                {SECTOR_EXPOSURE.map((entry, i) => (
                  <rect
                    key={i}
                    fill={entry.pct > 30 ? '#f59e0b' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-amber-400">
            <AlertTriangle className="w-3 h-3" />
            Agriculture exposure exceeds 30% limit
          </div>
        </div>
      </div>

      {/* Position sizing calculator */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">Kelly Criterion Position Sizer</div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Win Probability</label>
            <input type="range" min={0} max={100} defaultValue={65} className="w-full" />
            <div className="text-xs font-mono text-white mt-1">65%</div>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Avg Win / Avg Loss</label>
            <input type="range" min={100} max={400} defaultValue={220} className="w-full" />
            <div className="text-xs font-mono text-white mt-1">2.2x</div>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Half Kelly (safety)</label>
            <div className="bg-[#0f172a] rounded-lg p-3">
              <div className="font-mono text-lg font-bold text-emerald-400">11.4%</div>
              <div className="text-[10px] text-slate-500 mt-1">of portfolio</div>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Dollar Amount</label>
            <div className="bg-[#0f172a] rounded-lg p-3">
              <div className="font-mono text-lg font-bold text-emerald-400">$142,500</div>
              <div className="text-[10px] text-slate-500 mt-1">max position</div>
            </div>
          </div>
        </div>
      </div>

      {/* Open positions risk table */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">Position Risk Breakdown</div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-[#334155]">
              <th className="text-left pb-2 font-medium">Asset</th>
              <th className="text-right pb-2 font-medium">Exposure</th>
              <th className="text-right pb-2 font-medium">P&L %</th>
              <th className="text-right pb-2 font-medium">Stop Loss</th>
              <th className="text-center pb-2 font-medium">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {openTrades.map(t => {
              const exposure = t.size * t.current_price
              const stopLoss = t.direction === 'bullish' ? t.entry_price * 0.95 : t.entry_price * 1.05
              const riskLevel = Math.abs(t.pnl_pct) > 5 ? 'high' : Math.abs(t.pnl_pct) > 2 ? 'medium' : 'low'
              return (
                <tr key={t.id} className="border-b border-[#1e3a5f]/50 hover:bg-[#334155]/10">
                  <td className="py-2 font-mono font-bold text-white">{t.asset}</td>
                  <td className="py-2 text-right font-mono text-slate-300">
                    ${(exposure / 1000).toFixed(1)}K
                  </td>
                  <td className={clsx('py-2 text-right font-mono font-bold', t.pnl_pct >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                    {t.pnl_pct >= 0 ? '+' : ''}{t.pnl_pct.toFixed(2)}%
                  </td>
                  <td className="py-2 text-right font-mono text-slate-400">
                    ${stopLoss.toFixed(2)}
                  </td>
                  <td className="py-2 text-center">
                    <span className={clsx(
                      'px-2 py-0.5 rounded text-[10px] font-bold',
                      riskLevel === 'high' ? 'bg-rose-500/20 text-rose-400' :
                      riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    )}>
                      {riskLevel.toUpperCase()}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

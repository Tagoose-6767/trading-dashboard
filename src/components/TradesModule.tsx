import { useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, X, Plus } from 'lucide-react'
import { fmtPrice, fmtPct, fmtUSD, fmtDate } from '../utils/formatting'
import type { Trade } from '../types/signals'
import clsx from 'clsx'

interface TradesModuleProps {
  trades: Trade[]
  onClose: (id: string) => void
}

const SIGNAL_COLORS: Record<string, string> = {
  weather: 'bg-blue-500/20 text-blue-400',
  shipping: 'bg-amber-500/20 text-amber-400',
  satellite: 'bg-purple-500/20 text-purple-400',
  composite: 'bg-emerald-500/20 text-emerald-400',
}

export default function TradesModule({ trades, onClose }: TradesModuleProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all')
  const [showNewOrder, setShowNewOrder] = useState(false)

  const filtered = trades.filter(t => filter === 'all' ? true : t.status === filter)
  const openTrades = trades.filter(t => t.status === 'open')
  const totalPnL = openTrades.reduce((s, t) => s + t.pnl, 0)
  const winRate = openTrades.filter(t => t.pnl > 0).length / Math.max(openTrades.length, 1)

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Active Trades</h2>
        </div>
        <button
          onClick={() => setShowNewOrder(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-semibold hover:bg-emerald-500/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-3">
          <div className="text-xs text-slate-500">Open Positions</div>
          <div className="font-mono text-xl font-bold text-white mt-1">{openTrades.length}</div>
        </div>
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-3">
          <div className="text-xs text-slate-500">Total P&L</div>
          <div className={clsx('font-mono text-xl font-bold mt-1', totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
            {fmtUSD(totalPnL)}
          </div>
        </div>
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-3">
          <div className="text-xs text-slate-500">Win Rate</div>
          <div className={clsx('font-mono text-xl font-bold mt-1', winRate > 0.6 ? 'text-emerald-400' : winRate > 0.4 ? 'text-amber-400' : 'text-rose-400')}>
            {(winRate * 100).toFixed(0)}%
          </div>
        </div>
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-3">
          <div className="text-xs text-slate-500">Best Signal</div>
          <div className="font-mono text-sm font-bold text-blue-400 mt-1">SHIPPING</div>
        </div>
      </div>

      {/* New order form */}
      {showNewOrder && (
        <div className="bg-[#1e293b] border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-white">New Trade Order</span>
            <button onClick={() => setShowNewOrder(false)} className="text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Asset</label>
              <select className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                {['CORN', 'WHEAT', 'CL', 'NG', 'HO', 'XLE', 'XLI', 'WMT', 'TGT'].map(a => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Direction</label>
              <select className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                <option>LONG</option>
                <option>SHORT</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Size</label>
              <input
                type="number"
                defaultValue={100}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Order Type</label>
              <select className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                <option>Market</option>
                <option>Limit</option>
                <option>Stop</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Signal Source</label>
              <select className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                <option>Weather</option>
                <option>Shipping</option>
                <option>Satellite</option>
                <option>Composite</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors">
                Submit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'open', 'closed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
              filter === f
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            )}
          >
            {f} ({trades.filter(t => f === 'all' ? true : t.status === f).length})
          </button>
        ))}
      </div>

      {/* Trades table */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 bg-[#0f172a] border-b border-[#334155]">
              <th className="text-left px-4 py-3 font-medium">Asset</th>
              <th className="text-center px-4 py-3 font-medium">Direction</th>
              <th className="text-right px-4 py-3 font-medium">Size</th>
              <th className="text-right px-4 py-3 font-medium">Entry</th>
              <th className="text-right px-4 py-3 font-medium">Current</th>
              <th className="text-right px-4 py-3 font-medium">P&L</th>
              <th className="text-right px-4 py-3 font-medium">P&L %</th>
              <th className="text-center px-4 py-3 font-medium">Signal</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-center px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(trade => (
              <tr key={trade.id} className="border-b border-[#1e3a5f]/50 hover:bg-[#334155]/10 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-white">{trade.asset}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    {trade.direction === 'bullish'
                      ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                      : <TrendingDown className="w-4 h-4 text-rose-400" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-300">{trade.size.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-300">${fmtPrice(trade.entry_price)}</td>
                <td className="px-4 py-3 text-right font-mono text-white">${fmtPrice(trade.current_price)}</td>
                <td className={clsx('px-4 py-3 text-right font-mono font-bold', trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                  {fmtUSD(trade.pnl)}
                </td>
                <td className={clsx('px-4 py-3 text-right font-mono font-bold', trade.pnl_pct >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                  {fmtPct(trade.pnl_pct)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={clsx('px-2 py-0.5 rounded text-[10px] font-bold', SIGNAL_COLORS[trade.signal_source])}>
                    {trade.signal_source}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={clsx(
                    'px-2 py-0.5 rounded text-[10px] font-bold',
                    trade.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                  )}>
                    {trade.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-slate-500">{fmtDate(trade.timestamp)}</td>
                <td className="px-4 py-3 text-center">
                  {trade.status === 'open' && (
                    <button
                      onClick={() => onClose(trade.id)}
                      className="text-slate-600 hover:text-rose-400 transition-colors"
                      title="Close position"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

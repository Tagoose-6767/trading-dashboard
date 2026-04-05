import { useEffect, useState } from 'react'
import { Activity, Bell, TrendingUp, Wifi } from 'lucide-react'
import { fmtUSD } from '../utils/formatting'
import type { Trade, Alert } from '../types/signals'

interface HeaderProps {
  trades: Trade[]
  alerts: Alert[]
  tick: number
}

export default function Header({ trades, alerts, tick }: HeaderProps) {
  const [utcTime, setUtcTime] = useState('')

  useEffect(() => {
    const update = () => setUtcTime(new Date().toUTCString().split(' ').slice(1, 5).join(' '))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const totalPnL = trades.filter(t => t.status === 'open').reduce((sum, t) => sum + t.pnl, 0)
  const portfolioValue = 1_250_000 + totalPnL
  const activeAlerts = alerts.filter(a => !a.dismissed).length

  // Simulated tickers
  const tickers = [
    { sym: 'CL=F', price: (82.34 + (tick % 10) * 0.03).toFixed(2), chg: '+0.42%' },
    { sym: 'NG=F', price: (2.87 + (tick % 7) * 0.01).toFixed(3), chg: '-1.12%' },
    { sym: 'ZC=F', price: (453.25 + (tick % 5) * 0.25).toFixed(2), chg: '+0.88%' },
    { sym: 'BDI', price: '1,247', chg: '+1.3%' },
    { sym: 'ZW=F', price: (583.5 + (tick % 9) * 0.4).toFixed(2), chg: '-0.35%' },
    { sym: 'HO=F', price: (2.76 + (tick % 6) * 0.01).toFixed(3), chg: '+2.1%' },
    { sym: 'XLE', price: (89.12 + (tick % 4) * 0.05).toFixed(2), chg: '+0.67%' },
  ]

  return (
    <header className="h-14 bg-[#0a1628] border-b border-[#1e3a5f] flex flex-col shrink-0">
      {/* Top row */}
      <div className="flex items-center justify-between px-4 py-2 h-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white text-lg tracking-tight">AlphaSignal</span>
            <span className="text-xs text-slate-500 ml-1">QTS v2.1</span>
          </div>
          <div className="flex items-center gap-1 ml-3">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-mono">LIVE</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-xs text-slate-500">Portfolio Value</div>
            <div className="font-mono text-sm font-semibold text-white">{fmtUSD(portfolioValue)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500">Day P&L</div>
            <div className={`font-mono text-sm font-semibold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{fmtUSD(totalPnL)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500">Open Positions</div>
            <div className="font-mono text-sm font-semibold text-white">
              {trades.filter(t => t.status === 'open').length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500">UTC</div>
            <div className="font-mono text-xs text-slate-300">{utcTime}</div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-1.5 rounded-lg hover:bg-[#1e3a5f] transition-colors">
              <Bell className="w-4 h-4 text-slate-400" />
              {activeAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center font-bold">
                  {activeAlerts}
                </span>
              )}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30 transition-colors">
              <Activity className="w-3.5 h-3.5" />
              Trading Active
            </button>
          </div>
        </div>
      </div>

      {/* Ticker tape */}
      <div className="flex-1 overflow-hidden flex items-center bg-[#0d1f3c] border-t border-[#1e3a5f]/50">
        <div className="flex gap-6 ticker-scroll whitespace-nowrap px-4">
          {[...tickers, ...tickers].map((tk, i) => (
            <span key={i} className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-500">{tk.sym}</span>
              <span className="text-white">{tk.price}</span>
              <span className={tk.chg.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}>{tk.chg}</span>
            </span>
          ))}
        </div>
      </div>
    </header>
  )
}

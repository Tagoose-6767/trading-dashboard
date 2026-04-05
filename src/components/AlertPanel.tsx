import { X, Cloud, Ship, Satellite, AlertTriangle, TrendingUp } from 'lucide-react'
import { timeAgo } from '../utils/formatting'
import type { Alert } from '../types/signals'
import clsx from 'clsx'

const ICON_MAP = {
  weather: Cloud,
  shipping: Ship,
  satellite: Satellite,
  trade: TrendingUp,
}

const SEV_STYLE: Record<string, string> = {
  critical: 'border-rose-500/60 bg-rose-500/10',
  high: 'border-amber-500/50 bg-amber-500/10',
  medium: 'border-yellow-500/40 bg-yellow-500/8',
  low: 'border-slate-500/30 bg-slate-500/5',
}

const SEV_DOT: Record<string, string> = {
  critical: 'bg-rose-500',
  high: 'bg-amber-500',
  medium: 'bg-yellow-400',
  low: 'bg-slate-400',
}

interface AlertPanelProps {
  alerts: Alert[]
  onDismiss: (id: string) => void
}

export default function AlertPanel({ alerts, onDismiss }: AlertPanelProps) {
  const visible = alerts.filter(a => !a.dismissed)

  return (
    <aside className="w-72 bg-[#0a1628] border-l border-[#1e3a5f] flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-[#1e3a5f]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-white">Signal Alerts</span>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">
            {visible.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {visible.length === 0 && (
          <div className="text-center text-slate-600 text-sm py-8">No active alerts</div>
        )}
        {visible.map(alert => {
          const Icon = ICON_MAP[alert.type]
          return (
            <div
              key={alert.id}
              className={clsx(
                'rounded-lg border p-3 relative',
                SEV_STYLE[alert.severity] ?? 'border-slate-700 bg-slate-800/30'
              )}
            >
              <button
                onClick={() => onDismiss(alert.id)}
                className="absolute top-2 right-2 text-slate-600 hover:text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-start gap-2 pr-5">
                <Icon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={clsx('w-1.5 h-1.5 rounded-full', SEV_DOT[alert.severity])} />
                    <span className="text-[10px] uppercase font-bold tracking-wide text-slate-500">
                      {alert.type} · {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                  <p className="text-[10px] text-slate-600 mt-1.5">{timeAgo(alert.timestamp)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recommendations summary */}
      <div className="border-t border-[#1e3a5f] p-3">
        <div className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wide">Quick Actions</div>
        <div className="flex flex-col gap-1.5">
          <button className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg px-3 py-2 hover:bg-emerald-500/30 transition-colors text-left">
            Review top recommendations →
          </button>
          <button className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg px-3 py-2 hover:bg-blue-500/30 transition-colors text-left">
            Run signal backtest →
          </button>
          <button className="text-xs bg-slate-500/10 text-slate-400 border border-slate-700 rounded-lg px-3 py-2 hover:bg-slate-500/20 transition-colors text-left">
            Export daily report →
          </button>
        </div>
      </div>
    </aside>
  )
}

import {
  Cloud, Ship, Satellite, BarChart3, History, ShieldAlert, LayoutDashboard
} from 'lucide-react'
import type { NavSection } from '../types/signals'
import clsx from 'clsx'

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'weather', label: 'Weather Signals', icon: Cloud },
  { id: 'shipping', label: 'Shipping Analytics', icon: Ship },
  { id: 'satellite', label: 'Satellite Inventory', icon: Satellite },
  { id: 'trades', label: 'Active Trades', icon: BarChart3 },
  { id: 'analytics', label: 'Historical Analysis', icon: History },
  { id: 'risk', label: 'Risk Management', icon: ShieldAlert },
]

interface SidebarProps {
  active: NavSection
  onChange: (s: NavSection) => void
}

export default function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="w-52 bg-[#0a1628] border-r border-[#1e3a5f] flex flex-col py-4 shrink-0">
      <nav className="flex flex-col gap-1 px-2">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 w-full text-left',
                isActive
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e3a5f]/50'
              )}
            >
              <Icon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-blue-400' : 'text-slate-500')} />
              {item.label}
              {item.badge && (
                <span className="ml-auto text-[10px] bg-rose-500 text-white rounded px-1.5 py-0.5">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto px-4 pt-4 border-t border-[#1e3a5f]/50 mx-2">
        <div className="text-[10px] text-slate-600 leading-relaxed">
          <div className="text-slate-500 font-semibold mb-1">Signal Sources</div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>NOAA Forecast</span>
          </div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Baltic Exchange</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Satellite Analytics</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

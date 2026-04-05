import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import AlertPanel from './components/AlertPanel'
import OverviewModule from './components/OverviewModule'
import WeatherModule from './components/WeatherModule'
import ShippingModule from './components/ShippingModule'
import SatelliteModule from './components/SatelliteModule'
import TradesModule from './components/TradesModule'
import AnalyticsModule from './components/AnalyticsModule'
import RiskModule from './components/RiskModule'
import { useMarketData } from './hooks/useMarketData'
import type { NavSection } from './types/signals'

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('overview')
  const {
    weather, weatherSeries,
    shipping, bdiSeries,
    satellite,
    alpha, trades, alerts,
    dismissAlert, closeTrade,
    tick,
  } = useMarketData()

  function renderModule() {
    switch (activeSection) {
      case 'overview':
        return <OverviewModule alpha={alpha} weather={weather} shipping={shipping} satellite={satellite} />
      case 'weather':
        return <WeatherModule signal={weather} series={weatherSeries} />
      case 'shipping':
        return <ShippingModule signal={shipping} bdiSeries={bdiSeries} />
      case 'satellite':
        return <SatelliteModule signal={satellite} />
      case 'trades':
        return <TradesModule trades={trades} onClose={closeTrade} />
      case 'analytics':
        return <AnalyticsModule trades={trades} />
      case 'risk':
        return <RiskModule trades={trades} />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200 overflow-hidden">
      <Header trades={trades} alerts={alerts} tick={tick} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activeSection} onChange={setActiveSection} />
        <main className="flex-1 overflow-y-auto p-5">
          {renderModule()}
        </main>
        <AlertPanel alerts={alerts} onDismiss={dismissAlert} />
      </div>
    </div>
  )
}

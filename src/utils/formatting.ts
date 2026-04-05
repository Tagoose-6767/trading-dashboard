export function fmtPrice(v: number, decimals = 2): string {
  return v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function fmtPct(v: number, decimals = 2): string {
  const sign = v >= 0 ? '+' : ''
  return `${sign}${v.toFixed(decimals)}%`
}

export function fmtUSD(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return `$${v.toFixed(2)}`
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return `${Math.round(diff)}s ago`
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`
  return `${Math.round(diff / 86400)}d ago`
}

export function severityColor(v: number): string {
  if (v >= 80) return 'text-rose-400'
  if (v >= 60) return 'text-amber-400'
  if (v >= 40) return 'text-yellow-400'
  return 'text-emerald-400'
}

export function severityBg(v: number): string {
  if (v >= 80) return 'bg-rose-500/20 border-rose-500/40'
  if (v >= 60) return 'bg-amber-500/20 border-amber-500/40'
  if (v >= 40) return 'bg-yellow-500/20 border-yellow-500/40'
  return 'bg-emerald-500/20 border-emerald-500/40'
}

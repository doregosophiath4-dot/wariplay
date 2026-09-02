// lib/withdrawalFormat.ts

export function getStatusColors(status: string) {
  switch (status?.toLowerCase()) {
    case 'completed':
      return { bg: 'bg-emerald-400/15', text: 'text-emerald-400', badge: 'bg-emerald-400/15 text-emerald-400' }
    case 'pending':
      return { bg: 'bg-orange-400/15', text: 'text-orange-400', badge: 'bg-orange-400/15 text-orange-400' }
    case 'failed':
      return { bg: 'bg-red-400/15', text: 'text-red-400', badge: 'bg-red-400/15 text-red-400' }
    default:
      return { bg: 'bg-white/5', text: 'text-white/50', badge: 'bg-white/5 text-white/50' }
  }
}

export function getStatusLabel(status: string) {
  switch (status?.toLowerCase()) {
    case 'completed': return 'Complete'
    case 'pending': return 'En attente'
    case 'failed': return 'Echoue'
    default: return status || 'Inconnu'
  }
}

export function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
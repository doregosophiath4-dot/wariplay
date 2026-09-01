// lib/format.ts

/**
 * Formate un nombre en K/M pour l'affichage
 * Ex: 1500 → "1.5K", 2000000 → "2M"
 */
export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

/**
 * Formate un nom de jeu en URL-friendly
 * Ex: "Cloud Run" → "cloud_run"
 */
export function formatGameNameForUrl(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_')
}

/**
 * Formate un temps en secondes pour l'affichage
 * Ex: 86400 → "1j 0h 0m 0s"
 */
export function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return 'Termine'
  const totalSeconds = Math.floor(seconds)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  const parts = []
  if (days > 0) parts.push(`${days}j`)
  if (hours > 0) parts.push(`${hours}h`)
  if (mins > 0) parts.push(`${mins}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)
  return parts.join(' ')
}

/**
 * Crée un slug à partir d'un texte
 * Ex: "Mon Produit" → "mon_produit"
 */
export function createSlug(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_').replace(/^_|_$/g, '')
}
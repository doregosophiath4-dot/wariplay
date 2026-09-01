// =====================================================
// lib/api.ts — COMPLET
// =====================================================

import FingerprintJS from '@fingerprintjs/fingerprintjs'

interface RequestQueueItem {
  key: string
  execute: () => Promise<any>
}

const state = {
  csrfToken: null as string | null,
  csrfClientId: null as string | null,
  csrfInitialized: false,
  jwtToken: null as string | null,
  jwtInitialized: false,
  wariToken: null as string | null,
  wariTokenValid: false,
  fingerprint: null as string | null,
  devToolsOpen: false,
  devToolsPageActive: false,
  lastVerifyTime: 0
}

const pendingRequests = new Map<string, Promise<any>>()
const requestQueue: RequestQueueItem[] = []
let isProcessingQueue = false

// =====================================================
// Promesses uniques pour éviter les doubles appels
// =====================================================
let initAllPromise: Promise<void> | null = null
let initCsrfPromise: Promise<void> | null = null
let initFingerprintPromise: Promise<string | null> | null = null
let refreshJWTPromise: Promise<boolean> | null = null
let initWariTokenPromise: Promise<boolean> | null = null

// =====================================================
// Synchronisation window.__TOKENS__
// =====================================================
function syncWindowTokens() {
  if (typeof window === 'undefined') return
  const tokens = {
    wari_tok: state.wariToken,
    csrf_token: state.csrfToken,
    client_id: state.csrfClientId,
    jwt: state.jwtToken
  }
  window.__TOKENS__ = tokens

  const iframe = document.getElementById('game-frame') as HTMLIFrameElement | null
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage(
      { type: '__WARI_TOKENS__', tokens },
      GAME_ORIGIN // remplace '*' par l'origine exacte, ex: 'http://127.0.0.1:5000'
    )
  }
}

async function processQueue() {
  if (isProcessingQueue) return
  isProcessingQueue = true
  while (requestQueue.length > 0) {
    const req = requestQueue.shift()
    if (req) {
      try { await req.execute() } catch (_) {}
      await new Promise(r => setTimeout(r, 100))
    }
  }
  isProcessingQueue = false
}

export function queueRequest(key: string, fn: () => Promise<any>): Promise<any> {
  if (pendingRequests.has(key)) return pendingRequests.get(key)!
  const promise = new Promise((resolve, reject) => {
    requestQueue.push({
      key,
      execute: async () => {
        try { resolve(await fn()) }
        catch (e) { reject(e) }
        finally { pendingRequests.delete(key) }
      }
    })
  })
  pendingRequests.set(key, promise)
  processQueue()
  return promise
}

function getStoredFP(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('fingerprint')
}

function storeFP(fp: string) {
  if (typeof window !== 'undefined') localStorage.setItem('fingerprint', fp)
}

function deleteFP() {
  if (typeof window !== 'undefined') localStorage.removeItem('fingerprint')
}

// =====================================================
// COMPUTE FINGERPRINT (client-side réel, via FingerprintJS)
// =====================================================
async function computeFingerprint(): Promise<string> {
  const fp = await FingerprintJS.load()
  const result = await fp.get()
  return result.visitorId
}

// =====================================================
// INIT CSRF
// =====================================================
export async function initCsrf() {
  if (state.csrfInitialized) return
  if (initCsrfPromise) return initCsrfPromise

  initCsrfPromise = (async () => {
    try {
      const res = await queueRequest('csrf', () =>
        fetch('/api/csrf-token', { headers: { 'Cache-Control': 'no-cache' } })
      )
      if (res.ok) {
        const d = await res.json()
        state.csrfToken = d.csrf_token
        // NOTE : le backend /api/csrf-token ne renvoie actuellement PAS de
        // client_id (seulement { csrf_token }). On garde cette ligne pour
        // le jour où le backend en fournira un, mais tant que ce n'est pas
        // le cas, csrfClientId restera null — ce qui est normal et sans
        // impact : X-Client-ID n'est simplement pas envoyé (voir buildBaseHeaders).
        state.csrfClientId = d.client_id ?? null
        state.csrfInitialized = true
        syncWindowTokens()
      }
    } catch (_) {}
  })()

  try { await initCsrfPromise } finally { initCsrfPromise = null }
}

// =====================================================
// INIT FINGERPRINT
// =====================================================
export async function initFingerprint(): Promise<string | null> {
  if (initFingerprintPromise) return initFingerprintPromise

  initFingerprintPromise = (async () => {
    let fp = getStoredFP()
    if (!fp) {
      try {
        fp = await computeFingerprint()
        storeFP(fp)
      } catch (_) {
        fp = null
      }
    }
    state.fingerprint = fp
    return fp
  })()

  try { return await initFingerprintPromise } finally { initFingerprintPromise = null }
}

// =====================================================
// INIT JWT
// =====================================================
export async function refreshJWT(): Promise<boolean> {
  if (refreshJWTPromise) return refreshJWTPromise

  refreshJWTPromise = (async () => {
    try {
      const statusRes = await fetchWithCSRF('/api/is_logged_in', {
        headers: { 'Content-Type': 'application/json' }
      })
      if (!statusRes.ok) return false
      const statusData = await statusRes.json()
      if (!statusData.authenticated) return false

      const jwtRes = await queueRequest('jwt', () =>
        fetchWithCSRF('/api/get-jwt', {
          headers: { 'Content-Type': 'application/json' }
        })
      )
      if (!jwtRes.ok) return false
      const d = await jwtRes.json()
      state.jwtToken = d.token
      state.jwtInitialized = true
      syncWindowTokens()
      return true
    } catch {
      return false
    }
  })()

  try { return await refreshJWTPromise } finally { refreshJWTPromise = null }
}

// =====================================================
// INIT WARI TOKEN
// =====================================================
export async function initWariToken(): Promise<boolean> {
  if (initWariTokenPromise) return initWariTokenPromise

  initWariTokenPromise = (async () => {
    try {
      const res = await queueRequest('wari-init', () =>
        fetchWithCSRF('/api/wari-token/init', {
          headers: { 'Cache-Control': 'no-cache' }
        })
      )
      if (!res.ok) return false
      const d = await res.json()
      if (d.wari_tok) {
        state.wariToken = d.wari_tok
        state.wariTokenValid = true
        syncWindowTokens()
        return true
      }
      return false
    } catch {
      return false
    }
  })()

  try { return await initWariTokenPromise } finally { initWariTokenPromise = null }
}

// =====================================================
// VALIDATE WARI TOKEN
// =====================================================
export async function validateWariToken(): Promise<boolean> {
  if (!state.wariToken) return false

  try {
    const res = await fetchWithCSRF('/api/wari-token/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wari_tok: state.wariToken })
    })

    if (res.ok) {
      const d = await res.json()
      if (d.valid) {
        return true
      }
      if (d.wari_tok) {
        state.wariToken = d.wari_tok
        state.wariTokenValid = true
        syncWindowTokens()
      }
      return false
    }
    return false
  } catch {
    return false
  }
}

// =====================================================
// INIT ALL - Appeler AVANT toute requête API
// =====================================================
export async function initAll(): Promise<void> {
  if (typeof window === 'undefined') return
  if (initAllPromise) return initAllPromise

  initAllPromise = (async () => {
    await initCsrf()
    await initFingerprint()
    await refreshJWT()
    await initWariToken()
    syncWindowTokens()
  })()

  try { await initAllPromise } finally { initAllPromise = null }
}

// =====================================================
// DEVTOOLS
// =====================================================
export function detectDevTools(): boolean {
  if (typeof window === 'undefined') return false
  if (window.outerWidth - window.innerWidth > 160) return true
  if (window.outerHeight - window.innerHeight > 160) return true
  return false
}

// =====================================================
// BUILD BASE HEADERS (CSRF + Wari + Fingerprint)
// =====================================================
function buildBaseHeaders(existingHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...existingHeaders }

  if (state.csrfToken) headers['X-CSRF-Token'] = state.csrfToken
  if (state.csrfClientId) headers['X-Client-ID'] = state.csrfClientId
  if (state.wariToken) headers['X-Wari-Token'] = state.wariToken

  const fp = state.fingerprint || getStoredFP()
  if (fp) headers['X-Fingerprint'] = fp

  return headers
}

// =====================================================
// FETCH AVEC CSRF (sans JWT)
// =====================================================
export async function fetchWithCSRF(url: string, options: RequestInit = {}): Promise<Response> {
  if (!state.csrfInitialized) await initCsrf()

  const headers = buildBaseHeaders(
    (options.headers as Record<string, string>) || {}
  )

  return fetch(url, { ...options, headers })
}

// =====================================================
// FETCH AVEC TOUS LES TOKENS (CSRF + Wari + Fingerprint + JWT)
// =====================================================
export async function fetchWithAllTokens(url: string, options: RequestInit = {}): Promise<Response> {
  if (!state.csrfInitialized || !state.wariToken) {
    await initAll()
  }

  if (!state.wariToken) {
    console.warn('[fetchWithAllTokens] Token Wari manquant après initAll')
  }

  const headers = buildBaseHeaders(
    (options.headers as Record<string, string>) || {}
  )

  if (state.jwtToken) {
    headers['Authorization'] = `Bearer ${state.jwtToken}`
  }

  if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  return fetch(url, { ...options, headers })
}

// =====================================================
// WEBSOCKET : PRÉPARER LE MESSAGE D'AUTHENTIFICATION
// =====================================================
export async function prepareWSAuthMessage(): Promise<{
  type: string
  jwt: string | null
  fingerprint: string | null
  csrf: string | null
  csrfClientId: string | null
  wari: string | null
}> {
  // S'assurer que tous les tokens sont initialisés
  if (!state.csrfInitialized || !state.wariToken) {
    await initAll()
  }

  return {
    type: 'auth',
    jwt: state.jwtToken,
    fingerprint: state.fingerprint || getStoredFP(),
    csrf: state.csrfToken,
    csrfClientId: state.csrfClientId,
    wari: state.wariToken
  }
}

// =====================================================
// GETTERS
// =====================================================
export function getJwtToken(): string | null { return state.jwtToken }
export function getWariToken(): string | null { return state.wariToken }
export function getFingerprint(): string | null { return state.fingerprint }
export function isAuthenticated(): boolean { return state.jwtInitialized && !!state.jwtToken }
export function getCsrfToken(): string | null { return state.csrfToken }
export function getClientId(): string | null { return state.csrfClientId }

// =====================================================
// SETTERS
// =====================================================
export function setJwtToken(token: string) {
  state.jwtToken = token
  state.jwtInitialized = true
  syncWindowTokens()
}

export function setWariToken(token: string) {
  state.wariToken = token
  state.wariTokenValid = true
  syncWindowTokens()
}

export function clearAllTokens() {
  state.jwtToken = null
  state.jwtInitialized = false
  state.wariToken = null
  state.wariTokenValid = false
  state.csrfToken = null
  state.csrfInitialized = false
  state.fingerprint = null
  deleteFP()
  syncWindowTokens()
}
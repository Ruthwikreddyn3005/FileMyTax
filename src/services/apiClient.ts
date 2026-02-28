const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000'

// Access token lives in memory — survives localStorage.clear(), cleared only on logout
let _accessToken: string | null = null

export const tokenStorage = {
  getAccess: () => _accessToken,
  setAccess: (token: string) => {
    _accessToken = token
  },
  clearAccess: () => {
    _accessToken = null
  }
}

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

async function refreshAccessToken(): Promise<string | null> {
  // No body needed — the HTTP-only refresh cookie is sent automatically
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include'
  })
  if (!res.ok) {
    tokenStorage.clearAccess()
    return null
  }
  const json = (await res.json()) as { accessToken: string }
  tokenStorage.setAccess(json.accessToken)
  return json.accessToken
}

async function apiRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  }
  const accessToken = tokenStorage.getAccess()
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  let res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include'
  })

  if (res.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true
      const newToken = await refreshAccessToken()
      isRefreshing = false
      refreshQueue.forEach((cb) => cb(newToken))
      refreshQueue = []
      if (!newToken) return res
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: 'include'
      })
    } else {
      const newToken = await new Promise<string | null>((resolve) => {
        refreshQueue.push(resolve)
      })
      if (!newToken) return res
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: 'include'
      })
    }
  }

  return res
}

export const api = {
  get: (path: string) => apiRequest(path, { method: 'GET' }),
  post: (path: string, body?: unknown) =>
    apiRequest(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined
    }),
  put: (path: string, body?: unknown) =>
    apiRequest(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
}

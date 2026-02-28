import { api, tokenStorage } from './apiClient'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  hasPassword: boolean
  firstName: string | null
  middleName: string | null
  lastName: string | null
  phone: string | null
  dateOfBirth: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
}

export interface ProfileUpdate {
  firstName?: string
  middleName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export interface AuthResult {
  user: AuthUser
  accessToken: string
}

async function handleAuthResponse(res: Response): Promise<AuthResult> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      error?: string
      message?: string
    }
    throw new Error(body.message ?? body.error ?? 'Authentication failed')
  }
  const json = (await res.json()) as AuthResult
  tokenStorage.setAccess(json.accessToken)
  return json
}

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const authService = {
  register: (email: string, password: string, name?: string) =>
    api
      .post('/api/auth/register', { email, password, name })
      .then(handleAuthResponse),

  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }).then(handleAuthResponse),

  googleLogin: (idToken: string) =>
    api.post('/api/auth/google', { idToken }).then(handleAuthResponse),

  logout: async () => {
    await api.post('/api/auth/logout').catch(() => undefined)
    tokenStorage.clearAccess()
  },

  me: async (): Promise<AuthUser | null> => {
    // No early bail — apiClient handles 401 + refresh cookie automatically
    const res = await api.get('/api/auth/me')
    if (!res.ok) return null
    return res.json() as Promise<AuthUser>
  },

  forgotPassword: async (email: string): Promise<void> => {
    await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(body.error ?? 'Reset failed')
    }
  },

  setPassword: async (
    currentPassword: string | null,
    newPassword: string
  ): Promise<void> => {
    const res = await api.post('/api/auth/set-password', {
      currentPassword,
      newPassword
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(body.error ?? 'Failed to set password')
    }
  },

  updateProfile: async (data: ProfileUpdate): Promise<AuthUser> => {
    const res = await api.put('/api/auth/profile', data)
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(body.error ?? 'Failed to update profile')
    }
    return res.json() as Promise<AuthUser>
  }
}

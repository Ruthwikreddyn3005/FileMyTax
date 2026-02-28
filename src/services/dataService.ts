import { api } from './apiClient'

export const dataService = {
  load: async (): Promise<unknown | null> => {
    const res = await api.get('/api/data')
    if (!res.ok) return null
    const json = (await res.json()) as { data: unknown }
    return json.data
  },

  save: async (state: unknown): Promise<void> => {
    await api.put('/api/data', { data: state })
  }
}

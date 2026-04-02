import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          set({
            user: data.user,
            accessToken: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          })
          return { success: true, user: data.user }
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      register: async (payload) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', payload)
          set({
            user: data.user,
            accessToken: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          })
          return { success: true, user: data.user }
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout') } catch {}
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      refreshToken: async () => {
        try {
          const { data } = await api.post('/auth/refresh')
          set({ accessToken: data.accessToken, user: data.user, isAuthenticated: true })
          return data.accessToken
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false })
          return null
        }
      },

      updateUser: (updates) => set(state => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: 'designnest-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

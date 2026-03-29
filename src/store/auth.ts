import { create } from 'zustand'
import { getProfileApi, loginApi, updateProfileApi } from '@/api/auth'
import type { LoginPayload, UserProfile } from '@/types'
import { useAppStore } from '@/store/app'
import { storage } from '@/utils/storage'

interface AuthState {
  token: string
  user: UserProfile | null
  loading: boolean
  initialized: boolean
  initAuth: () => Promise<void>
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
  setUser: (user: UserProfile) => void
  updateProfile: (payload: Partial<UserProfile>) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: storage.getToken() || '',
  user: storage.getUser(),
  loading: false,
  initialized: false,
  initAuth: async () => {
    const token = storage.getToken() || ''
    if (!token) {
      useAppStore.getState().reset()
      set({ token: '', user: null, initialized: true })
      return
    }

    set({ token, loading: true })
    try {
      const user = await getProfileApi()
      storage.setUser(user)
      useAppStore.getState().bootstrap(user.permissions)
      set({ token, user, loading: false, initialized: true })
    } catch {
      storage.clearAll()
      useAppStore.getState().reset()
      set({ token: '', user: null, loading: false, initialized: true })
    }
  },
  login: async (payload) => {
    set({ loading: true })
    try {
      const result = await loginApi(payload)
      storage.setToken(result.token)
      storage.setUser(result.user)
      useAppStore.getState().bootstrap(result.user.permissions)
      set({ token: result.token, user: result.user, loading: false, initialized: true })
    } catch (error) {
      set({ loading: false, initialized: true })
      throw error
    }
  },
  logout: () => {
    storage.clearAll()
    useAppStore.getState().reset()
    set({ token: '', user: null, initialized: true })
  },
  setUser: (user) => {
    storage.setUser(user)
    useAppStore.getState().bootstrap(user.permissions)
    set({ user })
  },
  updateProfile: async (payload) => {
    const currentUser = get().user
    if (!currentUser) {
      throw new Error('用户信息不存在，请重新登录')
    }
    await updateProfileApi(currentUser.id, {
      name: payload.name ?? currentUser.name ?? currentUser.username,
      email: payload.email ?? currentUser.email,
      phone: payload.mobile ?? currentUser.mobile,
      department: payload.department ?? currentUser.department,
      position: payload.position ?? payload.title ?? currentUser.position ?? currentUser.title,
    })
    const latestUser = await getProfileApi()
    const user = {
      ...latestUser,
      department: payload.department ?? currentUser.department ?? latestUser.department,
      position: payload.position ?? payload.title ?? currentUser.position ?? currentUser.title ?? latestUser.position ?? latestUser.title,
      title: payload.position ?? payload.title ?? currentUser.position ?? currentUser.title ?? latestUser.position ?? latestUser.title,
    }
    storage.setUser(user)
    useAppStore.getState().bootstrap(user.permissions)
    set({ user })
  },
}))

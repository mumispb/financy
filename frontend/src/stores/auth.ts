import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { apolloClient } from "@/lib/graphql/apollo"
import type { User ,RegisterInput, LoginInput} from '@/types'
import { REGISTER } from '@/lib/graphql/mutations/Register'
import { LOGIN } from '../lib/graphql/mutations/Login'
import { REFRESH_TOKEN } from '../lib/graphql/mutations/RefreshToken'

const AUTH_REMEMBER_KEY = 'auth-remember-me'

/** Custom storage: uses localStorage when rememberMe, sessionStorage otherwise. Flag stored in localStorage. */
const authStorage = {
  getItem: (name: string) => {
    const rememberMe = localStorage.getItem(AUTH_REMEMBER_KEY)
    const storage = rememberMe === 'true' ? localStorage : sessionStorage
    const value = storage.getItem(name)
    if (value) return value
    if (rememberMe === null) return localStorage.getItem(name)
    return null
  },
  setItem: (name: string, value: string) => {
    const rememberMe = localStorage.getItem(AUTH_REMEMBER_KEY)
    const storage = rememberMe === 'true' ? localStorage : sessionStorage
    storage.setItem(name, value)
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name)
    sessionStorage.removeItem(name)
  },
}

type RegisterMutationData = {
  register: {
    token: string
    refreshToken: string
    user: User
  }
}

type LoginMutationData = {
  login: {
    token: string
    refreshToken: string
    user: User
  }
}

type RefreshTokenMutationData = {
  refreshToken: {
    token: string
    refreshToken: string
    user: User
  }
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  signup: (data: RegisterInput) => Promise<boolean>
  login: (data: LoginInput) => Promise<boolean>
  refreshAccessToken: (tokenToUse?: string) => Promise<boolean>
  logout: () => void
  updateUser: (name: string) => void
}

export const useAuthStore = create<AuthState>() (
    persist(
      (set) => ({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        login: async (loginData: LoginInput) => {
          try{
              const {data} = await apolloClient.mutate<LoginMutationData, { data: { email: string; password: string } }>({
                mutation: LOGIN,
                variables: {
                  data: {
                    email: loginData.email,
                    password: loginData.password
                  }
                }
              })

              if(data?.login){
                localStorage.setItem(AUTH_REMEMBER_KEY, loginData.rememberMe ? 'true' : 'false')
                const { user, token, refreshToken } = data.login
                set({
                  user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                  },
                  token,
                  refreshToken,
                  isAuthenticated: true
                })
                return true
              }
              return false
          }catch(error){
            console.log("Erro ao fazer o login")
            throw error
          }
        },
        signup: async (registerData: RegisterInput) => {
          try{
              const { data } = await apolloClient.mutate<
              RegisterMutationData,
                {data: RegisterInput}
              >({
                mutation: REGISTER,
                variables: {
                  data: {
                      name: registerData.name,
                      email: registerData.email,
                      password: registerData.password
                  }
                }
              })
              if(data?.register){
                localStorage.setItem(AUTH_REMEMBER_KEY, 'true')
                const { token, refreshToken, user } = data.register
                set({
                  user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                  },
                  token,
                  refreshToken,
                  isAuthenticated: true
                })
                return true
              }
              return false
          }catch(error){
            console.log("Erro ao fazer o cadastro")
            throw error
          }
        },
        refreshAccessToken: async (tokenToUse?: string) => {
          try {
            // Use provided token, or get refreshToken from store, or fallback to current token
            const refreshToken = tokenToUse || useAuthStore.getState().refreshToken || useAuthStore.getState().token
            if (!refreshToken) {
              throw new Error('No token available for refresh')
            }

            const { data } = await apolloClient.mutate<RefreshTokenMutationData, { refreshToken: string }>({
              mutation: REFRESH_TOKEN,
              variables: {
                refreshToken,
              },
              // Skip error handling for this mutation
              errorPolicy: 'none',
            })

            if (data?.refreshToken) {
              const { user, token, refreshToken: newRefreshToken } = data.refreshToken
              set({
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  createdAt: user.createdAt,
                  updatedAt: user.updatedAt
                },
                token,
                refreshToken: newRefreshToken,
                isAuthenticated: true
              })
              return true
            }
            return false
          } catch (error) {
            // If refresh fails, logout the user
            useAuthStore.getState().logout()
            throw error
          }
        },
        logout: () => {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false
          })
          authStorage.removeItem('auth-storage')
          apolloClient.clearStore()
        },
        updateUser: (name: string) => {
          set((state) => ({
            user: state.user ? { ...state.user, name } : null
          }))
        },
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => authStorage),
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
)

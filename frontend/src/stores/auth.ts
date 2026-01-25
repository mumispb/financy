import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apolloClient } from "@/lib/graphql/apollo"
import type { User ,RegisterInput, LoginInput} from '@/types'
import { REGISTER } from '@/lib/graphql/mutations/Register'
import { LOGIN } from '../lib/graphql/mutations/Login'
import { REFRESH_TOKEN } from '../lib/graphql/mutations/RefreshToken'

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
              const {data} = await apolloClient.mutate<LoginMutationData, { data: LoginInput }>({
                mutation: LOGIN,
                variables: {
                  data: {
                    email: loginData.email,
                    password: loginData.password
                  }
                }
              })

              if(data?.login){
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
          apolloClient.clearStore()
        },
        updateUser: (name: string) => {
          set((state) => ({
            user: state.user ? { ...state.user, name } : null
          }))
        },
      }),
      {
        name: 'auth-storage'
      }
    )
)

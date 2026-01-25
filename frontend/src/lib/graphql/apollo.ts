import { ApolloClient, HttpLink, InMemoryCache, from, ApolloLink, Observable } from "@apollo/client"
import { useAuthStore } from '../../stores/auth'

const httpLink = new HttpLink({
    uri: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/graphql"
})

// Custom link to conditionally add auth header (skip for RefreshToken mutation)
const conditionalAuthLink = new ApolloLink((operation, forward) => {
  // Don't add auth header for refreshToken mutation - it uses refreshToken parameter instead
  if (operation.operationName === 'RefreshToken') {
    return forward(operation)
  }
  
  const token = useAuthStore.getState().token
  operation.setContext({
    headers: {
      ...operation.getContext().headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  })
  
  return forward(operation)
})

// Custom link to handle token refresh on authentication errors
const refreshTokenLink = new ApolloLink((operation, forward) => {
  // Skip token refresh logic for refreshToken mutation to avoid infinite loops
  if (operation.operationName === 'RefreshToken') {
    return forward(operation)
  }

  // Skip error handling if this is already a retry
  const isRetry = operation.getContext().isRetry === true
  if (isRetry) {
    return forward(operation)
  }

  return new Observable((observer) => {
    let subscription = forward(operation).subscribe({
      next: (result) => {
        // Check for GraphQL errors - check message regardless of error code
        if (result.errors) {
          const authError = result.errors.find(
            (err) => err.message === 'Usuário não autenticado!' || err.message?.includes('não autenticado')
          )
          
          if (authError) {
            // Try refreshToken first, fallback to current token if no refreshToken exists (one-time upgrade)
            const refreshToken = useAuthStore.getState().refreshToken
            const currentToken = useAuthStore.getState().token
            const tokenToUse = refreshToken || currentToken
            
            if (tokenToUse) {
              // Unsubscribe from original request
              subscription.unsubscribe()
              
              // Attempt to refresh the token
              useAuthStore.getState().refreshAccessToken(tokenToUse)
                .then(() => {
                  // Verify token was updated
                  const newToken = useAuthStore.getState().token
                  if (!newToken) {
                    throw new Error('Token not updated after refresh')
                  }
                  
                  // Mark as retry to skip error handling on retry
                  operation.setContext({ isRetry: true })
                  
                  // Retry the operation - authLink will add the new token automatically
                  subscription = forward(operation).subscribe({
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer),
                  })
                })
                .catch(() => {
                  // Refresh failed, logout user
                  useAuthStore.getState().logout()
                  observer.error(new Error('Token refresh failed'))
                })
              return
            } else {
              // No tokens available, pass through the error
              observer.next(result)
            }
          } else {
            // Not an auth error, pass through
            observer.next(result)
          }
        } else {
          // No errors, pass through
          observer.next(result)
        }
      },
      error: (networkError: Error & { statusCode?: number; result?: { errors?: Array<{ message?: string; extensions?: { code?: string } }> } }) => {
        // Check for 401 network errors or auth errors in result
        const isAuthError = networkError.statusCode === 401 || 
          networkError.result?.errors?.some((err) => 
            err.message === 'Usuário não autenticado!' || err.message?.includes('não autenticado')
          )
        
        if (isAuthError) {
          // Try refreshToken first, fallback to current token if no refreshToken exists (one-time upgrade)
          const refreshToken = useAuthStore.getState().refreshToken
          const currentToken = useAuthStore.getState().token
          const tokenToUse = refreshToken || currentToken
          
          if (tokenToUse) {
            // Unsubscribe from original request
            subscription.unsubscribe()
            
            // Attempt to refresh the token
            useAuthStore.getState().refreshAccessToken(tokenToUse)
              .then(() => {
                // Verify token was updated
                const newToken = useAuthStore.getState().token
                if (!newToken) {
                  throw new Error('Token not updated after refresh')
                }
                
                // Mark as retry to skip error handling on retry
                operation.setContext({ isRetry: true })
                
                // Retry the operation - authLink will add the new token automatically
                subscription = forward(operation).subscribe({
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                })
              })
              .catch(() => {
                // Refresh failed, logout user
                useAuthStore.getState().logout()
                observer.error(networkError)
              })
            return
          }
        }
        observer.error(networkError)
      },
      complete: observer.complete.bind(observer),
    })

    return () => {
      subscription.unsubscribe()
    }
  })
})

export const apolloClient = new ApolloClient({
  link: from([refreshTokenLink, conditionalAuthLink, httpLink]),
  cache: new InMemoryCache()
})

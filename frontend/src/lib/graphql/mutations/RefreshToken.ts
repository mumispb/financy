import { gql } from "@apollo/client"

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      token
      refreshToken
      user {
        id
        name
        email
        role
        createdAt
        updatedAt
      }
    }
  }
`

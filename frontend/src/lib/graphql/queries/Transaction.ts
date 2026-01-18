import { gql } from '@apollo/client'

export const LIST_TRANSACTIONS = gql`
  query ListTransactions {
    listTransactions {
      id
      description
      amount
      type
      date
      userId
      categoryId
      createdAt
      updatedAt
    }
  }
`

export const GET_TRANSACTION = gql`
  query GetTransaction($id: String!) {
    getTransaction(id: $id) {
      id
      description
      amount
      type
      date
      userId
      categoryId
      createdAt
      updatedAt
    }
  }
`

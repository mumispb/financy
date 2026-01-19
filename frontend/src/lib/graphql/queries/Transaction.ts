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

export const LIST_TRANSACTIONS_PAGINATED = gql`
  query ListTransactionsPaginated($filters: TransactionFiltersInput!) {
    listTransactionsPaginated(filters: $filters) {
      transactions {
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
      pagination {
        currentPage
        totalPages
        totalItems
        itemsPerPage
        hasNextPage
        hasPreviousPage
      }
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

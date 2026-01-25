import { gql } from '@apollo/client'

export const LIST_CATEGORIES = gql`
  query ListCategories {
    listCategories {
      id
      name
      description
      icon
      color
      userId
      createdAt
      updatedAt
    }
  }
`

export const GET_CATEGORY = gql`
  query GetCategory($id: String!) {
    getCategory(id: $id) {
      id
      name
      description
      icon
      color
      userId
      createdAt
      updatedAt
    }
  }
`

export const GET_CATEGORY_STATS = gql`
  query GetCategoryStats {
    getCategoryStats {
      category {
        id
        name
        description
        icon
        color
        userId
        createdAt
        updatedAt
      }
      itemCount
      totalAmount
    }
  }
`

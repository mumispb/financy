export interface User {
  id: string
  name: string
  email: string
  role?: string
  createdAt?: string
  updatedAt?: string
}


export interface RegisterInput {
  name: string
  email: string
  password: string
}


export interface LoginInput {
  email: string
  password: string
}

export interface UpdateUserInput {
  name?: string
  role?: string
}

// Financial Management Types
export enum TransactionType {
  income = 'income',
  expense = 'expense',
}

export interface Category {
  id: string
  name: string
  description?: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  date: string
  userId: string
  categoryId?: string | null
  category?: Category | null
  createdAt: string
  updatedAt: string
}

// Input Types for Mutations
export interface CreateCategoryInput {
  name: string
  description?: string
}

export interface UpdateCategoryInput {
  name?: string
  description?: string
}

export interface CreateTransactionInput {
  description: string
  amount: number
  type: TransactionType
  date?: string
  categoryId?: string
}

export interface UpdateTransactionInput {
  description?: string
  amount?: number
  type?: TransactionType
  date?: string
  categoryId?: string
}

import { prismaClient } from '../../prisma/prisma'
import { CreateTransactionInput, TransactionFiltersInput, UpdateTransactionInput } from '../dtos/input/transaction.input'
import { PaginatedTransactionsResponse } from '../dtos/output/pagination.output'

export class TransactionService {
  async createTransaction(data: CreateTransactionInput, userId: string) {
    // Verify category belongs to user if provided
    if (data.categoryId) {
      const category = await prismaClient.category.findFirst({
        where: {
          id: data.categoryId,
          userId,
        },
      })
      if (!category) throw new Error('Categoria não encontrada ou não pertence ao usuário')
    }

    return prismaClient.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        type: data.type,
        date: data.date || new Date(),
        userId: userId,
        categoryId: data.categoryId,
      },
    })
  }

  async listTransactions(userId: string) {
    return prismaClient.transaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: 'desc',
      },
    })
  }

  async listTransactionsPaginated(
    userId: string, 
    filters: TransactionFiltersInput
  ): Promise<PaginatedTransactionsResponse> {
    const { search, type, categoryId, month, year, page, limit } = filters
    
    // Build where clause
    const where: any = {
      userId,
    }

    // Add search filter
    // Note: SQLite doesn't support case-insensitive mode in Prisma
    // For case-insensitive search, we use contains which will be case-sensitive
    // If case-insensitive search is needed, consider using raw SQL with COLLATE NOCASE
    if (search) {
      where.description = {
        contains: search,
      }
    }

    // Add type filter
    if (type) {
      where.type = type
    }

    // Add category filter
    if (categoryId) {
      where.categoryId = categoryId
    }

    // Add date filters (month/year)
    if (month !== undefined && year !== undefined) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59, 999)
      
      where.date = {
        gte: startDate,
        lte: endDate,
      }
    } else if (year !== undefined) {
      const startDate = new Date(year, 0, 1)
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999)
      
      where.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const take = limit

    // Execute queries
    const [transactions, totalItems] = await Promise.all([
      prismaClient.transaction.findMany({
        where,
        orderBy: {
          date: 'desc',
        },
        skip,
        take,
      }),
      prismaClient.transaction.count({ where }),
    ])

    const totalPages = Math.ceil(totalItems / limit)

    return {
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    }
  }

  async getTransaction(id: string, userId: string) {
    const transaction = await prismaClient.transaction.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!transaction) throw new Error('Transação não encontrada')

    return transaction
  }

  async updateTransaction(id: string, userId: string, data: UpdateTransactionInput) {
    const transaction = await prismaClient.transaction.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!transaction) throw new Error('Transação não encontrada')

    // Verify category belongs to user if provided
    if (data.categoryId) {
      const category = await prismaClient.category.findFirst({
        where: {
          id: data.categoryId,
          userId,
        },
      })
      if (!category) throw new Error('Categoria não encontrada ou não pertence ao usuário')
    }

    return prismaClient.transaction.update({
      where: { id },
      data: {
        description: data.description,
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId,
        date: data.date,
      },
    })
  }

  async deleteTransaction(id: string, userId: string) {
    const transaction = await prismaClient.transaction.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!transaction) throw new Error('Transação não encontrada')

    return prismaClient.transaction.delete({
      where: {
        id,
      },
    })
  }
}

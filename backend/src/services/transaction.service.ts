import { prismaClient } from '../../prisma/prisma'
import { CreateTransactionInput, UpdateTransactionInput } from '../dtos/input/transaction.input'

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

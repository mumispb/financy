import { prismaClient } from '../../prisma/prisma'
import { CreateCategoryInput, UpdateCategoryInput } from '../dtos/input/category.input'

export class CategoryService {
  async createCategory(data: CreateCategoryInput, userId: string) {
    return prismaClient.category.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        userId: userId,
      },
    })
  }

  async listCategories(userId: string) {
    return prismaClient.category.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async getCategory(id: string, userId: string) {
    const category = await prismaClient.category.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!category) throw new Error('Categoria não encontrada')

    return category
  }

  async updateCategory(id: string, userId: string, data: UpdateCategoryInput) {
    const category = await prismaClient.category.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!category) throw new Error('Categoria não encontrada')

    return prismaClient.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
      },
    })
  }

  async deleteCategory(id: string, userId: string) {
    const category = await prismaClient.category.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!category) throw new Error('Categoria não encontrada')

    return prismaClient.category.delete({
      where: {
        id,
      },
    })
  }

  async getCategoryStats(userId: string) {
    const categories = await prismaClient.category.findMany({
      where: {
        userId,
      },
    })

    const transactions = await prismaClient.transaction.findMany({
      where: {
        userId,
        categoryId: {
          not: null,
        },
      },
    })

    const stats = categories.map((category) => {
      const categoryTransactions = transactions.filter(
        (t) => t.categoryId === category.id
      )
      const itemCount = categoryTransactions.length
      const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)

      return {
        category,
        itemCount,
        totalAmount,
      }
    })

    // Filter out categories with no transactions and sort by total amount descending
    return stats
      .filter((stat) => stat.itemCount > 0)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5) // Return top 5 categories
  }
}

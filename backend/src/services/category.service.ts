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
}

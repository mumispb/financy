import {
  Arg,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql'
import { CategoryModel } from '../models/category.model'
import { CreateCategoryInput, UpdateCategoryInput } from '../dtos/input/category.input'
import { CategoryStatsModel } from '../dtos/output/category-stats.output'
import { CategoryService } from '../services/category.service'
import { GqlUser } from '../graphql/decorators/user.decorator'
import { IsAuth } from '../middlewares/auth.middleware'
import { UserModel } from '../models/user.model'

@Resolver(() => CategoryModel)
@UseMiddleware(IsAuth)
export class CategoryResolver {
  private categoryService = new CategoryService()

  @Mutation(() => CategoryModel)
  async createCategory(
    @Arg('data', () => CreateCategoryInput) data: CreateCategoryInput,
    @GqlUser() user: UserModel
  ): Promise<CategoryModel> {
    return this.categoryService.createCategory(data, user.id)
  }

  @Mutation(() => CategoryModel)
  async updateCategory(
    @Arg('id', () => String) id: string,
    @Arg('data', () => UpdateCategoryInput) data: UpdateCategoryInput,
    @GqlUser() user: UserModel
  ): Promise<CategoryModel> {
    return this.categoryService.updateCategory(id, user.id, data)
  }

  @Mutation(() => Boolean)
  async deleteCategory(
    @Arg('id', () => String) id: string,
    @GqlUser() user: UserModel
  ): Promise<boolean> {
    await this.categoryService.deleteCategory(id, user.id)
    return true
  }

  @Query(() => [CategoryModel])
  async listCategories(@GqlUser() user: UserModel): Promise<CategoryModel[]> {
    return this.categoryService.listCategories(user.id)
  }

  @Query(() => CategoryModel)
  async getCategory(
    @Arg('id', () => String) id: string,
    @GqlUser() user: UserModel
  ): Promise<CategoryModel> {
    return this.categoryService.getCategory(id, user.id)
  }

  @Query(() => [CategoryStatsModel])
  async getCategoryStats(@GqlUser() user: UserModel): Promise<CategoryStatsModel[]> {
    return this.categoryService.getCategoryStats(user.id)
  }
}

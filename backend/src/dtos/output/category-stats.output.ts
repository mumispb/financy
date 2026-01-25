import { Field, Float, Int, ObjectType } from 'type-graphql'
import { CategoryModel } from '../../models/category.model'

@ObjectType()
export class CategoryStatsModel {
  @Field(() => CategoryModel)
  category!: CategoryModel

  @Field(() => Int)
  itemCount!: number

  @Field(() => Float)
  totalAmount!: number
}

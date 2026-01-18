import { Field, GraphQLISODateTime, ID, ObjectType, registerEnumType } from 'type-graphql'

export enum TransactionType {
  income = 'income',
  expense = 'expense',
}

registerEnumType(TransactionType, {
  name: 'TransactionType',
  description: 'Type of transaction',
})

@ObjectType()
export class TransactionModel {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  description!: string

  @Field(() => Number)
  amount!: number

  @Field(() => TransactionType)
  type!: TransactionType

  @Field(() => GraphQLISODateTime)
  date!: Date

  @Field(() => String)
  userId!: string

  @Field(() => String, { nullable: true })
  categoryId?: string

  @Field(() => GraphQLISODateTime)
  createdAt!: Date

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date
}

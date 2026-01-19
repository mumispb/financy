import { Field, Int, ObjectType } from 'type-graphql'
import { TransactionModel } from '../../models/transaction.model'

@ObjectType()
export class PaginationMetadata {
  @Field(() => Int)
  currentPage!: number

  @Field(() => Int)
  totalPages!: number

  @Field(() => Int)
  totalItems!: number

  @Field(() => Int)
  itemsPerPage!: number

  @Field(() => Boolean)
  hasNextPage!: boolean

  @Field(() => Boolean)
  hasPreviousPage!: boolean
}

@ObjectType()
export class PaginatedTransactionsResponse {
  @Field(() => [TransactionModel])
  transactions!: TransactionModel[]

  @Field(() => PaginationMetadata)
  pagination!: PaginationMetadata
}

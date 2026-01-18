import { Field, InputType } from 'type-graphql'
import { TransactionType } from '../../models/transaction.model'

@InputType()
export class CreateTransactionInput {
  @Field(() => String)
  description!: string

  @Field(() => Number)
  amount!: number

  @Field(() => TransactionType)
  type!: TransactionType

  @Field(() => String, { nullable: true })
  categoryId?: string

  @Field(() => Date, { nullable: true })
  date?: Date
}

@InputType()
export class UpdateTransactionInput {
  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Number, { nullable: true })
  amount?: number

  @Field(() => TransactionType, { nullable: true })
  type?: TransactionType

  @Field(() => String, { nullable: true })
  categoryId?: string

  @Field(() => Date, { nullable: true })
  date?: Date
}

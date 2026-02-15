import {
  Field,
  GraphQLISODateTime,
  ID,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { GraphQLDate } from "../scalars/Date.scalar";

export enum TransactionType {
  income = "income",
  expense = "expense",
}

registerEnumType(TransactionType, {
  name: "TransactionType",
  description: "Type of transaction",
});

@ObjectType()
export class TransactionModel {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  description!: string;

  @Field(() => Number)
  amount!: number;

  @Field(() => TransactionType)
  type!: TransactionType;

  @Field(() => GraphQLDate)
  date!: string;

  @Field(() => String)
  userId!: string;

  @Field(() => String, { nullable: true })
  categoryId?: string;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}

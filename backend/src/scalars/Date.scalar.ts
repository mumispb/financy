import { GraphQLScalarType, Kind } from "graphql";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validateDate(value: string): string {
  if (!DATE_REGEX.test(value)) {
    throw new Error(`Invalid date format. Expected YYYY-MM-DD, got: ${value}`);
  }
  const date = new Date(value + "T12:00:00.000Z");
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return value;
}

export const GraphQLDate = new GraphQLScalarType({
  name: "Date",
  description: "A date string in YYYY-MM-DD format (no time, no timezone)",
  serialize(value: unknown): string {
    if (typeof value !== "string") {
      throw new Error("Date scalar can only serialize string values");
    }
    return validateDate(value);
  },
  parseValue(value: unknown): string {
    if (typeof value !== "string") {
      throw new Error("Date scalar can only parse string values");
    }
    return validateDate(value);
  },
  parseLiteral(ast): string {
    if (ast.kind !== Kind.STRING) {
      throw new Error("Date scalar can only parse string literals");
    }
    return validateDate(ast.value);
  },
});

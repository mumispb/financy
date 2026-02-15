import { prismaClient } from "../../prisma/prisma";
import {
  CreateTransactionInput,
  TransactionFiltersInput,
  UpdateTransactionInput,
} from "../dtos/input/transaction.input";
import { PaginatedTransactionsResponse } from "../dtos/output/pagination.output";

export class TransactionService {
  async createTransaction(data: CreateTransactionInput, userId: string) {
    // Verify category belongs to user if provided
    if (data.categoryId) {
      const category = await prismaClient.category.findFirst({
        where: {
          id: data.categoryId,
          userId,
        },
      });
      if (!category)
        throw new Error("Categoria não encontrada ou não pertence ao usuário");
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return prismaClient.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        type: data.type,
        date: data.date || today,
        userId: userId,
        categoryId: data.categoryId,
      },
    });
  }

  async listTransactions(userId: string) {
    return prismaClient.transaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  async listTransactionsPaginated(
    userId: string,
    filters: TransactionFiltersInput,
  ): Promise<PaginatedTransactionsResponse> {
    const { search, type, categoryId, month, year, page, limit } = filters;

    // Build where clause
    const where: any = {
      userId,
    };

    // Add search filter
    // Note: SQLite doesn't support case-insensitive mode in Prisma
    // For case-insensitive search, we use contains which will be case-sensitive
    // If case-insensitive search is needed, consider using raw SQL with COLLATE NOCASE
    if (search) {
      where.description = {
        contains: search,
      };
    }

    // Add type filter
    if (type) {
      where.type = type;
    }

    // Add category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Add date filters (month/year) - date is stored as YYYY-MM-DD string
    // Use raw SQL for date range to avoid Prisma client DateTime validation (when client is stale)
    const hasDateFilter =
      (month !== undefined && year !== undefined) || year !== undefined;
    const startDate =
      month !== undefined && year !== undefined
        ? `${year}-${String(month).padStart(2, "0")}-01`
        : year !== undefined
          ? `${year}-01-01`
          : null;
    const endDate =
      month !== undefined && year !== undefined
        ? (() => {
            const lastDay = new Date(year, month, 0).getDate();
            return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
          })()
        : year !== undefined
          ? `${year}-12-31`
          : null;

    if (hasDateFilter && startDate && endDate) {
      // Use $queryRaw to bypass Prisma client type validation for date string comparison
      const conditions: string[] = ['"userId" = ?'];
      const params: (string | number)[] = [userId];
      if (search) {
        conditions.push('"description" LIKE ?');
        params.push(`%${search}%`);
      }
      if (type) {
        conditions.push('"type" = ?');
        params.push(type);
      }
      if (categoryId) {
        conditions.push('"categoryId" = ?');
        params.push(categoryId);
      }
      conditions.push('"date" >= ?', '"date" <= ?');
      params.push(startDate, endDate);

      const skip = (page - 1) * limit;
      const whereClause = conditions.join(" AND ");

      const [transactions, countResult] = await Promise.all([
        prismaClient.$queryRawUnsafe<any[]>(
          `SELECT * FROM "Transaction" WHERE ${whereClause} ORDER BY "date" DESC LIMIT ? OFFSET ?`,
          ...params,
          limit,
          skip,
        ),
        prismaClient.$queryRawUnsafe<[{ count: bigint }]>(
          `SELECT COUNT(*) as count FROM "Transaction" WHERE ${whereClause}`,
          ...params,
        ),
      ]);
      const totalItems = Number(countResult[0]?.count ?? 0);
      const totalPages = Math.ceil(totalItems / limit);
      return {
        transactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    }

    // No date filter - use standard Prisma query
    const skip = (page - 1) * limit;
    const take = limit;

    const [transactions, totalItems] = await Promise.all([
      prismaClient.transaction.findMany({
        where,
        orderBy: {
          date: "desc",
        },
        skip,
        take,
      }),
      prismaClient.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getTransaction(id: string, userId: string) {
    const transaction = await prismaClient.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!transaction) throw new Error("Transação não encontrada");

    return transaction;
  }

  async updateTransaction(
    id: string,
    userId: string,
    data: UpdateTransactionInput,
  ) {
    const transaction = await prismaClient.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!transaction) throw new Error("Transação não encontrada");

    // Verify category belongs to user if provided
    if (data.categoryId) {
      const category = await prismaClient.category.findFirst({
        where: {
          id: data.categoryId,
          userId,
        },
      });
      if (!category)
        throw new Error("Categoria não encontrada ou não pertence ao usuário");
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
    });
  }

  async deleteTransaction(id: string, userId: string) {
    const transaction = await prismaClient.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!transaction) throw new Error("Transação não encontrada");

    return prismaClient.transaction.delete({
      where: {
        id,
      },
    });
  }
}

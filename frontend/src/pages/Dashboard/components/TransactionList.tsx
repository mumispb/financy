import { Transaction, Category } from "@/types"
import { TransactionItem } from "./TransactionItem"

interface TransactionListProps {
  transactions: Transaction[]
  categoryMap: Record<string, Category>
}

export function TransactionList({ transactions, categoryMap }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhuma transação encontrada.</p>
        <p className="text-sm mt-2">Comece adicionando sua primeira transação!</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {transactions.map((transaction, index) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          category={transaction.categoryId ? categoryMap[transaction.categoryId] : null}
          isLast={index === transactions.length - 1}
        />
      ))}
    </div>
  )
}

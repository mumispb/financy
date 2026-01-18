import { Page } from "@/components/Page"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { AddTransactionDialog } from "./components/AddTransactionDialog"
import { useState } from "react"
import { useQuery, useMutation } from "@apollo/client/react"
import { LIST_TRANSACTIONS } from "@/lib/graphql/queries/Transaction"
import { DELETE_TRANSACTION } from "@/lib/graphql/mutations/Transaction"
import { Transaction, TransactionType } from "@/types"
import { SummaryCard } from "./components/SummaryCard"
import { TransactionList } from "./components/TransactionList"
import { toast } from "sonner"

export function DashboardPage() {
  const [openDialog, setOpenDialog] = useState(false)
  const { data, loading, refetch } = useQuery<{ listTransactions: Transaction[] }>(LIST_TRANSACTIONS)
  const [deleteTransaction] = useMutation(DELETE_TRANSACTION)

  const transactions = data?.listTransactions || []

  // Calculate financial summary
  const totalIncome = transactions
    .filter((t) => t.type === TransactionType.income)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === TransactionType.expense)
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const handleEdit = (transaction: Transaction) => {
    // TODO: Implement edit functionality
    console.log("Edit transaction:", transaction)
    toast.info("Edição de transação em desenvolvimento")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) {
      return
    }

    try {
      await deleteTransaction({
        variables: { id },
      })
      toast.success("Transação excluída com sucesso!")
      refetch()
    } catch (error) {
      console.error("Erro ao excluir transação:", error)
      toast.error("Erro ao excluir transação. Tente novamente.")
    }
  }

  // Sort transactions by date (most recent first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <Page>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Label className="text-3xl font-medium text-purple-600">Dashboard</Label>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova transação
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            title="Receitas"
            value={totalIncome}
            icon={TrendingUp}
            iconColor="text-green-600"
          />
          <SummaryCard
            title="Despesas"
            value={totalExpenses}
            icon={TrendingDown}
            iconColor="text-red-600"
          />
          <SummaryCard
            title="Saldo"
            value={balance}
            icon={Wallet}
            iconColor={balance >= 0 ? "text-purple-600" : "text-red-600"}
          />
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          <Label className="text-xl font-medium">Transações Recentes</Label>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`transaction-skeleton-${i}`}
                  className="h-20 rounded-lg border border-dashed border-muted-foreground/30 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <TransactionList
              transactions={sortedTransactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      <AddTransactionDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onCreated={() => refetch()}
      />
    </Page>
  )
}

import { Page } from "@/components/Page"
import { Button } from "@/components/ui/button"
import { TransactionDialog } from "@/pages/Transactions/components/TransactionDialog"
import { useState } from "react"
import { useQuery } from "@apollo/client/react"
import { LIST_TRANSACTIONS } from "@/lib/graphql/queries/Transaction"
import { LIST_CATEGORIES } from "@/lib/graphql/queries/Category"
import { Transaction, TransactionType, Category } from "@/types"
import { SummaryCard } from "./components/SummaryCard"
import { TransactionList } from "./components/TransactionList"
import { CategoriesList } from "./components/CategoriesList"
import { Link } from "react-router-dom"
import WalletIcon from "@/assets/icons/wallet.svg?react"
import UploadIcon from "@/assets/icons/upload.svg?react"
import DownloadIcon from "@/assets/icons/download.svg?react"
import ChevronRightIcon from "@/assets/icons/chevron-right.svg?react"
import PlusIcon from "@/assets/icons/plus.svg?react"

export function DashboardPage() {
  const [openDialog, setOpenDialog] = useState(false)
  const { data, loading, refetch } = useQuery<{ listTransactions: Transaction[] }>(LIST_TRANSACTIONS)
  const { data: categoriesData } = useQuery<{ listCategories: Category[] }>(LIST_CATEGORIES)

  const transactions = data?.listTransactions || []
  const categories = categoriesData?.listCategories || []

  // Create category map for quick lookup
  const categoryMap = categories.reduce((acc, category) => {
    acc[category.id] = category
    return acc
  }, {} as Record<string, Category>)

  // Get current month and year
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Calculate monthly financial summary
  const monthlyIncome = transactions
    .filter((t) => {
      const transactionDate = new Date(t.date)
      return (
        t.type === TransactionType.income &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      )
    })
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpenses = transactions
    .filter((t) => {
      const transactionDate = new Date(t.date)
      return (
        t.type === TransactionType.expense &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      )
    })
    .reduce((sum, t) => sum + t.amount, 0)

  // Calculate total balance (all time)
  const totalIncome = transactions
    .filter((t) => t.type === TransactionType.income)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === TransactionType.expense)
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  // Sort transactions by date (most recent first) and limit to 5
  const sortedTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <Page>
      <div className="grid grid-cols-3 gap-6">
        {/* Summary Cards - Row 1 */}
        <div className="col-span-1">
          <SummaryCard
            title="Saldo total"
            value={balance}
            icon={WalletIcon}
            iconColor="text-purple-600"
          />
        </div>
        <div className="col-span-1">
          <SummaryCard
            title="Receitas do mês"
            value={monthlyIncome}
            icon={UploadIcon}
            iconColor="text-green-600"
          />
        </div>
        <div className="col-span-1">
          <SummaryCard
            title="Despesas do mês"
            value={monthlyExpenses}
            icon={DownloadIcon}
            iconColor="text-red-600"
          />
        </div>

        {/* Transactions Section - Row 2, Columns 1-2 */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-[0.6px]">
                Transações recentes
              </h2>
              <Link
                to="/transactions"
                className="flex items-center gap-1 text-sm font-medium text-[#1f6f43] hover:opacity-80 transition-opacity"
              >
                Ver todas
                <ChevronRightIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Body */}
          <div className="w-full">
            {loading ? (
              <div className="space-y-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={`transaction-skeleton-${i}`}
                    className="h-20 border-b border-gray-200 border-dashed animate-pulse bg-gray-50"
                  />
                ))}
              </div>
            ) : (
              <TransactionList
                transactions={sortedTransactions}
                categoryMap={categoryMap}
              />
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-5">
            <Button
              onClick={() => setOpenDialog(true)}
              variant="ghost"
              className="w-full justify-center text-[#1f6f43] hover:bg-[#1f6f43]/10"
            >
              <PlusIcon className="mr-1 h-6 w-6" />
              Nova transação
            </Button>
          </div>
        </div>

        {/* Categories Section - Row 2, Column 3 */}
        <div className="col-span-1">
          <CategoriesList />
        </div>
      </div>

      <TransactionDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onSaved={() => refetch()}
        editingTransaction={null}
      />
    </Page>
  )
}

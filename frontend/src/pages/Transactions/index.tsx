import { Page } from "@/components/Page"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { TransactionDialog } from "./components/TransactionDialog"
import { TransactionFilters, TransactionFiltersState } from "./components/TransactionFilters"
import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@apollo/client/react"
import { LIST_TRANSACTIONS_PAGINATED } from "@/lib/graphql/queries/Transaction"
import { LIST_CATEGORIES } from "@/lib/graphql/queries/Category"
import { DELETE_TRANSACTION } from "@/lib/graphql/mutations/Transaction"
import { Category, Transaction, TransactionType } from "@/types"
import { toast } from "sonner"
import { CATEGORY_ICON_MAP } from "@/constants/icons"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import EditIcon from "@/assets/icons/edit.svg?react"
import TrashIcon from "@/assets/icons/trash.svg?react"
import DownloadIcon from "@/assets/icons/download.svg?react"
import UploadIcon from "@/assets/icons/upload.svg?react"

interface PaginationMetadata {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface PaginatedTransactionsResponse {
  transactions: Transaction[]
  pagination: PaginationMetadata
}

export function TransactionsPage() {
  const currentDate = new Date()
  const [openDialog, setOpenDialog] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  
  const [filters, setFilters] = useState<TransactionFiltersState>({
    search: "",
    type: "",
    categoryId: "",
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  })
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Fetch categories for filters
  const { data: categoriesData } = useQuery<{ listCategories: Category[] }>(LIST_CATEGORIES)
  
  // Fetch paginated transactions
  const { data: transactionsData, loading: transactionsLoading, refetch: refetchTransactions } = useQuery<{
    listTransactionsPaginated: PaginatedTransactionsResponse
  }>(LIST_TRANSACTIONS_PAGINATED, {
    variables: {
      filters: {
        search: filters.search || undefined,
        type: filters.type || undefined,
        categoryId: filters.categoryId || undefined,
        month: filters.month,
        year: filters.year,
        page: currentPage,
        limit: itemsPerPage,
      }
    },
    fetchPolicy: "network-only",
  })
  
  const [deleteTransaction] = useMutation(DELETE_TRANSACTION)

  const categories = categoriesData?.listCategories || []
  const transactions = transactionsData?.listTransactionsPaginated.transactions || []
  const pagination = transactionsData?.listTransactionsPaginated.pagination

  // Create a map of category id to category for quick lookup
  const categoryMap = categories.reduce((acc, category) => {
    acc[category.id] = category
    return acc
  }, {} as Record<string, Category>)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setOpenDialog(true)
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
      refetchTransactions()
    } catch (error) {
      console.error("Erro ao excluir transação:", error)
      toast.error("Erro ao excluir transação. Tente novamente.")
    }
  }

  const handleDialogClose = (open: boolean) => {
    setOpenDialog(open)
    if (!open) {
      setEditingTransaction(null)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  return (
    <Page>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-3xl font-bold text-2xl text-gray-800">Transações</Label>
            <Button 
              onClick={() => setOpenDialog(true)}
              className="bg-[#1D7A5E] hover:bg-[#166149]"
            >
              <Plus className="h-4 w-4" />
              Nova transação
            </Button>
          </div>
          <p className="text-sm text-gray-600">Gerencie todas as suas transações financeiras</p>
        </div>

        {/* Filters */}
        <TransactionFilters
          filters={filters}
          onFiltersChange={setFilters}
          categories={categories}
        />

        {/* Table */}
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="animate-pulse">Carregando...</div>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-gray-500">
                      <p className="text-lg font-semibold mb-1">Nenhuma transação encontrada</p>
                      <p className="text-sm">Tente ajustar os filtros ou adicione uma nova transação</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => {
                  const category = transaction.categoryId ? categoryMap[transaction.categoryId] : null
                  const IconComponent = category?.icon && CATEGORY_ICON_MAP[category.icon] 
                    ? CATEGORY_ICON_MAP[category.icon] 
                    : null

                  return (
                    <TableRow key={transaction.id}>
                      {/* Description with Icon */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {IconComponent ? (
                            <div 
                              className="p-2 rounded-lg flex items-center justify-center"
                              style={{ 
                                backgroundColor: category?.color ? `${category.color}20` : '#F3F4F6',
                                color: category?.color || '#6B7280'
                              }}
                            >
                              <IconComponent className="h-5 w-5" />
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg flex items-center justify-center bg-gray-100">
                              <div className="h-5 w-5 rounded bg-gray-300" />
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{transaction.description}</span>
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-gray-600">
                        {formatDate(transaction.date)}
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        {category ? (
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: category.color ? `${category.color}20` : '#F3F4F6',
                              color: category.color || '#6B7280'
                            }}
                          >
                            {category.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        {transaction.type === TransactionType.income ? (
                          <span className="inline-flex items-center gap-1.5 text-gray-600">
                            <UploadIcon className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">Entrada</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-red-600">
                            <DownloadIcon className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-600">Saída</span>
                          </span>
                        )}
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right">
                        <span className={`font-semibold ${
                          transaction.type === TransactionType.income 
                            ? 'text-gray-900' 
                            : 'text-gray-900'
                        }`}>
                          {transaction.type === TransactionType.income ? '+ ' : '- '}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-2 text-red-600 hover:text-red-700 rounded-lg transition-colors border border-gray-300 hover:border-red-600 bg-white"
                            title="Excluir"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="p-2 text-gray-600 hover:text-[#1D7A5E] rounded-lg transition-colors border border-gray-300 hover:border-[#1D7A5E] bg-white"
                            title="Editar"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && pagination.totalItems > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-600">
                {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} a{" "}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} | {" "}
                {pagination.totalItems} resultado{pagination.totalItems !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={`h-8 w-8 p-0 ${
                      page === pagination.currentPage 
                        ? 'bg-[#1D7A5E] hover:bg-[#166149] text-white' 
                        : ''
                    }`}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <TransactionDialog
        open={openDialog}
        onOpenChange={handleDialogClose}
        onSaved={() => refetchTransactions()}
        editingTransaction={editingTransaction}
      />
    </Page>
  )
}

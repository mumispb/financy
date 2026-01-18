import { Page } from "@/components/Page"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, Tag, ArrowUpDown } from "lucide-react"
import { NewCategoryDialog } from "./components/NewCategoryDialog"
import { CategoryCard } from "./components/CategoryCard"
import { useState } from "react"
import { useQuery, useMutation } from "@apollo/client/react"
import { LIST_CATEGORIES } from "@/lib/graphql/queries/Category"
import { LIST_TRANSACTIONS } from "@/lib/graphql/queries/Transaction"
import { DELETE_CATEGORY } from "@/lib/graphql/mutations/Category"
import { Category, Transaction } from "@/types"
import { toast } from "sonner"
import { CATEGORY_ICON_MAP } from "@/constants/icons"

interface CategoryWithStats extends Category {
  transactionCount: number
}

export function CategoriesPage() {
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  
  const { data: categoriesData, loading: categoriesLoading, refetch: refetchCategories } = useQuery<{ listCategories: Category[] }>(LIST_CATEGORIES)
  const { data: transactionsData } = useQuery<{ listTransactions: Transaction[] }>(LIST_TRANSACTIONS)
  const [deleteCategory] = useMutation(DELETE_CATEGORY)

  const categories = categoriesData?.listCategories || []
  const transactions = transactionsData?.listTransactions || []

  // Calculate transaction count per category
  const categoriesWithStats: CategoryWithStats[] = categories.map(category => {
    const transactionCount = transactions.filter(t => t.categoryId === category.id).length
    return { ...category, transactionCount }
  })

  // Find most used category
  const mostUsedCategory = categoriesWithStats.length > 0
    ? categoriesWithStats.reduce((prev, current) => 
        (prev.transactionCount > current.transactionCount) ? prev : current
      )
    : null

  const totalTransactions = transactions.length

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setOpenDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) {
      return
    }

    try {
      await deleteCategory({
        variables: { id },
      })
      toast.success("Categoria excluída com sucesso!")
      refetchCategories()
    } catch (error) {
      console.error("Erro ao excluir categoria:", error)
      toast.error("Erro ao excluir categoria. Tente novamente.")
    }
  }

  const handleDialogClose = (open: boolean) => {
    setOpenDialog(open)
    if (!open) {
      setEditingCategory(null)
    }
  }

  return (
    <Page>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-3xl font-bold text-2xl text-gray-800">Categorias</Label>
            <Button 
              onClick={() => setOpenDialog(true)}
              className="bg-[#1D7A5E] hover:bg-[#166149]"
            >
              <Plus className="h-4 w-4" />
              Nova categoria
            </Button>
          </div>
          <p className="text-sm text-gray-600">Organize suas transações por categorias</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-6">
            <div className="flex gap-3">
                <div className="mt-1.5">
                  <Tag className="h-6 w-6 text-gray-600" />
                </div>
              <div>
                <p className="text-[28px] font-bold text-gray-900">{categories.length}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total de Categorias</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <div className="flex  gap-3">
                <div className="mt-1.5">
                  <ArrowUpDown className="h-6 w-6 text-purple-600" />
                </div>
              <div>
                <p className="text-[28px] font-bold text-gray-900">{totalTransactions}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total de Transações</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <div className="flex  gap-3">
              {mostUsedCategory?.icon && CATEGORY_ICON_MAP[mostUsedCategory.icon] ? (
                (() => {
                  const IconComponent = CATEGORY_ICON_MAP[mostUsedCategory.icon]
                  return (
                    <div className="mt-1.5" style={{ color: mostUsedCategory.color || "#6B7280" }}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                  )
                })()
              ) : (
                <div className="mt-1.5">
                  <Tag className="h-6 w-6 text-gray-600" />
                </div>
              )}
              <div className="flex gap-1 flex-col">
                <p className="text-[28px] font-bold text-gray-900">{mostUsedCategory?.name || "—"}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Categoria Mais Utilizada</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-5">
          {categoriesLoading ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(284px, 1fr))' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={`category-skeleton-${i}`}
                  className="h-48 rounded-lg border border-dashed border-muted-foreground/30 animate-pulse min-w-[284px]"
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-6 mb-4">
                <Tag className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma categoria cadastrada
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Comece criando sua primeira categoria para organizar suas transações
              </p>
              <Button 
                onClick={() => setOpenDialog(true)}
                className="bg-[#1D7A5E] hover:bg-[#166149]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar primeira categoria
              </Button>
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(284px, 1fr))' }}>
              {categoriesWithStats.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  transactionCount={category.transactionCount}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <NewCategoryDialog
        open={openDialog}
        onOpenChange={handleDialogClose}
        onCreated={() => refetchCategories()}
        editingCategory={editingCategory}
      />
    </Page>
  )
}

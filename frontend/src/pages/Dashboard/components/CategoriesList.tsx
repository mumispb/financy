import { Category } from "@/types"
import { Link } from "react-router-dom"
import { useQuery } from "@apollo/client/react"
import { GET_CATEGORY_STATS } from "@/lib/graphql/queries/Category"
import ChevronRightIcon from "@/assets/icons/chevron-right.svg?react"
import { ReactNode } from "react"

interface CategoryStats {
  category: Category
  itemCount: number
  totalAmount: number
}

function CategoriesListHeader() {
  return (
    <div className="border-b border-gray-200 px-6 py-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-[0.6px]">
          Categorias
        </h2>
        <Link
          to="/categories"
          className="flex items-center gap-1 text-sm font-medium text-[#1f6f43] hover:opacity-80 transition-opacity"
        >
          Gerenciar
          <ChevronRightIcon className="h-5 w-5" />
        </Link>
      </div>
    </div>
  )
}

function CategoriesListContainer({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <CategoriesListHeader />
      {children}
    </div>
  )
}

export function CategoriesList() {
  const { data, loading } = useQuery<{ getCategoryStats: CategoryStats[] }>(GET_CATEGORY_STATS)
  
  const categoryStats = data?.getCategoryStats || []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  if (loading) {
    return (
      <CategoriesListContainer>
        <div className="px-6 py-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`category-skeleton-${i}`}
                className="h-8 rounded animate-pulse bg-gray-100"
              />
            ))}
          </div>
        </div>
      </CategoriesListContainer>
    )
  }

  if (categoryStats.length === 0) {
    return (
      <CategoriesListContainer>
        <div className="px-6 py-8 text-center text-gray-500">
          <p>Nenhuma categoria com transações encontrada.</p>
        </div>
      </CategoriesListContainer>
    )
  }

  return (
    <CategoriesListContainer>
      <div className="px-6 py-6 flex flex-col gap-5">
        {categoryStats.map(({ category, itemCount, totalAmount }) => {
          const categoryColor = category.color || '#6b7280'
          const categoryBgColor = `${categoryColor}20`

          return (
            <div
              key={category.id}
              className="flex gap-1 items-center w-full"
            >
              <span
                className="text-sm px-3 py-1 rounded-full font-medium shrink-0"
                style={{
                  backgroundColor: categoryBgColor,
                  color: categoryColor,
                }}
              >
                {category.name}
              </span>
              <p className="flex-1 text-sm text-gray-600 text-right min-w-0">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </p>
              <p className="text-sm font-semibold text-gray-900 text-right w-[88px] shrink-0">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          )
        })}
      </div>
    </CategoriesListContainer>
  )
}

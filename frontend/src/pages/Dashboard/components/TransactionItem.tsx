import { Transaction, TransactionType, Category } from "@/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CATEGORY_ICON_MAP } from "@/constants/icons"
import UploadIcon from "@/assets/icons/upload.svg?react"
import DownloadIcon from "@/assets/icons/download.svg?react"

interface TransactionItemProps {
  transaction: Transaction
  category?: Category | null
  isLast?: boolean
}

export function TransactionItem({ transaction, category, isLast = false }: TransactionItemProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  const isIncome = transaction.type === TransactionType.income
  
  // Get category icon or default icon
  const CategoryIcon = category?.icon && CATEGORY_ICON_MAP[category.icon]
    ? CATEGORY_ICON_MAP[category.icon]
    : isIncome ? UploadIcon : DownloadIcon

  // Get category color or default color
  const categoryColor = category?.color || (isIncome ? '#15803d' : '#ef4444')
  const categoryBgColor = category?.color 
    ? `${categoryColor}20` 
    : (isIncome ? '#e0fae9' : '#fee2e2')
  const categoryName = category?.name || (isIncome ? 'Receita' : 'Despesa')

  return (
    <div className={`flex items-center border-b ${isLast ? 'border-b-0' : 'border-gray-200'}`}>
      {/* Icon Column */}
      <div className="flex flex-1 gap-4 items-center min-w-0 px-6 h-20">
        <div 
          className="rounded-lg flex items-center justify-center shrink-0 size-10"
          style={{ backgroundColor: categoryBgColor }}
        >
          <CategoryIcon className="h-6 w-6" style={{ color: categoryColor }} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <p className="font-medium text-base text-gray-900 leading-6">{transaction.description}</p>
          <p className="text-sm text-gray-600 leading-5">
            {format(new Date(transaction.date), "dd/MM/yy", { locale: ptBR })}
          </p>
        </div>
      </div>
      
      {/* Category Tag Column */}
      <div className="flex items-center justify-center px-6 h-20 w-40 shrink-0">
        <span 
          className="text-sm px-3 py-1 rounded-full font-medium"
          style={{ 
            backgroundColor: categoryBgColor,
            color: categoryColor
          }}
        >
          {categoryName}
        </span>
      </div>
      
      {/* Amount Column */}
      <div className="flex gap-2 items-center justify-end px-6 h-20 w-40 shrink-0">
        <p className="text-sm font-semibold text-gray-900">
          {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
        </p>
        {isIncome ? (
          <UploadIcon className="h-4 w-4 text-green-600" />
        ) : (
          <DownloadIcon className="h-4 w-4 text-red-600" />
        )}
      </div>
    </div>
  )
}

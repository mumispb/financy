import EditIcon from "@/assets/icons/edit.svg?react"
import TrashIcon from "@/assets/icons/trash.svg?react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CATEGORY_ICON_MAP } from "@/constants/icons"
import { Category } from "@/types"

interface CategoryCardProps {
  category: Category
  transactionCount: number
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

export function CategoryCard({ category, transactionCount, onEdit, onDelete }: CategoryCardProps) {
  const backgroundColor = category.color || "#6B7280"
  const lightBackgroundColor = `${backgroundColor}20`

  return (
    <Card className="p-6 hover:shadow-md transition-shadow min-w-[284px]">
        {/* Icon and Actions */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className="rounded-lg p-3"
            style={{ 
              backgroundColor: lightBackgroundColor,
              color: backgroundColor 
            }}
          >
            {category.icon && CATEGORY_ICON_MAP[category.icon] ? (
              (() => {
                const IconComponent = CATEGORY_ICON_MAP[category.icon]
                return <IconComponent className="h-5 w-5" />
              })()
            ) : (
              <div className="h-8 w-8 rounded bg-gray-300" />
            )}
          </div>
          <div className="flex gap-2">
          <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 border-gray-200"
              onClick={() => onDelete(category.id)}
            >
              <TrashIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200"
              onClick={() => onEdit(category)}
            >
              <EditIcon className="h-5 w-5" />
            </Button>
            
          </div>
        </div>

        {/* Category Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {category.description || "Sem descrição"}
          </p>
        </div>

        {/* Category Badge with Count */}
        <div className="mt-3">
            <div className="flex justify-between gap-2 items-center">
                <div className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: lightBackgroundColor,
                  color: backgroundColor 
                }}
              >
                {category.name}
                </div>
              <div className="text-sm text-gray-500">{transactionCount} {transactionCount === 1 ? "item" : "itens"}</div>
            </div>
        </div>
    </Card>
  )
}

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Search } from "lucide-react"
import { Category, TransactionType } from "@/types"

export interface TransactionFiltersState {
  search: string
  type: string
  categoryId: string
  month: number
  year: number
}

interface TransactionFiltersProps {
  filters: TransactionFiltersState
  onFiltersChange: (filters: TransactionFiltersState) => void
  categories: Category[]
}

export function TransactionFilters({ filters, onFiltersChange, categories }: TransactionFiltersProps) {
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  // Generate last 12 months
  const generateLast12Months = () => {
    const periods = []
    const currentDate = new Date()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      const label = `${monthNames[date.getMonth()]} / ${year}`
      periods.push({ month, year, label, value: `${month}-${year}` })
    }
    
    return periods
  }

  const periods = generateLast12Months()

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search })
  }

  const handleTypeChange = (type: string) => {
    onFiltersChange({ ...filters, type })
  }

  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({ ...filters, categoryId })
  }

  const handlePeriodChange = (value: string) => {
    const [month, year] = value.split('-').map(Number)
    onFiltersChange({ ...filters, month, year })
  }

  return (
    <div className="grid gap-4 md:grid-cols-4 bg-white p-4 rounded-lg border">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-xs text-gray-600 uppercase tracking-wide">Buscar</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="search"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por descrição"
            className="pl-10"
          />
        </div>
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label htmlFor="type" className="text-xs text-gray-600 uppercase tracking-wide">Tipo</Label>
        <Select
          id="type"
          value={filters.type}
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          <option value="">Todos</option>
          <option value={TransactionType.income}>Entrada</option>
          <option value={TransactionType.expense}>Saída</option>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-xs text-gray-600 uppercase tracking-wide">Categoria</Label>
        <Select
          id="category"
          value={filters.categoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Period */}
      <div className="space-y-2">
        <Label htmlFor="period" className="text-xs text-gray-600 uppercase tracking-wide">Período</Label>
        <Select
          id="period"
          value={`${filters.month}-${filters.year}`}
          onChange={(e) => handlePeriodChange(e.target.value)}
        >
          {periods.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}

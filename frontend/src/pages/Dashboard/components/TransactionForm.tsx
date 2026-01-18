import { CreateTransactionInput, TransactionType, Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface TransactionFormProps {
  onSubmit: (data: CreateTransactionInput) => void
  categories: Category[]
  initialData?: CreateTransactionInput
  loading?: boolean
}

export function TransactionForm({ onSubmit, categories, initialData, loading }: TransactionFormProps) {
  const [description, setDescription] = useState(initialData?.description || "")
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "")
  const [type, setType] = useState<TransactionType>(initialData?.type || TransactionType.expense)
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      description,
      amount: parseFloat(amount),
      type,
      date,
      categoryId: categoryId || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Salário, Aluguel, Compras..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valor</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value={TransactionType.expense}>Despesa</option>
          <option value={TransactionType.income}>Receita</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria (opcional)</Label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Sem categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  )
}

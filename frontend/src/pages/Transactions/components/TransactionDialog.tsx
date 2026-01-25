import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { DateInput } from "@/components/ui/date-input"
import { AmountInput } from "@/components/ui/amount-input"
import { TransactionTypeToggle } from "@/components/ui/transaction-type-toggle"
import { useMutation, useQuery } from "@apollo/client/react"
import { CREATE_TRANSACTION, UPDATE_TRANSACTION } from "@/lib/graphql/mutations/Transaction"
import { LIST_CATEGORIES } from "@/lib/graphql/queries/Category"
import { Transaction, TransactionType, CreateTransactionInput, UpdateTransactionInput, Category } from "@/types"
import { toast } from "sonner"

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editingTransaction?: Transaction | null
}

interface CreateTransactionMutationData {
  createTransaction: Transaction
}

interface CreateTransactionMutationVariables {
  data: CreateTransactionInput
}

interface UpdateTransactionMutationData {
  updateTransaction: Transaction
}

interface UpdateTransactionMutationVariables {
  id: string
  data: UpdateTransactionInput
}

export function TransactionDialog({ open, onOpenChange, onSaved, editingTransaction }: TransactionDialogProps) {
  const [description, setDescription] = useState("")
  const [amountCents, setAmountCents] = useState(0)
  const [type, setType] = useState<TransactionType>(TransactionType.expense)
  const [dateISO, setDateISO] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState("")

  const { data: categoriesData } = useQuery<{ listCategories: Category[] }>(LIST_CATEGORIES)
  const [createTransaction, { loading: creating }] = useMutation<CreateTransactionMutationData, CreateTransactionMutationVariables>(CREATE_TRANSACTION)
  const [updateTransaction, { loading: updating }] = useMutation<UpdateTransactionMutationData, UpdateTransactionMutationVariables>(UPDATE_TRANSACTION)

  const loading = creating || updating
  const isEditing = !!editingTransaction
  const categories = categoriesData?.listCategories || []

  // Reset form when dialog opens/closes or when editing transaction changes
  useEffect(() => {
    if (open && editingTransaction) {
      setDescription(editingTransaction.description)
      // Convert amount to cents
      const cents = Math.round(editingTransaction.amount * 100)
      setAmountCents(cents)
      setType(editingTransaction.type)
      const isoDate = new Date(editingTransaction.date).toISOString().split('T')[0]
      setDateISO(isoDate)
      setCategoryId(editingTransaction.categoryId || "")
    } else if (!open) {
      setDescription("")
      setAmountCents(0)
      setType(TransactionType.expense)
      const todayISO = new Date().toISOString().split('T')[0]
      setDateISO(todayISO)
      setCategoryId("")
    }
  }, [open, editingTransaction])



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!description.trim()) {
      toast.error("A descrição não pode estar vazia")
      return
    }

    // Convert cents to decimal amount
    const parsedAmount = amountCents / 100
    
    if (!amountCents || parsedAmount <= 0) {
      toast.error("O valor deve ser maior que zero")
      return
    }

    if (!dateISO) {
      toast.error("A data é obrigatória")
      return
    }
    
    const dateTime = new Date(dateISO + 'T12:00:00.000Z').toISOString()

    try {
      if (isEditing) {
        await updateTransaction({
          variables: {
            id: editingTransaction.id,
            data: {
              description,
              amount: parsedAmount,
              type,
              date: dateTime,
              categoryId: categoryId || undefined,
            }
          }
        })
        toast.success("Transação atualizada com sucesso!")
      } else {
        await createTransaction({
          variables: {
            data: {
              description,
              amount: parsedAmount,
              type,
              date: dateTime,
              categoryId: categoryId || undefined,
            }
          }
        })
        toast.success("Transação criada com sucesso!")
      }
      
      onSaved()
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar transação:", error)
      toast.error("Erro ao salvar transação. Tente novamente.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[448px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{isEditing ? "Editar transação" : "Nova transação"}</DialogTitle>
          <p className="text-sm text-gray-500">
            Registre sua despesa ou receita
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Type Toggle Buttons */}
          <TransactionTypeToggle value={type} onChange={setType} />

          {/* Description */}
          <div className="input-group space-y-2">
            <Label htmlFor="description" className="text-gray-700">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex. Almoço no restaurante"
              required
              className="h-12 text-base"
            />
          </div>

          {/* Data and Valor in grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="input-group space-y-2">
              <Label htmlFor="date" className="text-gray-700">Data</Label>
              <DateInput
                id="date"
                value={dateISO}
                onChange={setDateISO}
                required
              />
            </div>

            {/* Amount */}
            <div className="input-group space-y-2">
              <Label htmlFor="amount" className="text-gray-700">Valor</Label>
              <AmountInput
                id="amount"
                value={amountCents}
                onChange={setAmountCents}
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="input-group space-y-2">
            <Label htmlFor="category" className="text-gray-700">Categoria</Label>
            <Select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-12 text-base"
            >
              <option value="">Selecione</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#1D7A5E] hover:bg-[#166149] text-white text-base font-medium"
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

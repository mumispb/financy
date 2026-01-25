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
import { useMutation, useQuery } from "@apollo/client/react"
import { CREATE_TRANSACTION, UPDATE_TRANSACTION } from "@/lib/graphql/mutations/Transaction"
import { LIST_CATEGORIES } from "@/lib/graphql/queries/Category"
import { Transaction, TransactionType, CreateTransactionInput, UpdateTransactionInput, Category } from "@/types"
import { toast } from "sonner"
import DownloadIcon from "@/assets/icons/download.svg?react"
import UploadIcon from "@/assets/icons/upload.svg?react"

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
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<TransactionType>(TransactionType.expense)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
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
      // Format amount for bank-style display
      const cents = Math.round(editingTransaction.amount * 100)
      setAmount((cents / 100).toFixed(2).replace('.', ','))
      setType(editingTransaction.type)
      setDate(new Date(editingTransaction.date).toISOString().split('T')[0])
      setCategoryId(editingTransaction.categoryId || "")
    } else if (!open) {
      setDescription("")
      setAmount("")
      setType(TransactionType.expense)
      setDate(new Date().toISOString().split('T')[0])
      setCategoryId("")
    }
  }, [open, editingTransaction])


  // Handle amount input change (bank-style: only numbers, auto-format)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers
    const cleaned = value.replace(/[^\d]/g, '')
    
    if (!cleaned) {
      setAmount("")
      return
    }

    // Convert to number (from cents) and format for display
    const numValue = parseFloat(cleaned) / 100
    const formatted = numValue.toFixed(2).replace('.', ',')
    setAmount(formatted)
  }

  // Handle backspace - remove last digit or reset if all selected
  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && amount) {
      const target = e.target as HTMLInputElement
      const isAllSelected = target.selectionStart === 0 && target.selectionEnd === target.value.length
      
      if (isAllSelected) {
        // If all text is selected, reset the field
        e.preventDefault()
        setAmount("")
        return
      }
      
      e.preventDefault()
      // Remove last character, then re-format
      const cleaned = amount.replace(/[^\d]/g, '')
      if (cleaned.length > 1) {
        const newCleaned = cleaned.slice(0, -1)
        const numValue = parseFloat(newCleaned) / 100
        const formatted = numValue.toFixed(2).replace('.', ',')
        setAmount(formatted)
      } else {
        setAmount("")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!description.trim()) {
      toast.error("A descrição não pode estar vazia")
      return
    }

    // Parse amount - remove comma and convert from formatted string
    const cleaned = amount.replace(/[^\d]/g, '')
    const parsedAmount = cleaned ? parseFloat(cleaned) / 100 : 0
    
    if (!amount || parsedAmount <= 0) {
      toast.error("O valor deve ser maior que zero")
      return
    }

    // Convert date string to ISO DateTime format
    const dateTime = new Date(date + 'T12:00:00.000Z').toISOString()

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
          <div className="flex gap-0 border-2 border-gray-300 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setType(TransactionType.expense)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-md transition-all relative
                ${type === TransactionType.expense 
                  ? 'bg-white text-gray-700' 
                  : 'bg-transparent hover:bg-gray-50'
                }
              `}
            >
              {type === TransactionType.expense && (
                <div className="absolute inset-0 rounded-md border-2 border-red-500 pointer-events-none" />
              )}
              <DownloadIcon className={`h-5 w-5 ${type === TransactionType.expense ? 'text-red-600' : 'text-gray-400'}`} />
              <span className={`font-medium text-lg ${type === TransactionType.expense ? 'text-gray-700' : 'text-gray-600'}`}>Despesa</span>
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.income)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-md transition-all relative
                ${type === TransactionType.income 
                  ? 'bg-white text-gray-700' 
                  : 'bg-transparent hover:bg-gray-50'
                }
              `}
            >
              {type === TransactionType.income && (
                <div className="absolute inset-0 rounded-md border-2 border-green-500 pointer-events-none" />
              )}
              <UploadIcon className={`h-5 w-5 ${type === TransactionType.income ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`font-medium text-lg ${type === TransactionType.income ? 'text-gray-700' : 'text-gray-600'}`}>Receita</span>
            </button>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-normal text-gray-700">Descrição</Label>
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
            <div className="space-y-2">
              <Label htmlFor="date" className="text-base font-normal text-gray-700">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-base font-normal text-gray-700">Valor</Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-base">
                  R$
                </span>
                <Input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  onKeyDown={handleAmountKeyDown}
                  placeholder="0,00"
                  required
                  className="h-12 pl-10 text-base placeholder:text-gray-600"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-base font-normal text-gray-700">Categoria</Label>
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

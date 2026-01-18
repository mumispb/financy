import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TransactionForm } from "./TransactionForm"
import { CreateTransactionInput, Category } from "@/types"
import { useMutation, useQuery } from "@apollo/client/react"
import { CREATE_TRANSACTION } from "@/lib/graphql/mutations/Transaction"
import { LIST_CATEGORIES } from "@/lib/graphql/queries/Category"
import { toast } from "sonner"

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function AddTransactionDialog({ open, onOpenChange, onCreated }: AddTransactionDialogProps) {
  const { data: categoriesData } = useQuery<{ listCategories: Category[] }>(LIST_CATEGORIES)
  const [createTransaction, { loading }] = useMutation(CREATE_TRANSACTION)

  const categories = categoriesData?.listCategories || []

  const handleSubmit = async (data: CreateTransactionInput) => {
    try {
      await createTransaction({
        variables: { data },
      })
      toast.success("Transação criada com sucesso!")
      onOpenChange(false)
      onCreated()
    } catch (error) {
      console.error("Erro ao criar transação:", error)
      toast.error("Erro ao criar transação. Tente novamente.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        <TransactionForm
          onSubmit={handleSubmit}
          categories={categories}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  )
}

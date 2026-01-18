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
import { Textarea } from "@/components/ui/textarea"
import { useMutation } from "@apollo/client/react"
import { CREATE_CATEGORY, UPDATE_CATEGORY } from "@/lib/graphql/mutations/Category"
import { Category, CreateCategoryInput, UpdateCategoryInput } from "@/types"
import { toast } from "sonner"
import { CATEGORY_ICON_MAP, AVAILABLE_CATEGORY_ICONS } from "@/constants/icons"

interface NewCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
  editingCategory?: Category | null
}

interface CreateCategoryMutationData {
  createCategory: Category
}

interface CreateCategoryMutationVariables {
  data: CreateCategoryInput
}

interface UpdateCategoryMutationData {
  updateCategory: Category
}

interface UpdateCategoryMutationVariables {
  id: string
  data: UpdateCategoryInput
}

const AVAILABLE_COLORS = [
  "#16A34A", // green
  "#2563EB", // blue
  "#9333EA", // purple
  "#DB2777", // pink
  "#DC2626", // red
  "#EA580C", // orange
  "#CA8A04", // yellow
]

export function NewCategoryDialog({ open, onOpenChange, onCreated, editingCategory }: NewCategoryDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  const [createCategory, { loading: creating }] = useMutation<CreateCategoryMutationData, CreateCategoryMutationVariables>(CREATE_CATEGORY)
  const [updateCategory, { loading: updating }] = useMutation<UpdateCategoryMutationData, UpdateCategoryMutationVariables>(UPDATE_CATEGORY)

  const loading = creating || updating
  const isEditing = !!editingCategory

  // Reset form when dialog opens/closes or when editing category changes
  useEffect(() => {
    if (open && editingCategory) {
      setName(editingCategory.name)
      setDescription(editingCategory.description || "")
      setSelectedIcon(editingCategory.icon || null)
      setSelectedColor(editingCategory.color || null)
    } else if (!open) {
      setName("")
      setDescription("")
      setSelectedIcon(null)
      setSelectedColor(null)
    }
  }, [open, editingCategory])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("O título não pode estar vazio")
      return
    }

    try {
      if (isEditing) {
        await updateCategory({
          variables: {
            id: editingCategory.id,
            data: {
              name,
              description: description || undefined,
              icon: selectedIcon || undefined,
              color: selectedColor || undefined,
            }
          }
        })
        toast.success("Categoria atualizada com sucesso!")
      } else {
        await createCategory({
          variables: {
            data: {
              name,
              description: description || undefined,
              icon: selectedIcon || undefined,
              color: selectedColor || undefined,
            }
          }
        })
        toast.success("Categoria criada com sucesso!")
      }
      
      onCreated()
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar categoria:", error)
      toast.error("Erro ao salvar categoria. Tente novamente.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          <p className="text-sm text-gray-500">
            {isEditing ? "Atualize as informações da categoria" : "Organize suas transações com categorias"}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="name">Título</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Alimentação"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da categoria"
              rows={3}
            />
            <p className="text-xs text-gray-500">Opcional</p>
          </div>

          {/* Icon Selector */}
          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-8 gap-2">
              {AVAILABLE_CATEGORY_ICONS.map((icon) => {
                const IconComponent = CATEGORY_ICON_MAP[icon]
                return (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`
                      p-3 rounded-lg border-2 transition-all hover:scale-110
                      flex items-center justify-center
                      ${selectedIcon === icon 
                        ? 'border-[#1D7A5E] text-[#1D7A5E]' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-500'
                      }
                    `}
                  >
                    <IconComponent className="h-5 w-5" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2">
              {AVAILABLE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`
                    relative h-9 w-14 rounded-xl transition-all hover:scale-105
                    border-2 ${selectedColor === color 
                      ? 'border-gray-900' 
                      : 'border-gray-300'
                    }
                  `}
                >
                  <div 
                    className="absolute inset-1 rounded-lg"
                    style={{ backgroundColor: color }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#1D7A5E] hover:bg-[#166149] text-white"
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
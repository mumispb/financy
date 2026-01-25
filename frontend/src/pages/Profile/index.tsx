import { Page } from "@/components/Page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuthStore } from "@/stores/auth"
import LogOutIcon from "@/assets/icons/log-out.svg?react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useMutation } from "@apollo/client/react"
import { UPDATE_USER } from "@/lib/graphql/mutations/User"
import { User, UpdateUserInput } from "@/types"

interface UpdateUserMutationData {
  updateUser: User
}

interface UpdateUserMutationVariables {
  id: string
  data: UpdateUserInput
}

export function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || "")
  const [updateUserMutation, { loading }] = useMutation<UpdateUserMutationData, UpdateUserMutationVariables>(UPDATE_USER)

  const handleSave = async () => {
    if (!user?.id) return
    
    if (!name.trim()) {
      toast.error("O nome não pode estar vazio")
      return
    }

    try {
      const { data } = await updateUserMutation({
        variables: {
          id: user.id,
          data: { name }
        }
      })

      if (data?.updateUser) {
        updateUser(data.updateUser.name)
        toast.success("Alterações salvas com sucesso!")
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
      toast.error("Erro ao salvar alterações. Tente novamente.")
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
    toast.success("Você saiu da sua conta")
  }

  return (
    <Page>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <Card className="w-full max-w-md p-8">
          {/* Avatar and User Info */}
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarFallback className="bg-gray-300 text-gray-700 font-semibold text-2xl">
                {user?.name?.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>

          <div className="border-t border-gray-200 mb-6"></div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">O e-mail não pode ser alterado</p>
            </div>

            <Button 
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-[#1D7A5E] hover:bg-[#166149] text-white !mt-8 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>

            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full hover:bg-red-50"
            >
              <LogOutIcon className="w-4 h-4 text-red-600" />
              Sair da conta
            </Button>
          </div>
        </Card>
      </div>
    </Page>
  )
}

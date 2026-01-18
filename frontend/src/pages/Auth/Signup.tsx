import { useState } from "react"
import logo from "@/assets/logo.png"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useAuthStore } from "@/stores/auth"
import { toast } from "sonner"
// Icons from Figma style guide - imported as React components for currentColor support
import MailIcon from "@/assets/icons/mail.svg?react"
import LockIcon from "@/assets/icons/lock.svg?react"
import EyeIcon from "@/assets/icons/eye.svg?react"
import EyeOffIcon from "@/assets/icons/eye-off.svg?react"
import UserIcon from "@/assets/icons/user.svg?react"
import LogInIcon from "@/assets/icons/log-in.svg?react"

export function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const signup = useAuthStore((state) => state.signup)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const signupMutate = await signup({
        name,
        email,
        password,
      })
      if (signupMutate) {
        toast.success("Cadastro realizado com sucesso!")
      }
    } catch (error: any) {
      toast.error("Erro ao realizar o cadastro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-12">
      <div className="flex flex-col items-center gap-8 w-full max-w-[448px]">
        {/* Logo */}
        <img src={logo} alt="Logo" className="h-8" />

        {/* Card */}
        <div className="bg-neutral-white border border-gray-200 rounded-xl p-8 w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-800 mb-1">
              Criar conta
            </h1>
            <p className="text-base text-gray-600">
              Comece a controlar suas finanças ainda hoje
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nome completo
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-[46px] border-gray-300 text-base placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                E-mail
              </Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-[46px] border-gray-300 text-base placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-[46px] border-gray-300 text-base placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 transition-opacity hover:opacity-70"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-gray-700" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-700" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                A senha deve ter no mínimo 8 caracteres
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-brand-base hover:bg-brand-dark text-white font-medium text-base rounded-lg"
              disabled={loading}
            >
              Cadastrar
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-sm text-gray-500">ou</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Login Link */}
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Já tem uma conta?
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-gray-300 text-gray-700 font-medium text-base rounded-lg hover:bg-gray-100"
                asChild
              >
                <Link to="/login" className="flex items-center justify-center gap-2">
                  <LogInIcon className="h-4 w-4 text-gray-700" />
                  Fazer login
                </Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

import { Link, useLocation } from "react-router-dom"
import { useAuthStore } from "../stores/auth"
import logoIcon from "@/assets/logo.svg"
import { Avatar, AvatarFallback } from "./ui/avatar"

export function Header() {
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocation()
  const isDashboardPage = location.pathname === "/"
  const isTransactionsPage = location.pathname === "/transactions"
  const isCategoriesPage = location.pathname === "/categories"

  return (
    <div className="w-full px-16 pt-6 pb-4">
      {isAuthenticated && (
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logoIcon} className="h-8" alt="Financy Logo" />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                isDashboardPage 
                  ? 'text-[#1D7A5E]' 
                  : 'text-gray-600 hover:text-[#1D7A5E]'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/transactions" 
              className={`text-sm font-medium transition-colors ${
                isTransactionsPage 
                  ? 'text-[#1D7A5E]' 
                  : 'text-gray-600 hover:text-[#1D7A5E]'
              }`}
            >
              Transações
            </Link>
            <Link 
              to="/categories" 
              className={`text-sm font-medium transition-colors ${
                isCategoriesPage 
                  ? 'text-[#1D7A5E]' 
                  : 'text-gray-600 hover:text-[#1D7A5E]'
              }`}
            >
              Categorias
            </Link>
          </nav>

          {/* User Profile */}
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gray-300 text-gray-700 font-semibold text-sm">
              {user?.name?.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  )
}

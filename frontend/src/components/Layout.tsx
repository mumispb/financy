import { Toaster } from "@/components/ui/sonner"
import { Header } from "./Header"
import { useLocation } from "react-router-dom"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup"

  // Auth pages don't use the Layout wrapper
  if (isAuthPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto px-16 py-4 bg-gray-100">{children}</main>
      <Toaster />
    </div>
  )
}

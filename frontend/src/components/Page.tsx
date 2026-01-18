interface PageProps {
  children: React.ReactNode
}

export function Page({ children }: PageProps) {
  return (
    <div className="min-h-[calc(100vh-9rem)] bg-gray-100 rounded-xl p-12">
      {children}
    </div>
  )
}

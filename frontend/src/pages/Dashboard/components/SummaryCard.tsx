import { Card } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface SummaryCardProps {
  title: string
  value: number
  icon: LucideIcon
  iconColor?: string
}

export function SummaryCard({ title, value, icon: Icon, iconColor = "text-purple-600" }: SummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{formatCurrency(value)}</p>
        </div>
        <div className={`${iconColor}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </Card>
  )
}

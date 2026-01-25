import { Card } from "@/components/ui/card"
import { ReactComponentElement } from "react"

interface SummaryCardProps {
  title: string
  value: number
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
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
    <Card className="p-[25px] bg-white border border-gray-200">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className={`${iconColor} shrink-0`}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-[0.6px]">{title}</p>
        </div>
        <p className="text-[28px] font-bold text-gray-900 leading-[32px]">{formatCurrency(value)}</p>
      </div>
    </Card>
  )
}

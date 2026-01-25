import { TransactionType } from "@/types"
import DownloadIcon from "@/assets/icons/download.svg?react"
import UploadIcon from "@/assets/icons/upload.svg?react"

interface TransactionTypeToggleProps {
  value: TransactionType
  onChange: (type: TransactionType) => void
  className?: string
}

export function TransactionTypeToggle({ value, onChange, className = "" }: TransactionTypeToggleProps) {
  return (
    <div className={`flex gap-0 border-2 border-gray-200 rounded-xl p-2 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(TransactionType.expense)}
        className={`
          flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-md transition-all relative
          ${value === TransactionType.expense 
            ? 'bg-white text-gray-700' 
            : 'bg-transparent hover:bg-gray-50'
          }
        `}
      >
        {value === TransactionType.expense && (
          <div className="absolute inset-0 rounded-md border-2 border-red-500 pointer-events-none" />
        )}
        <DownloadIcon className={`h-5 w-5 ${value === TransactionType.expense ? 'text-red-600' : 'text-gray-400'}`} />
        <span className={`font-medium text-lg ${value === TransactionType.expense ? 'text-gray-700' : 'text-gray-600'}`}>
          Despesa
        </span>
      </button>
      <button
        type="button"
        onClick={() => onChange(TransactionType.income)}
        className={`
          flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-md transition-all relative
          ${value === TransactionType.income 
            ? 'bg-white text-gray-700' 
            : 'bg-transparent hover:bg-gray-50'
          }
        `}
      >
        {value === TransactionType.income && (
          <div className="absolute inset-0 rounded-md border-2 border-green-500 pointer-events-none" />
        )}
        <UploadIcon className={`h-5 w-5 ${value === TransactionType.income ? 'text-green-600' : 'text-gray-400'}`} />
        <span className={`font-medium text-lg ${value === TransactionType.income ? 'text-gray-700' : 'text-gray-600'}`}>
          Receita
        </span>
      </button>
    </div>
  )
}

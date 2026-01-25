import { Input } from "@/components/ui/input"
import { formatAmountInput, removeLastDigit, parseAmountToCents, formatAmountForDisplay } from "@/lib/utils/amount"

interface AmountInputProps {
  value: number // Amount in cents
  onChange: (cents: number) => void
  id?: string
  required?: boolean
  className?: string
  placeholder?: string
}

export function AmountInput({ 
  value, 
  onChange, 
  id = "amount",
  required = false,
  className = "",
  placeholder = "0,00"
}: AmountInputProps) {
  // Convert cents to formatted display string
  const displayValue = value ? formatAmountForDisplay(value) : ""

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatAmountInput(inputValue)
    
    // Parse and convert to cents
    const cents = parseAmountToCents(formatted)
    onChange(cents)
  }

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && displayValue) {
      const target = e.target as HTMLInputElement
      const isAllSelected = target.selectionStart === 0 && target.selectionEnd === target.value.length
      
      if (isAllSelected) {
        // If all text is selected, reset the field
        e.preventDefault()
        onChange(0)
        return
      }
      
      e.preventDefault()
      // Remove last digit and update
      const newFormatted = removeLastDigit(displayValue)
      const cents = parseAmountToCents(newFormatted)
      onChange(cents)
    }
  }

  return (
    <div className="relative">
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-base transition-colors">
        R$
      </span>
      <Input
        id={id}
        type="text"
        value={displayValue}
        onChange={handleAmountChange}
        onKeyDown={handleAmountKeyDown}
        placeholder={placeholder}
        required={required}
        className={`h-12 pl-10 text-base placeholder:text-gray-600 ${className}`}
        inputMode="numeric"
      />
    </div>
  )
}

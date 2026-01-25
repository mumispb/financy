import { useRef, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"

interface DateInputProps {
  value: string // ISO date string (YYYY-MM-DD)
  onChange: (isoDate: string) => void
  id?: string
  required?: boolean
  className?: string
}

export function DateInput({ 
  value, 
  onChange, 
  id = "date",
  required = false,
  className = ""
}: DateInputProps) {
  const datePickerRef = useRef<HTMLInputElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)
  const [displayValue, setDisplayValue] = useState("")

  // Format date for display using browser's locale
  useEffect(() => {
    if (value) {
      const date = new Date(value + 'T12:00:00')
      // Use browser's locale to format the date
      const formatted = date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
      setDisplayValue(formatted)
    } else {
      setDisplayValue("")
    }
  }, [value])

  const handleTextInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // If clicking (not focusing from tab), open calendar
    const target = e.target as HTMLInputElement
    if (document.activeElement !== target) {
      e.preventDefault()
      if (datePickerRef.current) {
        if (typeof datePickerRef.current.showPicker === 'function') {
          datePickerRef.current.showPicker()
        } else {
          datePickerRef.current.click()
        }
      }
    }
  }

  return (
    <div className="relative">
      <Input
        ref={textInputRef}
        id={id}
        type="text"
        value={displayValue}
        readOnly
        onClick={handleTextInputClick}
        onFocus={(e) => {
          e.target.blur() // Prevent keyboard from showing
          if (datePickerRef.current) {
            if (typeof datePickerRef.current.showPicker === 'function') {
              datePickerRef.current.showPicker()
            } else {
              datePickerRef.current.click()
            }
          }
        }}
        required={required}
        className={`h-12 text-base cursor-pointer ${className}`}
        placeholder="Selecione uma data"
      />
      {/* Hidden date input for calendar picker */}
      <input
        ref={datePickerRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}

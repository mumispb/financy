import * as React from "react"
import { cn } from "@/lib/utils"
import ChevronDownIcon from "@/assets/icons/chevron-down.svg?react"

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, value, children, ...props }, ref) => {
    const isEmpty = value === "" || value === undefined || value === null
    return (
      <div className="relative">
        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <select
          className={cn(
            "h-10 w-full rounded-md border border-input bg-background px-3 pr-10 py-2 text-sm ring-offset-background placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
            isEmpty ? "text-gray-600" : "text-foreground",
            className
          )}
          value={value}
          ref={ref}
          {...props}
        >
          {children}
        </select>
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }

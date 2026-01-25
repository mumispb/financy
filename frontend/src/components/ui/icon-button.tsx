import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  variant?: "default" | "destructive" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  iconClassName?: string
  asChild?: boolean
}

const variantStyles = {
  default: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 hover:text-gray-700",
  destructive: "bg-white border border-gray-300 hover:border-red-600 text-red-600 hover:text-red-700",
  outline: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 hover:text-gray-700",
  ghost: "hover:bg-gray-50 text-gray-600 hover:text-gray-700",
}

const sizeStyles = {
  sm: "h-8 w-8 p-2",
  md: "h-9 w-9 p-2",
  lg: "h-10 w-10 p-2.5",
}

const iconSizeStyles = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    icon: Icon, 
    variant = "default", 
    size = "md", 
    className,
    iconClassName,
    asChild = false,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(
          "rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <Icon className={cn(iconSizeStyles[size], iconClassName)} />
      </Comp>
    )
  }
)
IconButton.displayName = "IconButton"

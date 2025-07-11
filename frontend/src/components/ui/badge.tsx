import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Define badge variants for different styles
const badgeVariants = cva(
  // Base styles for all badges
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-purple-600 text-purple-50 shadow hover:bg-purple-600/80",
        secondary:
          "border-transparent bg-purple-100 text-purple-900 hover:bg-purple-100/80",
        destructive:
          "border-transparent bg-red-500 text-white shadow hover:bg-red-500/80",
        outline: "text-foreground border-purple-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Define the props for the Badge component
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

// Create the Badge component
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

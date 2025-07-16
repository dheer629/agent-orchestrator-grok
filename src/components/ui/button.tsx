import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-medium hover:bg-primary/90 hover-lift-gentle active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-medium hover:bg-destructive/90 hover-lift-gentle active:scale-95",
        outline:
          "border border-input bg-background shadow-subtle hover:bg-accent hover:text-accent-foreground hover-lift-gentle active:scale-95",
        secondary:
          "bg-secondary text-secondary-foreground shadow-subtle hover:bg-secondary/80 hover-lift-gentle active:scale-95",
        ghost: "hover:bg-accent hover:text-accent-foreground hover-lift-gentle active:scale-95",
        link: "text-primary underline-offset-4 hover:underline transition-quick",
        premium: "bg-gradient-primary text-white shadow-large hover:shadow-premium hover-lift-strong font-semibold border border-primary/20",
        glass: "glass-panel hover:bg-accent/10 hover-lift-gentle border-border/50 active:scale-95",
        neon: "bg-primary text-primary-foreground shadow-glow hover:shadow-premium hover-glow-primary hover-lift-strong font-semibold border border-primary/20",
        elegant: "surface-interactive text-foreground font-medium hover:text-primary",
        minimal: "text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-quick",
        accent: "bg-accent text-accent-foreground shadow-medium hover:bg-accent/90 hover-lift-gentle active:scale-95",
        success: "bg-success text-success-foreground shadow-medium hover:bg-success/90 hover-lift-gentle active:scale-95",
        warning: "bg-warning text-warning-foreground shadow-medium hover:bg-warning/90 hover-lift-gentle active:scale-95"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base font-semibold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

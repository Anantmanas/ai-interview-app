import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const retroButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-bold tracking-widest uppercase transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 relative group cursor-pointer",
  {
    variants: {
      variant: {
        default: "text-background",
        primary: "text-background",
        secondary: "text-foreground",
        destructive: "text-background",
        outline: "text-foreground",
        ghost: "text-foreground",
      },
      size: {
        default: "px-6 py-3",
        sm: "px-4 py-2 text-xs",
        lg: "px-8 py-4 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const layerColors = {
  default: { bottom: "bg-retro-green", middle: "bg-retro-green/80", top: "bg-foreground text-background" },
  primary: { bottom: "bg-retro-cyan", middle: "bg-retro-cyan/80", top: "bg-foreground text-background" },
  secondary: { bottom: "bg-foreground", middle: "bg-foreground/80", top: "bg-retro-yellow text-foreground" },
  destructive: { bottom: "bg-foreground", middle: "bg-foreground/80", top: "bg-retro-red text-background" },
  outline: { bottom: "bg-foreground", middle: "bg-foreground/80", top: "bg-background text-foreground" },
  ghost: { bottom: "bg-transparent", middle: "bg-transparent", top: "bg-transparent border-transparent" }
}

export interface RetroButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof retroButtonVariants> {
  asChild?: boolean
}

const RetroButton = React.forwardRef<HTMLButtonElement, RetroButtonProps>(
  ({ className, variant = "default", size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const colors = layerColors[variant as keyof typeof layerColors] || layerColors.default

    if (variant === "ghost") {
      return (
        <Comp
          className={cn(retroButtonVariants({ variant, size, className }), "hover:bg-accent hover:text-accent-foreground")}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    return (
      <Comp
        className={cn(retroButtonVariants({ variant, size, className }), "bg-transparent border-0 p-0 block w-max outline-none group")}
        ref={ref}
        {...props}
      >
        <div className="retro-btn__wrapper relative mr-2 mb-2 w-full h-full">
          <span className={cn("retro-btn__layer absolute inset-0 border-2 border-black transform-gpu transition-transform duration-300 ease-out group-hover:translate-x-2 group-hover:translate-y-2 group-active:translate-x-0 group-active:translate-y-0", colors.bottom)} />
          <span className={cn("retro-btn__layer absolute inset-0 border-2 border-black transform-gpu transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:translate-y-1 group-active:translate-x-0 group-active:translate-y-0", colors.middle)} />
          <span className={cn("retro-btn__layer relative flex items-center justify-center gap-2 border-2 border-black transform-gpu transition-transform duration-300 group-active:translate-x-0 group-active:translate-y-0", colors.top, size === 'icon' ? 'h-10 w-10' : (size === 'sm' ? 'px-4 py-2' : size === 'lg' ? 'px-8 py-4' : 'px-6 py-3'))}>
            {children}
          </span>
        </div>
      </Comp>
    )
  }
)
RetroButton.displayName = "RetroButton"

export { RetroButton, retroButtonVariants }

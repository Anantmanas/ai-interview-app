import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-[0.02em] rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#000000] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#4f46e5] text-white border border-[#6366f1]/40 shadow-[0_0_20px_rgba(79,70,229,0.35)] hover:bg-[#5865f2] hover:shadow-[0_0_28px_rgba(79,70,229,0.5)] active:bg-[#3730a3]",
        destructive:
          "bg-[#2a1215] text-[#f87171] border border-[#4a1a1e] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-[#3a1820] hover:text-[#fca5a5]",
        outline:
          "bg-[#09090e] text-[#f8fafc] border border-[#1e1e2f] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-[#12121c] hover:border-[#2e2e46] hover:text-white",
        secondary:
          "bg-[#0f0f18] text-[#9ca3af] border border-[#1e1e2f] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:bg-[#161624] hover:text-[#f8fafc] hover:border-[#3730a3]/50",
        ghost:
          "bg-transparent text-[#9ca3af] border border-transparent hover:bg-[#14142b]/60 hover:text-white hover:border-[#1e1e2f]",
        link:
          "bg-transparent text-[#818cf8] border-none shadow-none underline-offset-4 hover:underline hover:text-white h-auto p-0",
        violetGlow:
          "bg-[#14142b] text-[#818cf8] border border-[#4f46e5]/40 shadow-[0_0_20px_rgba(79,70,229,0.25)] hover:bg-[#1c1c38] hover:border-[#6366f1] hover:shadow-[0_0_30px_rgba(79,70,229,0.45)] hover:text-white",
      },
      size: {
        default: "h-9 px-4 py-2 text-[12px]",
        sm:      "h-8 px-3 py-1.5 text-[11px]",
        lg:      "h-11 px-7 py-3 text-[13px]",
        icon:    "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

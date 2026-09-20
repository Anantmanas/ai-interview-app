import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono uppercase tracking-[0.06em] rounded-[6px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#71d083] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04040b] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#71d083] text-[#04040b] border border-[#366740] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] hover:bg-[#82dba2] hover:scale-[1.02] active:scale-[0.98] active:bg-[#366740]",
        destructive:
          "bg-[#2a1215] text-[#f87171] border border-[#4a1a1e] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-[#3a1820] hover:text-[#fca5a5]",
        outline:
          "bg-[#1a191b] text-[#eeeef0] border border-[#2b292d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:bg-[#232225] hover:border-[#3c393f]",
        secondary:
          "bg-[#121113] text-[#b5b2bc] border border-[#2b292d] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-[#1a191b] hover:text-[#eeeef0]",
        ghost:
          "bg-transparent text-[#7c7a85] border border-transparent hover:bg-[#1a191b] hover:text-[#eeeef0] hover:border-[#2b292d]",
        link:
          "bg-transparent text-[#70b8ff] border-none shadow-none underline-offset-4 hover:underline hover:text-[#eeeef0] h-auto p-0",
        violetGlow:
          "bg-[#1d3a24] text-[#71d083] border border-[#366740] shadow-[0_0_15px_rgba(113,208,131,0.2)] hover:bg-[#254d2f] hover:border-[#71d083] hover:shadow-[0_0_25px_rgba(113,208,131,0.4)]",
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

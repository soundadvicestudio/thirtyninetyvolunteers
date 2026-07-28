import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-brand-primary focus-visible:ring-3 focus-visible:ring-brand-primary/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-brand-accent aria-invalid:ring-3 aria-invalid:ring-brand-accent/20 dark:aria-invalid:border-brand-accent/50 dark:aria-invalid:ring-brand-accent/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-brand-primary text-white hover:bg-brand-primary/80",
        outline:
          "border-divider bg-white hover:bg-brand-primary-light hover:text-dark aria-expanded:bg-brand-primary-light aria-expanded:text-dark dark:border-divider dark:bg-brand-primary-light/30 dark:hover:bg-brand-primary-light/50",
        secondary:
          "bg-brand-primary-mid text-white hover:bg-brand-primary-mid/80 aria-expanded:bg-brand-primary-mid aria-expanded:text-white",
        ghost:
          "hover:bg-brand-primary-light hover:text-dark aria-expanded:bg-brand-primary-light aria-expanded:text-dark dark:hover:bg-brand-primary-light/50",
        destructive:
          "bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 focus-visible:border-brand-accent/40 focus-visible:ring-brand-accent/20 dark:bg-brand-accent/20 dark:hover:bg-brand-accent/30 dark:focus-visible:ring-brand-accent/40",
        link: "text-brand-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
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
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

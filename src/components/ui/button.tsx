import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium tracking-[-0.01em] whitespace-nowrap outline-none select-none transition-[transform,scale,background-color,color] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-60 aria-invalid:bg-[var(--red-3)] aria-invalid:text-[var(--red-11)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary-bg)] text-[var(--primary-fg)] hover:bg-[var(--primary-hover)]",
        outline:
          "bg-ink-3 text-ink-12 hover:bg-ink-4 aria-expanded:bg-ink-4",
        secondary:
          "bg-ink-3 text-ink-12 hover:bg-ink-4 aria-expanded:bg-ink-4",
        ghost:
          "text-ink-11 hover:bg-ink-3 hover:text-ink-12 aria-expanded:bg-ink-3 aria-expanded:text-ink-12",
        destructive: "bg-[var(--red-9)] text-white hover:bg-[var(--red-10)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3.5 active:scale-[0.97] max-md:h-11 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs active:scale-[0.97] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),12px)] px-3 text-[0.8rem] active:scale-[0.97] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-1.5 px-3.5 active:scale-[0.97] max-md:h-11 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8 active:scale-[0.94]",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] active:scale-[0.92] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] active:scale-[0.92] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9 active:scale-[0.94]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

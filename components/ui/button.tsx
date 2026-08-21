import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:shadow-emerald-500/30",
        profit:
          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50",
        loss:
          "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50",
        destructive:
          "bg-rose-600 text-white shadow-md shadow-rose-600/20 hover:bg-rose-500",
        outline:
          "border border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 hover:text-white hover:border-slate-700",
        secondary:
          "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white",
        ghost:
          "text-slate-300 hover:bg-slate-800/60 hover:text-white",
        link: "text-emerald-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

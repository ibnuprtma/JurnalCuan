import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-800 text-slate-200 hover:bg-slate-700",
        profit:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium",
        loss:
          "border-rose-500/30 bg-rose-500/10 text-rose-400 font-medium",
        be:
          "border-slate-700 bg-slate-800/80 text-slate-300 font-medium",
        buy:
          "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-bold",
        sell:
          "border-rose-500/40 bg-rose-500/20 text-rose-300 font-bold",
        secondary:
          "border-transparent bg-slate-800/80 text-slate-300",
        outline:
          "border-slate-700 text-slate-300",
        amber:
          "border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium",
        blue:
          "border-blue-500/30 bg-blue-500/10 text-blue-400 font-medium",
        purple:
          "border-purple-500/30 bg-purple-500/10 text-purple-400 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

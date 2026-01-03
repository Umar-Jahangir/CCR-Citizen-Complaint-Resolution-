import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        "priority-high": "border border-priority-high/30 bg-priority-high/10 text-priority-high",
        "priority-medium": "border border-priority-medium/30 bg-priority-medium/10 text-priority-medium",
        "priority-low": "border border-priority-low/30 bg-priority-low/10 text-priority-low",
        "status-pending": "border-transparent bg-status-pending/10 text-status-pending",
        "status-progress": "border-transparent bg-status-progress/10 text-status-progress",
        "status-resolved": "border-transparent bg-status-resolved/10 text-status-resolved",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

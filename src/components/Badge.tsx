// Tremor Badge [v0.0.1]

import React from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { cx } from "@/lib/utils";

const badgeVariants = tv({
  base: cx(
    "inline-flex items-center gap-x-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
  ),
  variants: {
    variant: {
      default: [
        "bg-blue-50 text-blue-900 ring-blue-500/30",
        "dark:bg-purple-700/40 dark:text-purple-200 dark:ring-purple-400/40",
      ],
      neutral: [
        "bg-gray-50 text-gray-900 ring-gray-500/30",
        "dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20",
      ],
      success: [
        "bg-emerald-50 text-emerald-900 ring-emerald-600/30",
        "dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20",
      ],
      error: [
        "bg-red-50 text-red-900 ring-red-600/20",
        "dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20",
      ],
      warning: [
        "bg-yellow-50 text-yellow-900 ring-yellow-600/30",
        "dark:bg-yellow-400/10 dark:text-yellow-500 dark:ring-yellow-400/20",
      ],
      purple: [
        "bg-purple-200 text-purple-900 ring-purple-400/40",
        "dark:bg-purple-700/40 dark:text-purple-200 dark:ring-purple-400/40",
      ],
      "purple-light": [
        "bg-purple-100 text-purple-800 ring-purple-300/40",
        "dark:bg-purple-800/40 dark:text-purple-200 dark:ring-purple-300/40",
      ],
      "purple-dark": [
        "bg-purple-900 text-purple-100 ring-purple-900/60",
        "dark:bg-purple-950 dark:text-purple-200 dark:ring-purple-900/80",
      ],
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface BadgeProps
  extends React.ComponentPropsWithoutRef<"span">,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }: BadgeProps, forwardedRef) => {
    return (
      <span
        ref={forwardedRef}
        className={cx(badgeVariants({ variant }), className)}
        tremor-id="tremor-raw"
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants, type BadgeProps };

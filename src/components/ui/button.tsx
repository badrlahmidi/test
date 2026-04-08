"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400",
  ghost: "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.memo(
  React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
      {
        className,
        variant = "primary",
        size = "md",
        isLoading = false,
        leftIcon,
        rightIcon,
        disabled,
        children,
        ...props
      },
      ref,
    ) => {
      return (
        <button
          ref={ref}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            variants[variant],
            sizes[size],
            className,
          )}
          disabled={disabled || isLoading}
          aria-busy={isLoading || undefined}
          aria-disabled={disabled || isLoading || undefined}
          {...props}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            leftIcon
          )}
          {children}
          {!isLoading && rightIcon}
        </button>
      );
    },
  ),
);

Button.displayName = "Button";

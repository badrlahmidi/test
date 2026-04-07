"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helpText?: string;
  error?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helpText, error, leftAddon, rightAddon, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const helpId = `${inputId}-help`;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <div className="relative flex items-center">
          {leftAddon && (
            <span className="pointer-events-none absolute left-3 text-gray-400">
              {leftAddon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300",
              leftAddon && "pl-10",
              rightAddon && "pr-10",
              className,
            )}
            aria-invalid={!!error || undefined}
            aria-describedby={
              [error ? errorId : null, helpText ? helpId : null]
                .filter(Boolean)
                .join(" ") || undefined
            }
            {...props}
          />
          {rightAddon && (
            <span className="pointer-events-none absolute right-3 text-gray-400">
              {rightAddon}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helpText && !error && (
          <p id={helpId} className="mt-1 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

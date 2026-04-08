"use client";

import { useToastStore, type ToastVariant } from "@/stores/toast-store";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

const bgColors: Record<ToastVariant, string> = {
  success: "border-green-200 bg-green-50",
  error: "border-red-200 bg-red-50",
  warning: "border-yellow-200 bg-yellow-50",
  info: "border-blue-200 bg-blue-50",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
      aria-live="polite"
      role="status"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex w-80 items-start gap-3 rounded-lg border p-4 shadow-lg transition-all",
            bgColors[toast.variant],
          )}
        >
          <span aria-hidden="true">{icons[toast.variant]}</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{toast.title}</p>
            {toast.description && (
              <p className="mt-1 text-sm text-gray-600">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="rounded p-0.5 text-gray-400 hover:text-gray-600"
            aria-label="Fermer la notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

"use client";
import type { Toast as ToastType } from "@/hooks/useToast";

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

const typeClasses = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-indigo-600",
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white text-sm shadow-lg ${typeClasses[t.type]} animate-in fade-in slide-in-from-bottom-2`}
        >
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="opacity-80 hover:opacity-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

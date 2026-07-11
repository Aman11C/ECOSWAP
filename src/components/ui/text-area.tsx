import { forwardRef } from "react"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, id, className = "", ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-earth-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        className={`w-full rounded-xl border border-earth-200 bg-white px-4 py-3 text-sm text-earth-900 placeholder-earth-400 shadow-sm transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-earth-50 disabled:text-earth-500 ${className}`}
        {...props}
      />
    </div>
  )
})
Textarea.displayName = "Textarea"

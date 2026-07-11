import { forwardRef } from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

function InputInner(props: InputProps, ref: React.Ref<HTMLInputElement>) {
  const { label, id, error, icon, className = "", ...rest } = props
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-earth-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-earth-400">
            {icon}
          </div>
        )}
        <input
          id={id}
          ref={ref}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-earth-900 placeholder-earth-400 shadow-sm transition-colors focus:outline-none focus:ring-2 ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-earth-200 focus:border-brand-400 focus:ring-brand-100"
          } disabled:cursor-not-allowed disabled:bg-earth-50 disabled:text-earth-500 ${icon ? "pl-10" : ""} ${className}`}
          {...rest}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export const Input = forwardRef(InputInner)
Input.displayName = "Input"

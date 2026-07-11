import { forwardRef } from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

const variantStyles = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-300 shadow-sm",
  secondary: "bg-white text-earth-700 border border-earth-200 hover:bg-earth-50 focus:ring-earth-200 shadow-sm",
  ghost: "bg-transparent text-earth-600 hover:bg-earth-100 hover:text-earth-800 focus:ring-earth-200",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300 shadow-sm",
  outline: "bg-transparent text-earth-700 border-2 border-earth-300 hover:bg-earth-50 focus:ring-earth-200",
}

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2",
}

function ButtonInner(props: ButtonProps, ref: React.Ref<HTMLButtonElement>) {
  const { variant = "primary", size = "md", loading = false, disabled, children, className = "", ...rest } = props
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}

export const Button = forwardRef(ButtonInner)
Button.displayName = "Button"

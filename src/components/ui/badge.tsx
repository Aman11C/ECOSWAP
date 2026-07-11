interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "danger" | "info"
  size?: "sm" | "md"
  className?: string
}

const variants = {
  default: "bg-earth-100 text-earth-700",
  success: "bg-brand-100 text-brand-800",
  warning: "bg-accent-100 text-accent-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
}

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
}

export function Badge({ children, variant = "default", size = "sm", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  )
}

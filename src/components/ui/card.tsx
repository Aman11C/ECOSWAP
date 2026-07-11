interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className = "", hover = false, onClick }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-earth-200 bg-white shadow-sm ${
        hover ? "transition-all hover:-translate-y-0.5 hover:shadow-md" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick() } : undefined}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border-b border-earth-100 px-5 py-4 ${className}`}>{children}</div>
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
}

export function CardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border-t border-earth-100 px-5 py-3 ${className}`}>{children}</div>
}

import Image from "next/image"

interface AvatarProps {
  src?: string | null
  alt?: string
  size?: "sm" | "md" | "lg"
  fallback?: string
  className?: string
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
}

export function Avatar({ src, alt = "", size = "md", fallback, className = "" }: AvatarProps) {
  if (src) {
    return (
      <div className={`relative overflow-hidden rounded-full ${sizes[size]} ${className}`}>
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
    )
  }

  const initials = fallback?.slice(0, 2).toUpperCase() ?? "?"

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 ${sizes[size]} ${className}`}
      aria-label={alt || fallback}
    >
      {initials}
    </div>
  )
}

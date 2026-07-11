"use client"

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
}

const sizes = { sm: "text-sm", md: "text-lg", lg: "text-2xl" }

export function StarRating({ value, onChange, readonly = false, size = "md" }: StarRatingProps) {
  return (
    <div className={`flex gap-0.5 ${sizes[size]}`} role={readonly ? "img" : "radiogroup"} aria-label={`Rating: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            className={`transition-colors ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            } ${filled ? "text-accent-400" : "text-earth-200"}`}
            role={readonly ? undefined : "radio"}
            aria-checked={readonly ? undefined : filled}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            {filled ? "★" : "☆"}
          </button>
        )
      })}
    </div>
  )
}

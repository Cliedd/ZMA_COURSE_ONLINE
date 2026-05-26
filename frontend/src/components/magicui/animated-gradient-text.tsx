import { type ComponentPropsWithoutRef } from "react"
import { cn } from "../../lib/utils"

export interface AnimatedGradientTextProps extends ComponentPropsWithoutRef<"span"> {
  speed?: number
  colorFrom?: string
  colorTo?: string
}

export function AnimatedGradientText({
  children,
  className,
  speed = 1,
  colorFrom = "#c8a84b",
  colorTo = "#1a3a6e",
  ...props
}: AnimatedGradientTextProps) {
  return (
    <span
      style={{
        "--bg-size": `${speed * 300}%`,
        "--color-from": colorFrom,
        "--color-to": colorTo,
        backgroundSize: "var(--bg-size) 100%",
        backgroundImage: `linear-gradient(90deg, var(--color-from), var(--color-to), var(--color-from))`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        animation: "gradient-shift 4s linear infinite",
      } as React.CSSProperties}
      className={cn("inline-block", className)}
      {...props}
    >
      {children}
    </span>
  )
}

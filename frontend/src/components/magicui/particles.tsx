import React, { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react"
import { cn } from "../../lib/utils"

function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", h)
    return () => window.removeEventListener("mousemove", h)
  }, [])
  return pos
}

function hexToRgb(hex: string) {
  hex = hex.replace("#", "")
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("")
  const n = parseInt(hex, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

type Circle = {
  x: number; y: number; translateX: number; translateY: number
  size: number; alpha: number; targetAlpha: number
  dx: number; dy: number; magnetism: number
}

interface ParticlesProps extends ComponentPropsWithoutRef<"div"> {
  quantity?: number; staticity?: number; ease?: number
  size?: number; refresh?: boolean; color?: string; vx?: number; vy?: number
}

export const Particles: React.FC<ParticlesProps> = ({
  className = "", quantity = 80, staticity = 50, ease = 50, size = 0.4,
  refresh = false, color = "#ffffff", vx = 0, vy = 0, ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const ctx = useRef<CanvasRenderingContext2D | null>(null)
  const circles = useRef<Circle[]>([])
  const mouse = useRef({ x: 0, y: 0 })
  const canvasSize = useRef({ w: 0, h: 0 })
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1
  const rafID = useRef<number | null>(null)
  const mousePos = useMousePosition()
  const rgb = hexToRgb(color)

  const circleParams = (): Circle => ({
    x: Math.random() * canvasSize.current.w,
    y: Math.random() * canvasSize.current.h,
    translateX: 0, translateY: 0,
    size: Math.random() * 2 + size,
    alpha: 0, targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
    dx: (Math.random() - 0.5) * 0.1, dy: (Math.random() - 0.5) * 0.1,
    magnetism: 0.1 + Math.random() * 4,
  })

  const draw = (c: Circle, update = false) => {
    if (!ctx.current) return
    ctx.current.translate(c.translateX, c.translateY)
    ctx.current.beginPath()
    ctx.current.arc(c.x, c.y, c.size, 0, 2 * Math.PI)
    ctx.current.fillStyle = `rgba(${rgb.join(",")},${c.alpha})`
    ctx.current.fill()
    ctx.current.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (!update) circles.current.push(c)
  }

  const init = () => {
    if (!containerRef.current || !canvasRef.current || !ctx.current) return
    canvasSize.current = { w: containerRef.current.offsetWidth, h: containerRef.current.offsetHeight }
    canvasRef.current.width = canvasSize.current.w * dpr
    canvasRef.current.height = canvasSize.current.h * dpr
    canvasRef.current.style.width = `${canvasSize.current.w}px`
    canvasRef.current.style.height = `${canvasSize.current.h}px`
    ctx.current.scale(dpr, dpr)
    circles.current = []
    for (let i = 0; i < quantity; i++) draw(circleParams())
  }

  const animate = () => {
    if (!ctx.current) return
    ctx.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h)
    circles.current.forEach((c, i) => {
      const edge = [c.x + c.translateX - c.size, canvasSize.current.w - c.x - c.translateX - c.size,
                    c.y + c.translateY - c.size, canvasSize.current.h - c.y - c.translateY - c.size]
      const closest = edge.reduce((a, b) => Math.min(a, b))
      const remap = Math.max(0, parseFloat((closest / 20).toFixed(2)))
      c.alpha = remap > 1 ? Math.min(c.alpha + 0.02, c.targetAlpha) : c.targetAlpha * remap
      c.x += c.dx + vx; c.y += c.dy + vy
      c.translateX += (mouse.current.x / (staticity / c.magnetism) - c.translateX) / ease
      c.translateY += (mouse.current.y / (staticity / c.magnetism) - c.translateY) / ease
      draw(c, true)
      if (c.x < -c.size || c.x > canvasSize.current.w + c.size || c.y < -c.size || c.y > canvasSize.current.h + c.size) {
        circles.current.splice(i, 1); draw(circleParams())
      }
    })
    rafID.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    ctx.current = canvasRef.current?.getContext("2d") ?? null
    init(); animate()
    const onResize = () => { setTimeout(init, 200) }
    window.addEventListener("resize", onResize)
    return () => { if (rafID.current) cancelAnimationFrame(rafID.current); window.removeEventListener("resize", onResize) }
  }, [color, refresh])

  useEffect(() => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const { w, h } = canvasSize.current
    const x = mousePos.x - rect.left - w / 2
    const y = mousePos.y - rect.top - h / 2
    if (x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2) {
      mouse.current = { x, y }
    }
  }, [mousePos])

  return (
    <div className={cn("pointer-events-none", className)} ref={containerRef} aria-hidden {...props}>
      <canvas ref={canvasRef} className="size-full" />
    </div>
  )
}

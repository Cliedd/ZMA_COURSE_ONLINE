import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName

type SheetSide = "bottom" | "left" | "right"

const SIDE_CLASSES: Record<SheetSide, string> = {
  bottom:
    "inset-x-0 bottom-0 rounded-t-3xl border-t max-h-[85svh] data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
  left: "inset-y-0 left-0 h-full w-[86%] max-w-sm border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
  right:
    "inset-y-0 right-0 h-full w-[86%] max-w-sm border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
}

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: SheetSide
  showClose?: boolean
}

const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  ({ side = "bottom", showClose = true, className, children, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-[401] bg-background shadow-2xl border-border",
          "data-[state=open]:animate-in data-[state=closed]:animate-out duration-300",
          SIDE_CLASSES[side],
          className
        )}
        {...props}
      >
        {side === "bottom" && (
          <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-muted-foreground/25" aria-hidden="true" />
        )}
        {children}
        {showClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </SheetPortal>
  )
)
SheetContent.displayName = DialogPrimitive.Content.displayName

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-5 pb-1 pt-4", className)} {...props} />
)

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-base font-bold", className)} {...props} />
))
SheetTitle.displayName = DialogPrimitive.Title.displayName

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle }

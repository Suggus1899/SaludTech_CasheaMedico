import * as React from "react"

import { cn } from "./lib/utils"

function FormControl({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-control"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="form-label"
      className={cn(
        "text-sm font-medium leading-none select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function FormHelperText({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="form-helper-text"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export { FormControl, FormLabel, FormHelperText }

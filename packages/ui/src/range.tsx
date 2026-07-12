import * as React from "react"

import { cn } from "./lib/utils"

function Range({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type="range"
      data-slot="range"
      className={cn(
        "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Range }

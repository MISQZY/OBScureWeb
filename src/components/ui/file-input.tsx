'use client';

import * as React from "react"
import { cn } from "cn"
import { buttonVariants } from "@/components/ui/button"

/**
 * The native `<input type="file">` control's own intrinsic sizing (the
 * "Choose file" button + filename text) doesn't reliably respect CSS height
 * across browsers, which is what made this blow up into an oversized box
 * next to every other (properly h-8) field. Styling a real file input to
 * look consistent is a known losing battle, so instead the input itself is
 * visually hidden (`sr-only` — clipped, not `display:none`, so it stays
 * clickable via the associated `<label>` and still participates in native
 * `required` validation) and a button-styled `<label for>` drives it.
 */
function FileInput({
  id,
  chooseLabel,
  placeholder,
  onFileChange,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type" | "onChange"> & {
  chooseLabel: string
  placeholder: string
  onFileChange?: (file: File | null) => void
}) {
  const [fileName, setFileName] = React.useState<string | null>(null)

  return (
    <div className={cn("flex flex-wrap items-start gap-2", className)}>
      <label
        htmlFor={id}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "cursor-pointer shrink-0")}
      >
        {chooseLabel}
      </label>
      {/* flex-1 (basis 0%) always fits the button's line, so this wraps within the remaining width instead of overflowing or truncating mid-sentence. */}
      <span className="min-w-0 flex-1 py-1 text-sm text-muted-foreground">{fileName ?? placeholder}</span>
      <input
        id={id}
        type="file"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null
          setFileName(file?.name ?? null)
          onFileChange?.(file)
        }}
        {...props}
      />
    </div>
  )
}

export { FileInput }

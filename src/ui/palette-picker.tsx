import { useEffect, useRef, useState } from 'react'

interface Props {
  color: string
  palette: string[]
  onSelect: (c: string) => void
}

/** Swatch button that opens a popover listing the shared palette to pick from. */
export function PalettePicker({ color, palette, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const rows = [palette.slice(0, 3), palette.slice(3, 6)]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        title={color}
        onClick={() => setOpen((v) => !v)}
        className="h-7 w-7 rounded border border-white/20 shadow-inner"
        style={{ background: color }}
      />
      {open && (
        <div className="absolute right-0 z-30 mt-2 space-y-2 rounded-lg bg-panelraised p-3 shadow-xl ring-1 ring-black/40">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {row.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  title={c}
                  onClick={() => {
                    onSelect(c)
                    setOpen(false)
                  }}
                  style={{ background: c }}
                  className={`h-10 w-10 rounded border shadow-inner transition ${
                    c.toLowerCase() === color.toLowerCase()
                      ? 'border-accent ring-2 ring-accent'
                      : 'border-white/30 hover:border-white/60'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

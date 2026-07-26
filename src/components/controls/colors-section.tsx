import { useBuildStore } from '../../store/use-build-store'
import { ColorPicker } from '../../ui/color-picker'

/** Six shared palette swatches; part color pickers below choose from these. */
export function ColorsSection() {
  const palette = useBuildStore((s) => s.palette)
  const setPaletteColor = useBuildStore((s) => s.setPaletteColor)

  return (
    <div className="flex justify-around rounded-lg border border-white/5 bg-black/20 p-3">
      {palette.map((color, i) => (
        <ColorPicker
          key={i}
          color={color}
          title={`Palette color ${i + 1}`}
          onChange={(c) => setPaletteColor(i, c)}
          align="left"
        />
      ))}
    </div>
  )
}

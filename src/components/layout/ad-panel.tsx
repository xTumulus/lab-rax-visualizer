import { CollapsibleSection } from '../../ui/collapsible-section'
import { usePersistedBoolean } from '../../ui/use-persisted-state'

/**
 * Unobtrusive support panel. Placeholder links for now — swap the hrefs for
 * your real Patreon / Buy Me a Coffee, and add affiliate / parts-store links
 * later without touching the layout.
 */
const LINKS = [
  { label: '☕ Buy me a coffee', href: 'https://www.buymeacoffee.com/', color: '#ffdd00' },
  { label: '♥ Patreon', href: 'https://www.patreon.com/', color: '#ff6b6b' },
]

interface Props {
  /** 'overlay' floats over the canvas (desktop); 'inline' sits at the bottom
   * of the controls panel (mobile sheet). */
  variant?: 'overlay' | 'inline'
}

export function AdPanel({ variant = 'overlay' }: Props) {
  const [collapsed, setCollapsed] = usePersistedBoolean('labrax.ui.supportCollapsed', false)

  const width =
    variant === 'overlay' ? (collapsed ? 'w-fit' : 'w-[clamp(180px,18vw,260px)]') : 'w-full'
  const chrome =
    variant === 'overlay'
      ? 'border border-white/10 bg-black/50 backdrop-blur-sm'
      : 'border border-white/10 bg-black/30'

  return (
    <div className={`${width} rounded-lg ${chrome} p-3`}>
      <CollapsibleSection
        title="Support this tool"
        collapsible
        open={!collapsed}
        onOpenChange={(open) => setCollapsed(!open)}
      >
        <div className="flex flex-col gap-1.5">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-white/5 px-3 py-1.5 text-center text-xs font-medium text-white/80 transition hover:bg-white/10"
              style={{ borderLeft: `3px solid ${l.color}` }}
            >
              {l.label}
            </a>
          ))}
        </div>
        <p className="mt-2 text-[10px] leading-snug text-white/30">
          Lab Rax planner is a fan-made visualizer. Parts &amp; design credit:
          the-diy-life.com.
        </p>
      </CollapsibleSection>
    </div>
  )
}

import { CollapsibleSection } from '../../ui/collapsible-section'
import { usePersistedBoolean } from '../../ui/use-persisted-state'

/**
 * Unobtrusive support panel. The link comes from VITE_SUPPORT_BMC_URL
 * (see .env.example) so a personal support link never lands in the public
 * repo — anyone building without that var set just gets no panel.
 */
const BMC_URL = import.meta.env.VITE_SUPPORT_BMC_URL as string | undefined
const LINKS = BMC_URL ? [{ label: '☕ Buy me a coffee', href: BMC_URL, color: '#ffdd00' }] : []

interface Props {
  /** 'overlay' floats over the canvas (desktop); 'inline' sits at the bottom
   * of the controls panel (mobile sheet). */
  variant?: 'overlay' | 'inline'
}

export function SupportPanel({ variant = 'overlay' }: Props) {
  const [collapsed, setCollapsed] = usePersistedBoolean('labrax.ui.supportCollapsed', false)

  if (LINKS.length === 0) return null

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

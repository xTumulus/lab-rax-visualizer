/**
 * Unobtrusive support panel. Placeholder links for now — swap the hrefs for
 * your real Patreon / Buy Me a Coffee, and add affiliate / parts-store links
 * later without touching the layout.
 */
const LINKS = [
  { label: '☕ Buy me a coffee', href: 'https://www.buymeacoffee.com/', color: '#ffdd00' },
  { label: '♥ Patreon', href: 'https://www.patreon.com/', color: '#ff6b6b' },
]

export function AdPanel() {
  return (
    <div className="w-56 rounded-lg border border-white/10 bg-black/50 p-3 backdrop-blur-sm">
      <p className="mb-2 text-[10px] uppercase tracking-wide text-white/35">
        Support this tool
      </p>
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
    </div>
  )
}

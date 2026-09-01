import { useState } from 'react'
import { useBuildStore } from '../../store/use-build-store'
import { totalPartCount } from '../../domain/parts-list'
import { exportCsv } from '../../export/export-csv'
import { exportXlsx } from '../../export/export-xlsx'
import { buildShareUrl } from '../../share/url-state'
import type { BuildState } from '../../domain/types'

function currentBuild(): BuildState {
  const s = useBuildStore.getState()
  return { rackU: s.rackU, parts: s.parts, toggles: s.toggles, shelves: s.shelves, palette: s.palette }
}

export function Header() {
  const rackU = useBuildStore((s) => s.rackU)
  // subscribe to the pieces that affect the count so it stays live
  const parts = useBuildStore((s) => s.parts)
  const toggles = useBuildStore((s) => s.toggles)
  const shelves = useBuildStore((s) => s.shelves)
  const palette = useBuildStore((s) => s.palette)
  const [shared, setShared] = useState(false)

  const count = totalPartCount({ rackU, parts, toggles, shelves, palette })

  const onShare = async () => {
    const url = buildShareUrl(currentBuild())
    try {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 1800)
    } catch {
      // clipboard blocked — fall back to a prompt
      window.prompt('Copy your shareable build link:', url)
    }
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-panel px-4 py-2.5">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-accent/20 text-accent">
          {/* simple logo mark */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <line x1="4" y1="9" x2="20" y2="9" />
            <line x1="4" y1="15" x2="20" y2="15" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold leading-tight">Lab Rax Planner</h1>
          <p className="truncate text-[11px] leading-tight text-white/45">
            Visualize your 3D-printed 10" rack
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-4 text-xs text-white/50 sm:flex">
        <span>
          Size <span className="font-semibold text-white/80">{rackU}U</span>
        </span>
        <span>
          Parts <span className="font-semibold text-white/80">{count}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onShare}
          className="rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10"
        >
          {shared ? '✓ Link copied' : 'Share'}
        </button>
        <button
          onClick={() => exportCsv(currentBuild())}
          className="rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10"
        >
          CSV
        </button>
        <button
          onClick={() => exportXlsx(currentBuild())}
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-black hover:brightness-110"
        >
          Export XLSX
        </button>
      </div>
    </header>
  )
}

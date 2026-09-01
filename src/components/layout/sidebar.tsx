import { ControlsPanel } from './controls-panel'

export function Sidebar() {
  return (
    <aside className="hidden min-w-0 flex-col overflow-hidden border-r border-white/10 bg-panel md:flex">
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-3">
        <ControlsPanel />
      </div>
    </aside>
  )
}

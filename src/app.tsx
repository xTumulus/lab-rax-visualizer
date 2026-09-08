import { SupportPanel } from './components/layout/support-panel'
import { ControlsSheet } from './components/layout/controls-sheet'
import { Header } from './components/layout/header'
import { Sidebar } from './components/layout/sidebar'
import { ViewportHint } from './components/layout/viewport-hint'
import { Scene } from './components/viewer/scene'

export default function App() {
  // min max used for responsive sizing
  return (
    <div className="grid h-full grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-[#0f1218]">
      <Header />
      <div className="grid min-h-0 min-w-0 grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden md:grid-cols-[minmax(0,288px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <Sidebar />
        <main className="relative min-h-0 min-w-0 overflow-hidden">
          <Scene />
          <ViewportHint className="absolute bottom-[88px] right-3 max-w-[70vw] text-right md:bottom-3" />
          <div className="absolute bottom-3 left-3 hidden md:block">
            <SupportPanel />
          </div>
          <ControlsSheet />
        </main>
      </div>
    </div>
  )
}

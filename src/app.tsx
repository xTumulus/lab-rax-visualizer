import { AdPanel } from './components/layout/ad-panel'
import { Header } from './components/layout/header'
import { Sidebar } from './components/layout/sidebar'
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
          <div className="pointer-events-none absolute bottom-3 left-3 rounded bg-black/40 px-2 py-1 text-[10px] text-white/40">
            drag to orbit · scroll to zoom · right-drag to pan
          </div>
          <div className="absolute bottom-3 right-3">
            <AdPanel />
          </div>
        </main>
      </div>
    </div>
  )
}

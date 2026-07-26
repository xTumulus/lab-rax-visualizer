import { AdPanel } from './components/layout/ad-panel'
import { Header } from './components/layout/header'
import { Sidebar } from './components/layout/sidebar'
import { Scene } from './components/viewer/scene'

export default function App() {
  return (
    <div className="grid h-full grid-rows-[auto_1fr] bg-[#0f1218]">
      <Header />
      <div className="grid min-h-0 grid-cols-[320px_1fr]">
        <Sidebar />
        <main className="relative min-h-0">
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

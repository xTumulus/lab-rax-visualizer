import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import './index.css'
import { hydrateFromShareParam } from './store/use-build-store'

// A shared build link (?b=...) overrides persisted localStorage state.
hydrateFromShareParam()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

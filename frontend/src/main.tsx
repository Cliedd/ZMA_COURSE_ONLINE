import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
// no-op comment: verifying netlify.toml `ignore` doesn't block real frontend deploys

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Login from './screens/Login.jsx'
import { loadSession, saveSession, clearSession, applySessionToMe } from './lib/auth.js'
import './index.css'

const initial = loadSession()
if (initial) applySessionToMe(initial)

function AuthGate() {
  const [session, setSession] = useState(initial)

  useEffect(() => {
    const onLogout = () => {
      clearSession()
      window.location.reload() // recarrega para restaurar os dados de demonstração
    }
    window.addEventListener('apoiai:logout', onLogout)
    return () => window.removeEventListener('apoiai:logout', onLogout)
  }, [])

  if (!session) {
    return (
      <Login
        onDone={(s) => {
          saveSession(s)
          applySessionToMe(s)
          setSession(s)
        }}
      />
    )
  }
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthGate />
  </React.StrictMode>,
)

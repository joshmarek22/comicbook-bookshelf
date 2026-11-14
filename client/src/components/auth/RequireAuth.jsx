import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

function RequireAuth({ children }) {
  const location = useLocation()
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let active = true

    fetch('/api/v1/auth/me', { credentials: 'include' })
      .then((response) => {
        if (active) setStatus(response.ok ? 'authenticated' : 'anonymous')
      })
      .catch(() => {
        if (active) setStatus('anonymous')
      })

    return () => {
      active = false
    }
  }, [])

  if (status === 'checking') {
    return <main className="p-8 text-[var(--muted)]">Checking your session...</main>
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export default RequireAuth

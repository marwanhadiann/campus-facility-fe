import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext.js'

function ProtectedRoute() {
  const { loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-[#7a8291] bg-[#f4f5f7] text-[13px]">
        Memeriksa sesi...
      </div>
    )
  }

  return user ? (
    <Outlet context={{ user }} />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  )
}

export default ProtectedRoute

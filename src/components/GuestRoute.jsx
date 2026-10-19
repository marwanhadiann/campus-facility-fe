import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/authContext.js'

function GuestRoute() {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-[#7a8291] bg-[#f4f5f7] text-[13px]">
        Memeriksa sesi...
      </div>
    )
  }

  return user ? <Navigate to="/dashboard" replace /> : <Outlet />
}

export default GuestRoute

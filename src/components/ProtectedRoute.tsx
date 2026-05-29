import { Navigate } from 'react-router-dom'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface ProtectedRouteProps {
  component: React.ComponentType<any>
  user: SupabaseUser | null
}

export default function ProtectedRoute({ component: Component, user }: ProtectedRouteProps) {
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Component />
}

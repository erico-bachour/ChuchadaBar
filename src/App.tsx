import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase, supabaseConfigError } from './services/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Pages - to be created
import Dashboard from './pages/Dashboard'
import Dishes from './pages/Dishes'
import Packages from './pages/Packages'
import Events from './pages/Events'
import Login from './pages/Login'

// Components - to be created
import Navigation from './components/Navigation'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      try {
        if (supabaseConfigError) {
          setUser(null)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error checking user:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Subscribe to auth changes
    if (supabaseConfigError) {
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-700">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f4efe2] text-[#251f1f]">
        {user && <Navigation user={user} />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={<ProtectedRoute component={Dashboard} user={user} />}
          />
          <Route
            path="/dishes"
            element={<ProtectedRoute component={Dishes} user={user} />}
          />
          <Route
            path="/packages"
            element={<ProtectedRoute component={Packages} user={user} />}
          />
          <Route
            path="/events"
            element={<ProtectedRoute component={Events} user={user} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

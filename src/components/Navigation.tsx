import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface NavigationProps {
  user: SupabaseUser
}

export default function Navigation({ user }: NavigationProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold">🍹 Chuchada Bar</h1>
            <div className="flex gap-6">
              <a href="/" className="hover:bg-blue-700 px-3 py-2 rounded">
                Dashboard
              </a>
              <a href="/dishes" className="hover:bg-blue-700 px-3 py-2 rounded">
                Pratos
              </a>
              <a href="/packages" className="hover:bg-blue-700 px-3 py-2 rounded">
                Pacotes
              </a>
              <a href="/events" className="hover:bg-blue-700 px-3 py-2 rounded">
                Eventos
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

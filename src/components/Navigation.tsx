import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface NavigationProps {
  user: SupabaseUser
}

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/dishes', label: 'Pratos' },
  { href: '/packages', label: 'Pacotes' },
  { href: '/events', label: 'Eventos' },
]

export default function Navigation({ user }: NavigationProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-[#1f1b1b] text-[#f8f3e6] shadow-lg border-b-4 border-[#8b0000]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center text-left"
              aria-label="Ir para o dashboard"
            >
              <img
                src="/logo-chuchada-disco.png"
                alt="Chuchada Bar"
                className="h-12 w-24 object-contain"
              />
            </button>

            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="rounded px-3 py-2 text-sm font-semibold hover:bg-[#8b0000]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-[#f8f3e6]/80">{user.email}</span>
            <button
              onClick={handleLogout}
              className="rounded bg-[#8b0000] px-4 py-2 font-semibold hover:bg-[#a41313]"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

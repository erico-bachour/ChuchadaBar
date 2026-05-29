import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, supabaseConfigError } from '../services/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(supabaseConfigError)

      if (supabaseConfigError) return

      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (err) throw err

      navigate('/')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(supabaseConfigError)

      if (supabaseConfigError) return

      const { error: err } = await supabase.auth.signUp({
        email,
        password,
      })

      if (err) throw err

      setError('Verifique seu email para confirmar o cadastro')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4efe2] px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md border border-[#e4d8bf]">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo-chuchada-disco.png"
            alt="Chuchada Bar"
            className="h-40 w-full object-contain mb-3"
          />
          <h1 className="text-3xl font-bold text-center text-[#251f1f]">
            Chuchada Bar
          </h1>
        </div>

        {(error || supabaseConfigError) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error || supabaseConfigError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-[#d8cab0] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-[#d8cab0] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
              placeholder="Sua senha"
            />
          </div>

          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading || Boolean(supabaseConfigError)}
              className="w-full bg-[#8b0000] hover:bg-[#a41313] disabled:bg-gray-400 text-white font-semibold py-2 rounded"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading || Boolean(supabaseConfigError)}
              className="w-full bg-[#251f1f] hover:bg-[#3b3333] disabled:bg-gray-400 text-white font-semibold py-2 rounded"
            >
              {loading ? 'Criando...' : 'Criar Conta'}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Bem-vindo ao sistema de gerenciamento do Chuchada Bar.
        </p>
      </div>
    </div>
  )
}

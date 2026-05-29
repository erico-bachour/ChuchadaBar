import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const hasPlaceholderCredentials =
  supabaseUrl.includes('your-project.supabase.co') ||
  supabaseAnonKey.includes('your-anon-key-here')

export const supabaseConfigError = hasPlaceholderCredentials
  ? 'Configure o Supabase no arquivo .env.local antes de entrar. Troque os valores de exemplo pela URL do projeto e pela anon key.'
  : ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

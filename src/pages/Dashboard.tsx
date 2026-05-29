import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDishes: 0,
    totalPackages: 0,
    totalEvents: 0,
    totalCMV: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [dishesRes, packagesRes, eventsRes] = await Promise.all([
          supabase.from('dishes').select('count', { count: 'exact' }),
          supabase.from('packages').select('count', { count: 'exact' }),
          supabase.from('events').select('count', { count: 'exact' }),
        ])

        setStats({
          totalDishes: dishesRes.count || 0,
          totalPackages: packagesRes.count || 0,
          totalEvents: eventsRes.count || 0,
          totalCMV: 0,
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total de Pratos</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalDishes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total de Pacotes</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalPackages}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total de Eventos</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalEvents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">CMV Total</h3>
          <p className="text-3xl font-bold text-red-600">R$ {stats.totalCMV.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Chuchada Bar!</h2>
        <p className="text-gray-700">
          Use o menu acima para gerenciar pratos, pacotes e eventos. 
          Analise o CMV e customize seus pacotes de acordo com a capacidade do evento.
        </p>
      </div>
    </div>
  )
}

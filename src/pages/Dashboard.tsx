import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalIngredients: 0,
    totalDishes: 0,
    totalPackages: 0,
    totalEvents: 0,
    totalCMV: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [ingredientsRes, dishesRes, packagesRes, eventsRes] = await Promise.all([
          supabase.from('ingredients').select('count', { count: 'exact' }),
          supabase.from('dishes').select('count', { count: 'exact' }),
          supabase.from('packages').select('count', { count: 'exact' }),
          supabase.from('events').select('count', { count: 'exact' }),
        ])

        setStats({
          totalIngredients: ingredientsRes.count || 0,
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-[#6f6460] mt-1">Gestao de eventos, pratos e CMV do Chuchada Bar.</p>
        </div>
        <img
          src="/logo-chuchada-disco.png"
          alt="Chuchada Bar"
          className="hidden md:block h-20 w-40 object-contain"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-[#8b0000]">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total de Ingredientes</h3>
          <p className="text-3xl font-bold text-[#8b0000]">{stats.totalIngredients}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-[#1f1b1b]">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total de Pratos</h3>
          <p className="text-3xl font-bold text-[#8b0000]">{stats.totalDishes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-[#c5b48f]">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total de Pacotes</h3>
          <p className="text-3xl font-bold text-[#1f1b1b]">{stats.totalPackages}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-[#8b0000]">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total de Eventos</h3>
          <p className="text-3xl font-bold text-[#8b0000]">{stats.totalEvents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-[#1f1b1b]">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">CMV Total</h3>
          <p className="text-3xl font-bold text-[#8b0000]">R$ {stats.totalCMV.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border border-[#e4d8bf]">
        <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Chuchada Bar!</h2>
        <p className="text-gray-700">
          Use o menu acima para gerenciar pratos, pacotes e eventos. 
          Analise o CMV e customize seus pacotes de acordo com a capacidade do evento.
        </p>
      </div>
    </div>
  )
}

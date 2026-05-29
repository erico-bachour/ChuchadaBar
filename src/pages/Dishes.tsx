import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import type { Dish } from '../types'

export default function Dishes() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newDish, setNewDish] = useState({
    name: '',
    description: '',
    cmv: 0,
    category: 'Prato Principal',
    price: 0,
  })

  useEffect(() => {
    loadDishes()
  }, [])

  const loadDishes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDishes(data || [])
    } catch (error) {
      console.error('Error loading dishes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('dishes').insert([
        {
          ...newDish,
          active: true,
        },
      ])

      if (error) throw error

      setNewDish({
        name: '',
        description: '',
        cmv: 0,
        category: 'Prato Principal',
        price: 0,
      })
      setShowForm(false)
      loadDishes()
    } catch (error) {
      console.error('Error adding dish:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Pratos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancelar' : 'Adicionar Prato'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <form onSubmit={handleAddDish}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome do prato"
                value={newDish.name}
                onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                required
                className="border rounded px-3 py-2"
              />
              <select
                value={newDish.category}
                onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                className="border rounded px-3 py-2"
              >
                <option>Prato Principal</option>
                <option>Entrada</option>
                <option>Sobremesa</option>
                <option>Bebida</option>
                <option>Acompanhamento</option>
              </select>
              <input
                type="number"
                placeholder="CMV (R$)"
                step="0.01"
                value={newDish.cmv}
                onChange={(e) => setNewDish({ ...newDish, cmv: parseFloat(e.target.value) })}
                required
                className="border rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Preço (R$)"
                step="0.01"
                value={newDish.price}
                onChange={(e) => setNewDish({ ...newDish, price: parseFloat(e.target.value) })}
                className="border rounded px-3 py-2"
              />
              <textarea
                placeholder="Descrição"
                value={newDish.description}
                onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                className="border rounded px-3 py-2 col-span-full"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
            >
              Salvar Prato
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Carregando pratos...</div>
      ) : dishes.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">Nenhum prato cadastrado ainda</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Categoria</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">CMV</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Preço</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Margem</th>
              </tr>
            </thead>
            <tbody>
              {dishes.map((dish) => {
                const margin = ((dish.price || 0) - dish.cmv) / (dish.price || 1) * 100
                return (
                  <tr key={dish.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{dish.name}</td>
                    <td className="px-6 py-4">{dish.category}</td>
                    <td className="px-6 py-4">R$ {dish.cmv.toFixed(2)}</td>
                    <td className="px-6 py-4">R$ {(dish.price || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={margin >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

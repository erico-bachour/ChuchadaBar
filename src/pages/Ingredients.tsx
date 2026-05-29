import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabase'
import type { Ingredient } from '../types'

type IngredientForm = {
  name: string
  category: string
  purchase_unit: Ingredient['purchase_unit']
  package_quantity: number
  package_price: number
  supplier: string
  notes: string
}

const initialForm: IngredientForm = {
  name: '',
  category: '',
  purchase_unit: 'kg',
  package_quantity: 1,
  package_price: 0,
  supplier: '',
  notes: '',
}

const unitLabels: Record<Ingredient['purchase_unit'], string> = {
  g: 'grama',
  kg: 'quilo',
  ml: 'mililitro',
  l: 'litro',
  un: 'unidade',
}

function getBaseUnit(unit: Ingredient['purchase_unit']) {
  if (unit === 'kg') return 'g'
  if (unit === 'l') return 'ml'
  return unit
}

function getBaseQuantity(quantity: number, unit: Ingredient['purchase_unit']) {
  if (unit === 'kg' || unit === 'l') return quantity * 1000
  return quantity
}

function calculateUnitCost(quantity: number, price: number, unit: Ingredient['purchase_unit']) {
  const baseQuantity = getBaseQuantity(quantity, unit)
  if (!baseQuantity || baseQuantity <= 0 || !price || price <= 0) return 0
  return price / baseQuantity
}

function formatCurrency(value: number, maximumFractionDigits = 4) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value || 0)
}

export default function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<IngredientForm>(initialForm)

  const unitCost = useMemo(
    () => calculateUnitCost(form.package_quantity, form.package_price, form.purchase_unit),
    [form.package_price, form.package_quantity, form.purchase_unit],
  )

  const baseUnit = getBaseUnit(form.purchase_unit)

  useEffect(() => {
    loadIngredients()
  }, [])

  const loadIngredients = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error: loadError } = await supabase
        .from('ingredients')
        .select('*')
        .order('name', { ascending: true })

      if (loadError) throw loadError
      setIngredients(data || [])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    field: keyof IngredientForm,
    value: string | number,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')

      const { error: insertError } = await supabase.from('ingredients').insert([
        {
          name: form.name.trim(),
          category: form.category.trim() || null,
          purchase_unit: form.purchase_unit,
          package_quantity: form.package_quantity,
          package_price: form.package_price,
          unit_cost: unitCost,
          supplier: form.supplier.trim() || null,
          notes: form.notes.trim() || null,
        },
      ])

      if (insertError) throw insertError

      setForm(initialForm)
      setShowForm(false)
      await loadIngredients()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banco de Ingredientes</h1>
          <p className="text-[#6f6460] mt-1">
            Cadastre custos de compra para montar os CMVs dos pratos com base real.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#8b0000] hover:bg-[#a41313] text-white px-4 py-2 rounded font-semibold"
        >
          {showForm ? 'Cancelar' : 'Adicionar Ingrediente'}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8 border border-[#e4d8bf]">
          <form onSubmit={handleAddIngredient} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 mb-2">Ingrediente</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  className="w-full border border-[#d8cab0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                  placeholder="Ex: Tomate italiano"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 mb-2">Categoria</span>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full border border-[#d8cab0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                  placeholder="Ex: Hortifruti"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 mb-2">Unidade de compra</span>
                <select
                  value={form.purchase_unit}
                  onChange={(e) => handleChange('purchase_unit', e.target.value as Ingredient['purchase_unit'])}
                  className="w-full border border-[#d8cab0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                >
                  {Object.entries(unitLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 mb-2">Quantidade da embalagem</span>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={form.package_quantity}
                  onChange={(e) => handleChange('package_quantity', Number(e.target.value))}
                  required
                  className="w-full border border-[#d8cab0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 mb-2">Preço da embalagem</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.package_price}
                  onChange={(e) => handleChange('package_price', Number(e.target.value))}
                  required
                  className="w-full border border-[#d8cab0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                />
              </label>

              <div className="rounded border border-[#e4d8bf] bg-[#f8f3e6] px-4 py-3">
                <span className="block text-sm font-semibold text-gray-700 mb-2">
                  Custo por {baseUnit}
                </span>
                <strong className="text-2xl text-[#8b0000]">
                  {formatCurrency(unitCost)}
                </strong>
              </div>

              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 mb-2">Fornecedor</span>
                <input
                  type="text"
                  value={form.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                  className="w-full border border-[#d8cab0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                  placeholder="Ex: CEASA, Atacadão"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="block text-sm font-semibold text-gray-700 mb-2">Observações</span>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full border border-[#d8cab0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                  placeholder="Marca, rendimento, variação de preço..."
                  rows={3}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-[#251f1f] hover:bg-[#3b3333] disabled:bg-gray-400 text-white px-6 py-2 rounded font-semibold"
            >
              {saving ? 'Salvando...' : 'Salvar Ingrediente'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Carregando ingredientes...</div>
      ) : ingredients.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center border border-[#e4d8bf]">
          <p className="text-gray-500">Nenhum ingrediente cadastrado ainda</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-[#e4d8bf]">
          <table className="w-full">
            <thead className="bg-[#f8f3e6] border-b border-[#e4d8bf]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Ingrediente</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Categoria</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Embalagem</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Preço</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Custo unitário</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Fornecedor</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => {
                const displayUnit = getBaseUnit(ingredient.purchase_unit)

                return (
                  <tr key={ingredient.id} className="border-b border-[#eee3cf] hover:bg-[#fbf8f0]">
                    <td className="px-6 py-4 font-semibold">{ingredient.name}</td>
                    <td className="px-6 py-4">{ingredient.category || '-'}</td>
                    <td className="px-6 py-4">
                      {ingredient.package_quantity} {ingredient.purchase_unit}
                    </td>
                    <td className="px-6 py-4">{formatCurrency(ingredient.package_price, 2)}</td>
                    <td className="px-6 py-4 text-[#8b0000] font-semibold">
                      {formatCurrency(ingredient.unit_cost)} / {displayUnit}
                    </td>
                    <td className="px-6 py-4">{ingredient.supplier || '-'}</td>
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

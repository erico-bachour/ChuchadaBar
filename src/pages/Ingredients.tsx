import { Fragment, useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabase'
import type { Ingredient, IngredientPrice } from '../types'

type IngredientForm = {
  name: string
  category: string
  purchase_unit: Ingredient['purchase_unit']
  package_quantity: number
  package_price: number
  supplier: string
  notes: string
}

type PriceForm = {
  purchase_date: string
  purchase_unit: Ingredient['purchase_unit']
  package_quantity: number
  package_price: number
  supplier: string
  notes: string
}

const today = new Date().toISOString().slice(0, 10)

const initialIngredientForm: IngredientForm = {
  name: '',
  category: '',
  purchase_unit: 'kg',
  package_quantity: 1,
  package_price: 0,
  supplier: '',
  notes: '',
}

const initialPriceForm: PriceForm = {
  purchase_date: today,
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(date))
}

function buildIngredientForm(ingredient: Ingredient): IngredientForm {
  return {
    name: ingredient.name,
    category: ingredient.category || '',
    purchase_unit: ingredient.purchase_unit,
    package_quantity: Number(ingredient.package_quantity),
    package_price: Number(ingredient.package_price),
    supplier: ingredient.supplier || '',
    notes: ingredient.notes || '',
  }
}

function buildPriceForm(ingredient: Ingredient): PriceForm {
  return {
    purchase_date: today,
    purchase_unit: ingredient.purchase_unit,
    package_quantity: Number(ingredient.package_quantity),
    package_price: Number(ingredient.package_price),
    supplier: ingredient.supplier || '',
    notes: '',
  }
}

export default function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [priceHistory, setPriceHistory] = useState<Record<string, IngredientPrice[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit' | 'price' | null>(null)
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
  const [expandedIngredientId, setExpandedIngredientId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [ingredientForm, setIngredientForm] = useState<IngredientForm>(initialIngredientForm)
  const [priceForm, setPriceForm] = useState<PriceForm>(initialPriceForm)

  const ingredientUnitCost = useMemo(
    () => calculateUnitCost(
      ingredientForm.package_quantity,
      ingredientForm.package_price,
      ingredientForm.purchase_unit,
    ),
    [ingredientForm.package_price, ingredientForm.package_quantity, ingredientForm.purchase_unit],
  )

  const priceUnitCost = useMemo(
    () => calculateUnitCost(priceForm.package_quantity, priceForm.package_price, priceForm.purchase_unit),
    [priceForm.package_price, priceForm.package_quantity, priceForm.purchase_unit],
  )

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
      const loadedIngredients = data || []
      setIngredients(loadedIngredients)

      if (loadedIngredients.length > 0) {
        const ids = loadedIngredients.map((ingredient) => ingredient.id)
        const { data: prices, error: pricesError } = await supabase
          .from('ingredient_prices')
          .select('*')
          .in('ingredient_id', ids)
          .order('purchase_date', { ascending: false })
          .order('created_at', { ascending: false })

        if (pricesError) throw pricesError

        const grouped = (prices || []).reduce<Record<string, IngredientPrice[]>>((acc, price) => {
          acc[price.ingredient_id] = [...(acc[price.ingredient_id] || []), price]
          return acc
        }, {})

        setPriceHistory(grouped)
      } else {
        setPriceHistory({})
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const resetPanel = () => {
    setMode(null)
    setSelectedIngredient(null)
    setIngredientForm(initialIngredientForm)
    setPriceForm(initialPriceForm)
  }

  const openCreate = () => {
    setMode('create')
    setSelectedIngredient(null)
    setIngredientForm(initialIngredientForm)
    setError('')
  }

  const openEdit = (ingredient: Ingredient) => {
    setMode('edit')
    setSelectedIngredient(ingredient)
    setIngredientForm(buildIngredientForm(ingredient))
    setError('')
  }

  const openPrice = (ingredient: Ingredient) => {
    setMode('price')
    setSelectedIngredient(ingredient)
    setPriceForm(buildPriceForm(ingredient))
    setError('')
  }

  const handleIngredientChange = (field: keyof IngredientForm, value: string | number) => {
    setIngredientForm((current) => ({ ...current, [field]: value }))
  }

  const handlePriceChange = (field: keyof PriceForm, value: string | number) => {
    setPriceForm((current) => ({ ...current, [field]: value }))
  }

  const savePriceHistory = async (ingredientId: string, form: PriceForm, unitCost: number) => {
    const { error: priceError } = await supabase.from('ingredient_prices').insert([
      {
        ingredient_id: ingredientId,
        purchase_date: form.purchase_date,
        purchase_unit: form.purchase_unit,
        package_quantity: form.package_quantity,
        package_price: form.package_price,
        unit_cost: unitCost,
        supplier: form.supplier.trim() || null,
        notes: form.notes.trim() || null,
      },
    ])

    if (priceError) throw priceError
  }

  const handleSaveIngredient = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')

      const payload = {
        name: ingredientForm.name.trim(),
        category: ingredientForm.category.trim() || null,
        purchase_unit: ingredientForm.purchase_unit,
        package_quantity: ingredientForm.package_quantity,
        package_price: ingredientForm.package_price,
        unit_cost: ingredientUnitCost,
        supplier: ingredientForm.supplier.trim() || null,
        notes: ingredientForm.notes.trim() || null,
        updated_at: new Date().toISOString(),
      }

      if (mode === 'edit' && selectedIngredient) {
        const { error: updateError } = await supabase
          .from('ingredients')
          .update(payload)
          .eq('id', selectedIngredient.id)

        if (updateError) throw updateError
      } else {
        const { data, error: insertError } = await supabase
          .from('ingredients')
          .insert([payload])
          .select('id')
          .single()

        if (insertError) throw insertError

        await savePriceHistory(
          data.id,
          {
            purchase_date: today,
            purchase_unit: ingredientForm.purchase_unit,
            package_quantity: ingredientForm.package_quantity,
            package_price: ingredientForm.package_price,
            supplier: ingredientForm.supplier,
            notes: 'Preço inicial',
          },
          ingredientUnitCost,
        )
      }

      resetPanel()
      await loadIngredients()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIngredient) return

    try {
      setSaving(true)
      setError('')

      await savePriceHistory(selectedIngredient.id, priceForm, priceUnitCost)

      const { error: updateError } = await supabase
        .from('ingredients')
        .update({
          purchase_unit: priceForm.purchase_unit,
          package_quantity: priceForm.package_quantity,
          package_price: priceForm.package_price,
          unit_cost: priceUnitCost,
          supplier: priceForm.supplier.trim() || selectedIngredient.supplier || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedIngredient.id)

      if (updateError) throw updateError

      setExpandedIngredientId(selectedIngredient.id)
      resetPanel()
      await loadIngredients()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const renderIngredientForm = () => (
    <div className="bg-white p-6 rounded-lg shadow mb-8 border border-[#e4d8bf]">
      <form onSubmit={handleSaveIngredient} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-2">Ingrediente</span>
            <input
              type="text"
              value={ingredientForm.name}
              onChange={(e) => handleIngredientChange('name', e.target.value)}
              required
              className="w-full border border-[#d8cab0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
              placeholder="Ex: Tomate italiano"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-2">Categoria</span>
            <input
              type="text"
              value={ingredientForm.category}
              onChange={(e) => handleIngredientChange('category', e.target.value)}
              className="w-full border border-[#d8cab0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
              placeholder="Ex: Hortifruti"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-2">Unidade de compra</span>
            <select
              value={ingredientForm.purchase_unit}
              onChange={(e) => handleIngredientChange('purchase_unit', e.target.value as Ingredient['purchase_unit'])}
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
              value={ingredientForm.package_quantity}
              onChange={(e) => handleIngredientChange('package_quantity', Number(e.target.value))}
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
              value={ingredientForm.package_price}
              onChange={(e) => handleIngredientChange('package_price', Number(e.target.value))}
              required
              className="w-full border border-[#d8cab0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
            />
          </label>

          <div className="rounded border border-[#e4d8bf] bg-[#f8f3e6] px-4 py-3">
            <span className="block text-sm font-semibold text-gray-700 mb-2">
              Custo por {getBaseUnit(ingredientForm.purchase_unit)}
            </span>
            <strong className="text-2xl text-[#8b0000]">{formatCurrency(ingredientUnitCost)}</strong>
          </div>

          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-2">Fornecedor</span>
            <input
              type="text"
              value={ingredientForm.supplier}
              onChange={(e) => handleIngredientChange('supplier', e.target.value)}
              className="w-full border border-[#d8cab0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
              placeholder="Ex: CEASA, Atacadão"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="block text-sm font-semibold text-gray-700 mb-2">Observações</span>
            <textarea
              value={ingredientForm.notes}
              onChange={(e) => handleIngredientChange('notes', e.target.value)}
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
          {saving ? 'Salvando...' : mode === 'edit' ? 'Salvar Alterações' : 'Salvar Ingrediente'}
        </button>
      </form>
    </div>
  )

  const renderPriceForm = () => {
    if (!selectedIngredient) return null

    return (
      <div className="bg-white p-6 rounded-lg shadow mb-8 border border-[#e4d8bf]">
        <div className="mb-5">
          <h2 className="text-xl font-bold">Novo preço: {selectedIngredient.name}</h2>
          <p className="text-sm text-[#6f6460]">Registre preço, data e fornecedor para acompanhar a evolução.</p>
        </div>

        <form onSubmit={handleSavePrice} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="block">
              <span className="block text-sm font-semibold text-gray-700 mb-2">Data do preço</span>
              <input
                type="date"
                value={priceForm.purchase_date}
                onChange={(e) => handlePriceChange('purchase_date', e.target.value)}
                required
                className="w-full border border-[#d8cab0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-semibold text-gray-700 mb-2">Unidade de compra</span>
              <select
                value={priceForm.purchase_unit}
                onChange={(e) => handlePriceChange('purchase_unit', e.target.value as Ingredient['purchase_unit'])}
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
                value={priceForm.package_quantity}
                onChange={(e) => handlePriceChange('package_quantity', Number(e.target.value))}
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
                value={priceForm.package_price}
                onChange={(e) => handlePriceChange('package_price', Number(e.target.value))}
                required
                className="w-full border border-[#d8cab0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-semibold text-gray-700 mb-2">Fornecedor</span>
              <input
                type="text"
                value={priceForm.supplier}
                onChange={(e) => handlePriceChange('supplier', e.target.value)}
                className="w-full border border-[#d8cab0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
              />
            </label>

            <div className="rounded border border-[#e4d8bf] bg-[#f8f3e6] px-4 py-3">
              <span className="block text-sm font-semibold text-gray-700 mb-2">
                Custo por {getBaseUnit(priceForm.purchase_unit)}
              </span>
              <strong className="text-2xl text-[#8b0000]">{formatCurrency(priceUnitCost)}</strong>
            </div>

            <label className="block md:col-span-2 lg:col-span-3">
              <span className="block text-sm font-semibold text-gray-700 mb-2">Observações</span>
              <textarea
                value={priceForm.notes}
                onChange={(e) => handlePriceChange('notes', e.target.value)}
                className="w-full border border-[#d8cab0] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                placeholder="Promoção, nova marca, mudança de fornecedor..."
                rows={2}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-[#251f1f] hover:bg-[#3b3333] disabled:bg-gray-400 text-white px-6 py-2 rounded font-semibold"
          >
            {saving ? 'Salvando...' : 'Registrar Preço'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banco de Ingredientes</h1>
          <p className="text-[#6f6460] mt-1">
            Cadastre insumos, atualize preços por data e acompanhe a evolução de custos.
          </p>
        </div>
        <button
          onClick={mode ? resetPanel : openCreate}
          className="bg-[#8b0000] hover:bg-[#a41313] text-white px-4 py-2 rounded font-semibold"
        >
          {mode ? 'Cancelar' : 'Adicionar Ingrediente'}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {(mode === 'create' || mode === 'edit') && renderIngredientForm()}
      {mode === 'price' && renderPriceForm()}

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
                <th className="px-6 py-3 text-left text-sm font-semibold">Preço atual</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Custo unitário</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Fornecedor</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => {
                const displayUnit = getBaseUnit(ingredient.purchase_unit)
                const history = priceHistory[ingredient.id] || []
                const isExpanded = expandedIngredientId === ingredient.id

                return (
                  <Fragment key={ingredient.id}>
                    <tr className="border-b border-[#eee3cf] hover:bg-[#fbf8f0]">
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
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(ingredient)}
                            className="rounded border border-[#d8cab0] px-3 py-2 text-sm font-semibold hover:bg-[#f8f3e6]"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => openPrice(ingredient)}
                            className="rounded bg-[#251f1f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#3b3333]"
                          >
                            Novo preço
                          </button>
                          <button
                            onClick={() => setExpandedIngredientId(isExpanded ? null : ingredient.id)}
                            className="rounded bg-[#8b0000] px-3 py-2 text-sm font-semibold text-white hover:bg-[#a41313]"
                          >
                            Histórico
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-[#fbf8f0]">
                        <td colSpan={7} className="px-6 py-5">
                          <h3 className="font-bold mb-3">Histórico de preços</h3>
                          {history.length === 0 ? (
                            <p className="text-sm text-gray-500">Nenhum preço registrado ainda.</p>
                          ) : (
                            <table className="w-full rounded border border-[#e4d8bf] bg-white">
                              <thead className="bg-[#f8f3e6]">
                                <tr>
                                  <th className="px-4 py-2 text-left text-sm font-semibold">Data</th>
                                  <th className="px-4 py-2 text-left text-sm font-semibold">Embalagem</th>
                                  <th className="px-4 py-2 text-left text-sm font-semibold">Preço</th>
                                  <th className="px-4 py-2 text-left text-sm font-semibold">Custo unitário</th>
                                  <th className="px-4 py-2 text-left text-sm font-semibold">Fornecedor</th>
                                  <th className="px-4 py-2 text-left text-sm font-semibold">Observações</th>
                                </tr>
                              </thead>
                              <tbody>
                                {history.map((price) => (
                                  <tr key={price.id} className="border-t border-[#eee3cf]">
                                    <td className="px-4 py-2">{formatDate(price.purchase_date)}</td>
                                    <td className="px-4 py-2">
                                      {price.package_quantity} {price.purchase_unit}
                                    </td>
                                    <td className="px-4 py-2">{formatCurrency(price.package_price, 2)}</td>
                                    <td className="px-4 py-2 text-[#8b0000] font-semibold">
                                      {formatCurrency(price.unit_cost)} / {getBaseUnit(price.purchase_unit)}
                                    </td>
                                    <td className="px-4 py-2">{price.supplier || '-'}</td>
                                    <td className="px-4 py-2">{price.notes || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

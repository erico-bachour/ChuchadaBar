// Ingredient/Ingrediente
export interface Ingredient {
  id: string
  name: string
  category?: string
  purchase_unit: 'g' | 'kg' | 'ml' | 'l' | 'un'
  package_quantity: number
  package_price: number
  unit_cost: number
  supplier?: string
  notes?: string
  created_at: string
  updated_at: string
}

// Dish/Prato
export interface Dish {
  id: string
  name: string
  description?: string
  cmv: number // Custo de Mercadoria Vendida
  category: string // Entrada, Prato Principal, Sobremesa, Bebida, etc.
  price?: number
  servings?: number
  ingredients?: string[]
  active: boolean
  created_at: string
  updated_at: string
}

// Package/Pacote
export interface Package {
  id: string
  name: string
  description?: string
  category?: string
  dishes: PackageDish[]
  total_cmv: number
  base_price?: number
  min_people?: number
  max_people?: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface PackageDish {
  dish_id: string
  quantity: number
  dish?: Dish
}

// Event/Evento
export interface Event {
  id: string
  client_name: string
  email?: string
  phone?: string
  event_date: string
  people_count: number
  location?: string
  package_id?: string
  total_budget?: number
  status: 'proposal' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

// User/Usuário
export interface User {
  id: string
  email: string
  name?: string
  role: 'admin' | 'staff'
  created_at: string
}

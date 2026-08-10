export type InventoryCategory = {
  id: string
  name: string
  prefix: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export type InventoryLocation = {
  id: string
  name: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export type InventoryItemLocation = {
  id: string
  item_id: string
  location_id: string | null
  freeform_location: string | null
  location?: InventoryLocation | null
}

export type InventoryCondition = 'excellent' | 'good' | 'fair' | 'poor'

export type InventoryItem = {
  id: string
  item_number: string
  name: string
  category_id: string
  description: string | null
  condition: InventoryCondition
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  category?: InventoryCategory | null
  item_locations?: InventoryItemLocation[]
}

export type InventoryItemWithStatus = InventoryItem & {
  is_checked_out: boolean
  is_overdue: boolean
}

export type InventoryItemLocationInput = {
  location_id?: string
  freeform_location?: string
}

export type CreateItemData = {
  name: string
  category_id: string
  description?: string
  condition: InventoryCondition
  locations: InventoryItemLocationInput[]
}

export type UpdateItemData = {
  name: string
  category_id: string
  description?: string
  condition: InventoryCondition
}

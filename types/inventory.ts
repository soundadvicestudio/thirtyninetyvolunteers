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

export type InventoryPhoto = {
  id: string
  item_id: string
  storage_path: string
  sort_order: number
  uploaded_by: string | null
  uploaded_at: string
  signed_url?: string // populated server-side before passing to client
}

export type InventoryNote = {
  id: string
  item_id: string
  content: string
  created_by: string | null
  created_at: string
  author_name?: string // joined from admin_users.name
}

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
  photos?: InventoryPhoto[]
  notes?: InventoryNote[]
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

export type CheckoutTargetType = 'show' | 'user' | 'custom'

export type InventoryCheckout = {
  id: string
  checked_out_at: string
  expected_return_date: string | null
  returned_at: string | null
  checked_out_by: string | null
  target_type: CheckoutTargetType
  target_show_id: string | null
  target_user_id: string | null
  target_custom_name: string | null
  target_custom_contact: string | null
  checkout_notes: string | null
  return_notes: string | null
  created_at: string
  // joined fields
  checked_out_by_name?: string
  target_show_name?: string
  target_user_name?: string
  items?: CheckoutItem[]
  is_overdue?: boolean
}

export type CheckoutItem = {
  id: string
  checkout_id: string
  item_id: string
  item_number?: string
  item_name?: string
}

export type CreateCheckoutData = {
  item_ids: string[]
  target_type: CheckoutTargetType
  target_show_id?: string
  target_user_id?: string
  target_custom_name?: string
  target_custom_contact?: string
  expected_return_date?: string
  checkout_notes?: string
}

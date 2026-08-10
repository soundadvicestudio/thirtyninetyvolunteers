import { NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'
import { getFeatureFlags } from '@/lib/feature-flags'
import { generateQR } from '@/lib/qr'
import { lightenHex } from '@/lib/utils/color'
import InventoryTagsPDF from '@/components/crew/inventory/InventoryTagsPDF'

export const runtime = 'nodejs'

const MAX_ITEMS = 50

export async function GET(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = await getServerClient()
  const flags = await getFeatureFlags(supabase)
  if (!flags.inventory) {
    return new Response('Forbidden', { status: 403 })
  }

  if (admin.role === 'production') {
    return new Response('Forbidden', { status: 403 })
  }

  const ids = request.nextUrl.searchParams.get('ids')
  if (!ids) {
    return new Response('No items specified', { status: 400 })
  }
  const itemIds = ids.split(',').filter(Boolean)
  if (itemIds.length === 0) {
    return new Response('No items specified', { status: 400 })
  }
  if (itemIds.length > MAX_ITEMS) {
    return new Response(`Cannot print more than ${MAX_ITEMS} tags at once`, { status: 400 })
  }

  const { data: items } = await supabase
    .from('inventory_items')
    .select('id, item_number, name, category_id, inventory_categories(name)')
    .in('id', itemIds)
    .eq('is_active', true)

  if (!items || items.length === 0) {
    return new Response('No items found', { status: 404 })
  }

  const adminClient = getAdminClient()
  const { data: brandRows } = await adminClient
    .from('app_settings')
    .select('key, value')
    .in('key', ['brand_primary'])
  const brandMap = Object.fromEntries((brandRows ?? []).map((r) => [r.key, r.value]))
  const brandPrimary = brandMap['brand_primary'] || '#293994'
  const brandPrimaryLight = lightenHex(brandPrimary, 0.08)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://30byninetyvolunteers.com'
  const tags = await Promise.all(
    items.map(async (item) => {
      const url = `${siteUrl}/crew/inventory/${item.id}`
      const { pngBase64 } = await generateQR(url)
      const categoryRow = Array.isArray(item.inventory_categories)
        ? item.inventory_categories[0]
        : item.inventory_categories
      return {
        id: item.id,
        item_number: item.item_number,
        name: item.name,
        category_name: categoryRow?.name || 'Uncategorized',
        pngBase64,
      }
    })
  )

  const buffer = await renderToBuffer(
    <InventoryTagsPDF tags={tags} brandPrimary={brandPrimary} brandPrimaryLight={brandPrimaryLight} />
  )

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      // Fixed filename — never interpolate item names or any user-supplied/
      // DB-sourced string here (ADMIN.26 pattern). A `"` in an item name
      // would corrupt the header.
      'Content-Disposition': 'attachment; filename="inventory-tags.pdf"',
    },
  })
}

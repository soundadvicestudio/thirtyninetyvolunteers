export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—'

  if (phone.length === 10) {
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
  }

  if (phone.length === 11 && phone.startsWith('1')) {
    const p = phone.slice(1)
    return `+1 (${p.slice(0, 3)}) ${p.slice(3, 6)}-${p.slice(6)}`
  }

  return phone
}

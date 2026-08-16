import { SupabaseClient } from '@supabase/supabase-js'

export const TIMEZONE_OPTIONS: Array<{ value: string; label: string }> = [
  // North America
  { value: 'America/New_York', label: 'New York / Eastern Time' },
  { value: 'America/Chicago', label: 'Chicago / Central Time' },
  { value: 'America/Denver', label: 'Denver / Mountain Time' },
  { value: 'America/Phoenix', label: 'Phoenix / Mountain Time (no DST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles / Pacific Time' },
  { value: 'America/Anchorage', label: 'Anchorage / Alaska Time' },
  { value: 'Pacific/Honolulu', label: 'Honolulu / Hawaii Time' },
  { value: 'America/Toronto', label: 'Toronto / Eastern Time' },
  { value: 'America/Vancouver', label: 'Vancouver / Pacific Time' },
  { value: 'America/Edmonton', label: 'Edmonton / Mountain Time' },
  { value: 'America/Winnipeg', label: 'Winnipeg / Central Time' },
  { value: 'America/Halifax', label: 'Halifax / Atlantic Time' },
  { value: 'America/St_Johns', label: "St. John's / Newfoundland Time" },
  { value: 'America/Mexico_City', label: 'Mexico City / Central Time' },

  // Caribbean & Central America
  { value: 'America/Puerto_Rico', label: 'San Juan / Atlantic Standard Time' },
  { value: 'America/Jamaica', label: 'Kingston / Eastern Standard Time' },
  { value: 'America/Panama', label: 'Panama / Eastern Standard Time' },
  { value: 'America/Costa_Rica', label: 'San José / Central Standard Time' },

  // South America
  { value: 'America/Bogota', label: 'Bogotá / Colombia Time' },
  { value: 'America/Lima', label: 'Lima / Peru Time' },
  { value: 'America/Caracas', label: 'Caracas / Venezuela Time' },
  { value: 'America/Santiago', label: 'Santiago / Chile Time' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires / Argentina Time' },
  { value: 'America/Sao_Paulo', label: 'São Paulo / Brasília Time' },

  // Europe
  { value: 'Atlantic/Azores', label: 'Azores / Azores Time' },
  { value: 'Europe/Lisbon', label: 'Lisbon / Western European Time' },
  { value: 'Europe/London', label: 'London / Greenwich Mean Time' },
  { value: 'Europe/Paris', label: 'Paris / Central European Time' },
  { value: 'Europe/Berlin', label: 'Berlin / Central European Time' },
  { value: 'Europe/Rome', label: 'Rome / Central European Time' },
  { value: 'Europe/Madrid', label: 'Madrid / Central European Time' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam / Central European Time' },
  { value: 'Europe/Stockholm', label: 'Stockholm / Central European Time' },
  { value: 'Europe/Warsaw', label: 'Warsaw / Central European Time' },
  { value: 'Europe/Athens', label: 'Athens / Eastern European Time' },
  { value: 'Europe/Helsinki', label: 'Helsinki / Eastern European Time' },
  { value: 'Europe/Bucharest', label: 'Bucharest / Eastern European Time' },
  { value: 'Europe/Kiev', label: 'Kyiv / Eastern European Time' },
  { value: 'Europe/Moscow', label: 'Moscow / Moscow Time' },
  { value: 'Europe/Istanbul', label: 'Istanbul / Turkey Time' },

  // Africa
  { value: 'Africa/Casablanca', label: 'Casablanca / Western Africa Time' },
  { value: 'Africa/Lagos', label: 'Lagos / West Africa Time' },
  { value: 'Africa/Nairobi', label: 'Nairobi / East Africa Time' },
  { value: 'Africa/Cairo', label: 'Cairo / Eastern European Time' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg / South Africa Time' },

  // Middle East
  { value: 'Asia/Jerusalem', label: 'Jerusalem / Israel Time' },
  { value: 'Asia/Riyadh', label: 'Riyadh / Arabia Standard Time' },
  { value: 'Asia/Dubai', label: 'Dubai / Gulf Standard Time' },
  { value: 'Asia/Tehran', label: 'Tehran / Iran Time' },
  { value: 'Asia/Baghdad', label: 'Baghdad / Arabia Time' },

  // Asia
  { value: 'Asia/Karachi', label: 'Karachi / Pakistan Time' },
  { value: 'Asia/Kolkata', label: 'Kolkata / India Standard Time' },
  { value: 'Asia/Dhaka', label: 'Dhaka / Bangladesh Time' },
  { value: 'Asia/Bangkok', label: 'Bangkok / Indochina Time' },
  { value: 'Asia/Singapore', label: 'Singapore / Singapore Time' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong / Hong Kong Time' },
  { value: 'Asia/Shanghai', label: 'Shanghai / China Standard Time' },
  { value: 'Asia/Tokyo', label: 'Tokyo / Japan Standard Time' },
  { value: 'Asia/Seoul', label: 'Seoul / Korea Standard Time' },
  { value: 'Asia/Jakarta', label: 'Jakarta / Western Indonesia Time' },
  { value: 'Asia/Colombo', label: 'Colombo / Sri Lanka Time' },
  { value: 'Asia/Kathmandu', label: 'Kathmandu / Nepal Time' },

  // Oceania
  { value: 'Australia/Perth', label: 'Perth / Australian Western Time' },
  { value: 'Australia/Darwin', label: 'Darwin / Australian Central Time' },
  { value: 'Australia/Brisbane', label: 'Brisbane / Australian Eastern Time' },
  { value: 'Australia/Sydney', label: 'Sydney / Australian Eastern Time' },
  { value: 'Pacific/Auckland', label: 'Auckland / New Zealand Time' },
  { value: 'Pacific/Fiji', label: 'Fiji / Fiji Time' },
  { value: 'Pacific/Guam', label: 'Guam / Chamorro Standard Time' },
]

export async function getOrgTimezone(supabase: SupabaseClient): Promise<string> {
  try {
    const { data } = await supabase.from('app_settings').select('value').eq('key', 'org_timezone').single()
    return data?.value || 'America/Chicago'
  } catch {
    return 'America/Chicago'
  }
}

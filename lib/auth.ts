import { createClient } from '@/util/supabase/server'

export type Role = 'admin' | 'manager' | 'employee'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: Role
  created_at: string
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data as Profile
}

export function canManageTasks(role: Role) {
  return role === 'admin' || role === 'manager'
}
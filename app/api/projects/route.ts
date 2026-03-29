import { createClient } from '@/util/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserAndProfile } from '@/lib/auth-helper'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const auth = await getUserAndProfile(supabase)
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (auth.profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const body = await req.json()
  const { data } = await supabase
    .from('projects')
    .insert({ name: body.name, description: body.description, created_by: auth.user.id })
    .select()
    .single()

  return NextResponse.json(data, { status: 201 })
}
import { createClient } from '@/util/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserAndProfile } from '@/lib/auth-helper'

export async function GET() {
  const supabase = await createClient()
  const auth = await getUserAndProfile(supabase)
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let query = supabase
    .from('tasks')
    .select('*, projects(name)')
    .order('created_at', { ascending: false })

  if (auth.profile?.role === 'employee') {
    query = query.eq('assigned_to', auth.user.id)
  }

  const { data } = await query
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const auth = await getUserAndProfile(supabase)
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (auth.profile?.role === 'employee') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const body = await req.json()
  const { data } = await supabase
    .from('tasks')
    .insert({
      title: body.title,
      description: body.description,
      project_id: body.project_id,
      assigned_to: body.assigned_to || null,
      status: 'todo',
      created_by: auth.user.id
    })
    .select()
    .single()

  return NextResponse.json(data, { status: 201 })
}
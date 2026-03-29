import { createClient } from '@/util/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserAndProfile } from '@/lib/auth-helper'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const auth = await getUserAndProfile(supabase)
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('tasks')
    .select('*, projects(name)')
    .eq('id', id)
    .single()

  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })

  if (auth.profile?.role === 'employee' && data.assigned_to !== auth.user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const auth = await getUserAndProfile(supabase)
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const updates = auth.profile?.role === 'employee' ? { status: body.status } : body

  const { data } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const auth = await getUserAndProfile(supabase)
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (auth.profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  await supabase.from('tasks').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
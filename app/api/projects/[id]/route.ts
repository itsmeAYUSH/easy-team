import { createClient } from '@/util/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserAndProfile } from '@/lib/auth-helper'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('*').eq('id', id).single()
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const auth = await getUserAndProfile(supabase)
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (auth.profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const body = await req.json()
  const { data } = await supabase
    .from('projects')
    .update({ name: body.name, description: body.description })
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

  await supabase.from('projects').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
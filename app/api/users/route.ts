import { createClient } from "@/util/supabase/server";
import { NextResponse } from "next/server";
import { getUserAndProfile } from "@/lib/auth-helper";

export async function GET() {
  const supabase = await createClient()
  const auth = await getUserAndProfile(supabase)

  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (auth.profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json(data)
}
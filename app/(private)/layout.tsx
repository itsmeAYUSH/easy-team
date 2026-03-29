
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth'
import Link from 'next/link'
import { createClient } from '@/util/supabase/server'

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-black">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <Link href="/dashboard" className="text-black">Dashboard</Link>
            <Link href="/projects" className="text-black">Projects</Link>
            <Link href="/tasks" className="text-black">Tasks</Link>
            {profile.role === 'admin' && (
              <Link href="/users" className="text-black">Users</Link>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-black">{profile.full_name} · {profile.role}</span>
            <form action={signOut}>
              <button type="submit" className="text-black">sign out</button>
            </form>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
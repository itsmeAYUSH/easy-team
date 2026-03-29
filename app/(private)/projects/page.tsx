import { getProfile } from '@/lib/auth'
import { createClient } from '@/util/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProjectsPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-black">All projects</h1>
      </div>

      <div className="divide-y border rounded">
        {projects?.map(p => (
          <Link key={p.id} href={`/projects/${p.id}`}
            className="flex items-center justify-between px-4 py-3 block text-black">
            <div>
              <p className="text-sm">{p.name}</p>
              {p.description && (
                <p className="text-xs text-black">{p.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
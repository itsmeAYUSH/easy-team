import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth'
import { createClient } from '@/util/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  let taskQuery = supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })

  if (profile.role === 'employee') {
    taskQuery = taskQuery.eq('assigned_to', profile.id)
  }

  const { count: taskCount } = await taskQuery

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8 text-black">Welcome to Dashboard - {profile.full_name}</h1>
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div>
          <div>Role: {profile.role}</div>
          <div>Projects : {projectCount ?? 0}</div>
          <div>{profile.role === 'employee' ? 'assigned tasks' : 'total tasks'} : {taskCount ?? 0}</div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/projects" className="text-sm text-black border border-black rounded px-3 py-1.5">
          view projects
        </Link>
        <Link href="/tasks" className="text-sm text-black border border-black rounded px-3 py-1.5">
          view tasks
        </Link>
        {(profile.role === 'admin' || profile.role === 'manager') && (
          <Link href="/tasks/new" className="text-sm text-black border border-black rounded px-3 py-1.5">
            + new task
          </Link>
        )}
        {profile.role === 'admin' && (
          <Link href="/projects/new" className="text-sm text-black border border-black rounded px-3 py-1.5">
            + new project
          </Link>
        )}
      </div>
    </div>
  )
}
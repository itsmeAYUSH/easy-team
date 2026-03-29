import { getProfile } from '@/lib/auth'
import { createClient } from '@/util/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TasksPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  let query = supabase
    .from('tasks')
    .select('*, projects(name)')
    .order('created_at', { ascending: false })

  if (profile.role === 'employee') {
    query = query.eq('assigned_to', profile.id)
  }

  const { data: tasks } = await query

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-black">tasks</h1>
        {(profile.role === 'admin' || profile.role === 'manager') && (
          <Link href="/tasks/new" className="text-sm text-black border border-black rounded px-3 py-1.5">
            new task
          </Link>
        )}
      </div>

      {!tasks?.length && (
        <p className="text-sm text-black">
          {profile.role === 'employee' ? 'no tasks assigned to you' : 'no tasks yet'}
        </p>
      )}

      <div className="divide-y border rounded">
        {tasks?.map(task => (
          <Link key={task.id} href={`/tasks/${task.id}`}
            className="flex items-center justify-between px-4 py-3 block text-black">
            <div>
              <p className="text-sm">{task.title}</p>
              {task.projects?.name && (
                <p className="text-xs text-black">{task.projects.name}</p>
              )}
            </div>
            <span className="text-xs px-2 py-0.5 rounded border border-black text-black bg-white">
              {task.status.replace('_', ' ')}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
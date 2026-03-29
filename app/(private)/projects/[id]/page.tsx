import { getProfile } from '@/lib/auth'
import { createClient } from '@/util/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!project) redirect('/projects')

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, profiles(full_name)')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })

  async function deleteProject() {
    'use server'
    const supabase = await createClient()
    await supabase.from('projects').delete().eq('id', params.id)
    redirect('/projects')
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-2">
        <div>
          <Link href="/projects" className="text-xs text-black-400 hover:text-black">back</Link>
          <h1 className="text-lg font-semibold mt-1">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-black-400 mt-0.5">{project.description}</p>
          )}
        </div>
        {profile.role === 'admin' && (
          <form action={deleteProject}>
            <button className="text-xs text-black-400 hover:text-black-600 border border-black-200 rounded px-2 py-1">
              delete
            </button>
          </form>
        )}
      </div>

      <div className="flex items-center justify-between mt-8 mb-4">
        <p className="text-sm font-medium">tasks</p>
        {(profile.role === 'admin' || profile.role === 'manager') && (
          <Link href={`/tasks/new?project=${params.id}`}
            className="text-xs border border-black rounded px-2 py-1 hover:bg-black-100">
                new task
          </Link>
        )}
      </div>

      <div className="divide-y border border-black rounded">
        {tasks?.map(task => (
          <Link key={task.id} href={`/tasks/${task.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-black-100 block">
            <div>
              <p className="text-sm">{task.title}</p>
              {task.profiles?.full_name && (
                <p className="text-xs text-black-400">{task.profiles.full_name}</p>
              )}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded border ${
              task.status === 'done' ? 'border-black text-black' :
              task.status === 'in_progress' ? 'border-black-500 text-black-600' :
              'border-black-300 text-black-400'
            }`}>
              {task.status.replace('_', ' ')}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
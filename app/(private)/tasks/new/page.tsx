import { getProfile } from '@/lib/auth'
import { createClient } from '@/util/supabase/server'
import { redirect } from 'next/navigation'

export default async function NewTaskPage({ searchParams }: { searchParams: { project?: string } }) {
  const profile = await getProfile()
  if (!profile || profile.role === 'employee') redirect('/forbidden')

  const supabase = await createClient()

  const { data: projects } = await supabase.from('projects').select('id, name')
  const { data: employees } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'employee')

  async function createTask(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('tasks').insert({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      project_id: formData.get('project_id') as string,
      assigned_to: formData.get('assigned_to') as string || null,
      status: 'todo',
      created_by: user!.id
    })

    redirect('/tasks')
  }

  return (
    <div className="max-w-md">
      <h1 className="text-lg font-semibold mb-6">new task</h1>
      <form action={createTask} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-black-500 block mb-1">title</label>
          <input
            name="title"
            required
            className="w-full border border-black rounded px-3 py-2 text-sm outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-black-500 block mb-1">description</label>
          <textarea
            name="description"
            rows={3}
            className="w-full border border-black rounded px-3 py-2 text-sm outline-none resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-black-500 block mb-1">project</label>
          <select
            name="project_id"
            required
            defaultValue={searchParams.project ?? ''}
            className="w-full border border-black rounded px-3 py-2 text-sm outline-none"
          >
            <option value="">select a project</option>
            {projects?.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-black-500 block mb-1">assign to</label>
          <select
            name="assigned_to"
            className="w-full border border-black rounded px-3 py-2 text-sm outline-none"
          >
            <option value="">unassigned</option>
            {employees?.map(e => (
              <option key={e.id} value={e.id}>{e.full_name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="text-sm bg-black text-white rounded px-4 py-2 hover:bg-black-800 w-fit"
        >
          create
        </button>
      </form>
    </div>
  )
}
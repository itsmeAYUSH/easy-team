import { getProfile } from '@/lib/auth'
import { createClient } from '@/util/supabase/server'
import { redirect } from 'next/navigation'

export default async function NewProjectPage() {
  const profile = await getProfile()
  if (!profile || profile.role !== 'admin') redirect('/forbidden')

  async function createProject(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('projects').insert({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      created_by: user!.id
    })

    redirect('/projects')
  }

  return (
    <div className="max-w-md">
      <h1 className="text-lg font-semibold mb-6">new project</h1>
      <form action={createProject} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-black-500 block mb-1">name</label>
          <input
            name="name"
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
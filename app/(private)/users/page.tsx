import { getProfile } from '@/lib/auth'
import { serverApi } from '@/lib/api.server'
import { redirect } from 'next/navigation'

interface User {
  id: string
  full_name: string
  email: string
  role: string
}

export default async function UsersPage() {
  const profile = await getProfile()
  if (!profile || profile.role !== 'admin') redirect('/forbidden')

  const users = await serverApi.getUsers()

  async function updateRole(formData: FormData) {
    'use server'
    await serverApi.updateRole(
      formData.get('id') as string,
      formData.get('role') as string
    )
    redirect('/users')
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-6">users</h1>
      <div className="divide-y border border-black rounded">
        {users?.map((u: User) => (
          <div key={u.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm">{u.full_name}</p>  
              <p className="text-xs text-black-400">{u.email}</p>
            </div>
            <form action={updateRole} className="flex items-center gap-2">
              <input type="hidden" name="id" value={u.id} />
              <select name="role" defaultValue={u.role}
                className="text-xs border border-black rounded px-2 py-1 outline-none">
                <option value="admin">admin</option>
                <option value="manager">manager</option>
                <option value="employee">employee</option>
              </select>
              <button type="submit"
                className="text-xs border border-black rounded px-2 py-1 hover:bg-black-100">
                save
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
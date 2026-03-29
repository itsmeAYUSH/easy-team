import { cookies, headers } from 'next/headers'

async function getBaseUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'http'
  if (host) return `${proto}://${host}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const [cookieStore, baseUrl] = await Promise.all([cookies(), getBaseUrl()])
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  const url = path.startsWith('http') ? path : `${baseUrl}${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...options.headers,
    },
    cache: 'no-store',
  })

  if (!res.ok) return null

  const ct = res.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) {
    console.error('apiFetch: expected JSON from', url, 'got', ct)
    return null
  }

  return res.json()
}

export const serverApi = {
  getProjects: () => apiFetch('/api/projects'),
  getProject: (id: string) => apiFetch(`/api/projects/${id}`),
  createProject: (body: { name: string; description?: string }) =>
    apiFetch('/api/projects', { method: 'POST', body: JSON.stringify(body) }),
  deleteProject: (id: string) =>
    apiFetch(`/api/projects/${id}`, { method: 'DELETE' }),

  getTasks: () => apiFetch('/api/tasks'),
  getTask: (id: string) => apiFetch(`/api/tasks/${id}`),
  createTask: (body: Record<string, unknown>) =>
    apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteTask: (id: string) =>
    apiFetch(`/api/tasks/${id}`, { method: 'DELETE' }),

  getUsers: () => apiFetch('/api/users'),
  updateRole: (id: string, role: string) =>
    apiFetch(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
}

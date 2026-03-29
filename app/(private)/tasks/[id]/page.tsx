import { getProfile } from "@/lib/auth";
import { createClient } from "@/util/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("*, projects(name)")
    .eq("id", id)
    .single();

  if (!task) redirect("/tasks");

  if (profile.role === "employee" && task.assigned_to !== profile.id) {
    redirect("/forbidden");
  }

  let assigneeName = null;
  if (task.assigned_to) {
    const { data: assignee } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", task.assigned_to)
      .single();
    assigneeName = assignee?.full_name;
  }

  const { data: employees } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "employee");

  async function updateStatus(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase
      .from("tasks")
      .update({ status: formData.get("status") as string })
      .eq("id", id);
    redirect(`/tasks/${id}`);
  }

  async function updateTask(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase
      .from("tasks")
      .update({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        assigned_to: (formData.get("assigned_to") as string) || null,
        status: formData.get("status") as string,
      })
      .eq("id", id);
    redirect(`/tasks/${id}`);
  }

  async function deleteTask() {
    "use server";
    const supabase = await createClient();
    await supabase.from("tasks").delete().eq("id", id);
    redirect("/tasks");
  }

  const isEmployee = profile.role === "employee";

  return (
    <div className="max-w-md">
      <Link href="/tasks" className="text-xs text-black-400 hover:text-black">
        Back
      </Link>
      <div className="flex items-start justify-between mt-2 mb-6">
        <h1 className="text-lg font-semibold">{task.title}</h1>
        {profile.role === "admin" && (
          <form action={deleteTask}>
            <button className="text-xs border border-black rounded px-2 py-1">
              delete
            </button>
          </form>
        )}
      </div>

      {task.description && (
        <p className="text-sm text-black-500 mb-4">{task.description}</p>
      )}

      <div className="text-xs text-black-400 mb-6 flex gap-4">
        {task.projects?.name && <span>project: {task.projects.name}</span>}
        {assigneeName && <span>assigned: {assigneeName}</span>}
      </div>

      {isEmployee ? (
        <form action={updateStatus} className="flex flex-col gap-3">
          <label className="text-xs text-black-500">update status</label>
          <select
            name="status"
            defaultValue={task.status}
            className="border border-black rounded px-3 py-2 text-sm outline-none"
          >
            <option value="todo">todo</option>
            <option value="in_progress">in progress</option>
            <option value="done">done</option>
          </select>
          <button
            type="submit"
            className="text-sm bg-black text-white rounded px-4 py-2 w-fit"
          >
            save
          </button>
        </form>
      ) : (
        <form action={updateTask} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-black-500 block mb-1">title</label>
            <input
              name="title"
              defaultValue={task.title}
              className="w-full border border-black rounded px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-black-500 block mb-1">
              description
            </label>
            <textarea
              name="description"
              defaultValue={task.description ?? ""}
              rows={3}
              className="w-full border border-black rounded px-3 py-2 text-sm outline-none resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-black-500 block mb-1">
              assign to
            </label>
            <select
              name="assigned_to"
              defaultValue={task.assigned_to ?? ""}
              className="w-full border border-black rounded px-3 py-2 text-sm outline-none"
            >
              <option value="">unassigned</option>
              {employees?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-black-500 block mb-1">status</label>
            <select
              name="status"
              defaultValue={task.status}
              className="w-full border border-black rounded px-3 py-2 text-sm outline-none"
            >
              <option value="todo">todo</option>
              <option value="in_progress">in progress</option>
              <option value="done">done</option>
            </select>
          </div>
          <button
            type="submit"
            className="text-sm bg-black text-white rounded px-4 py-2 w-fit"
          >
            save
          </button>
        </form>
      )}
    </div>
  );
}

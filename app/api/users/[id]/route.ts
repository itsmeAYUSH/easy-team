import { createClient } from "@/util/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getUserAndProfile } from "@/lib/auth-helper";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const auth = await getUserAndProfile(supabase);
  if (!auth)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (auth.profile?.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { role } = await req.json();
  const validRoles = ["admin", "manager", "employee"];
  if (!validRoles.includes(role))
    return NextResponse.json({ error: "invalid role" }, { status: 400 });

  const { data } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .select()
    .single();

  return NextResponse.json(data);
}

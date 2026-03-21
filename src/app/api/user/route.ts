import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getOrCreateUser, FREE_QUERY_LIMIT } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await getOrCreateUser(session.user.email);
  return NextResponse.json({
    email: user.email,
    name: user.name,
    queryCount: user.query_count,
    freeQueriesRemaining: Math.max(0, FREE_QUERY_LIMIT - user.query_count),
    limit: FREE_QUERY_LIMIT,
  });
}

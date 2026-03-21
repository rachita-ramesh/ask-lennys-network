import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { getOrCreateUser, hasRemainingFreeQueries, incrementQueryCount, FREE_QUERY_LIMIT } from "./supabase";

export type AuthResult =
  | { ok: true; email: string; apiKey: string | null; useOwnKey: boolean }
  | { ok: false; error: string; status: number };

/**
 * Check if the user is authenticated and has remaining queries or an API key.
 * The API key comes from the request header (x-api-key), never from the database.
 */
export async function checkAuthAndQuota(
  req: NextRequest,
  countQuery: boolean = false
): Promise<AuthResult> {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return { ok: false, error: "Sign in to continue", status: 401 };
  }

  const user = await getOrCreateUser(session.user.email);
  // For counting routes (select-experts), check strict limit: count < limit
  // For non-counting routes (review, reply), allow count == limit since
  // the review was already paid for by select-experts
  const hasFree = countQuery
    ? hasRemainingFreeQueries(user)
    : user.query_count <= FREE_QUERY_LIMIT;
  const apiKey = req.headers.get("x-api-key") || null;

  if (!hasFree && !apiKey) {
    return {
      ok: false,
      error: "You've used all 3 free reviews. Add your own Anthropic API key to continue.",
      status: 403,
    };
  }

  if (countQuery) {
    await incrementQueryCount(session.user.email);
  }

  return {
    ok: true,
    email: session.user.email,
    apiKey: !hasFree ? apiKey : null,
    useOwnKey: !hasFree && !!apiKey,
  };
}

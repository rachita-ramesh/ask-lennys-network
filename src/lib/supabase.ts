import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export interface DBUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  query_count: number;
  api_key: string | null;
  created_at: string;
  updated_at: string;
}

const FREE_QUERY_LIMIT = 3;

export async function getOrCreateUser(
  email: string,
  name?: string | null,
  image?: string | null
): Promise<DBUser> {
  // Try to find existing user
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (existing) return existing as DBUser;

  // Create new user
  const { data: created, error } = await supabase
    .from("users")
    .insert({ email, name, image })
    .select()
    .single();

  if (error) throw new Error(`Failed to create user: ${error.message}`);
  return created as DBUser;
}

export async function incrementQueryCount(email: string): Promise<DBUser> {
  const user = await getOrCreateUser(email);
  const { data, error } = await supabase
    .from("users")
    .update({
      query_count: user.query_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email)
    .select()
    .single();

  if (error) throw new Error(`Failed to update query count: ${error.message}`);
  return data as DBUser;
}

export function hasRemainingFreeQueries(user: DBUser): boolean {
  return user.query_count < FREE_QUERY_LIMIT;
}

export { FREE_QUERY_LIMIT };

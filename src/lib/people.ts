import { supabase } from "./supabase";
import { Person, PersonMeta } from "./types";

function rowToPerson(row: Record<string, unknown>): Person {
  return {
    slug: row.slug as string,
    name: row.name as string,
    title: row.title as string,
    description: row.description as string,
    tags: row.tags as string[],
    sources: row.sources as Person["sources"],
    totalWords: row.total_words as number,
    chunkCount: row.chunk_count as number,
  };
}

export async function getAllPeople(): Promise<Person[]> {
  const { data, error } = await supabase.from("people").select("*");
  if (error) throw new Error(`Failed to load people: ${error.message}`);
  return (data || []).map(rowToPerson);
}

export async function getPeopleMeta(): Promise<PersonMeta[]> {
  const { data, error } = await supabase
    .from("people_meta")
    .select("*");
  if (error) throw new Error(`Failed to load people meta: ${error.message}`);
  return (data || []) as PersonMeta[];
}

export async function getPeopleMetaString(): Promise<string> {
  const meta = await getPeopleMeta();
  return JSON.stringify(meta);
}

export async function getPersonBySlug(slug: string): Promise<Person | undefined> {
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !data) return undefined;
  return rowToPerson(data);
}

export async function searchPeople(query: string): Promise<Person[]> {
  const q = query.toLowerCase();
  const all = await getAllPeople();
  return all.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q))
  );
}

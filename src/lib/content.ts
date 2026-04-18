import { supabase } from "./supabase";
import { Chunk } from "./types";

function rowToChunk(row: Record<string, unknown>): Chunk {
  return {
    personSlug: row.person_slug as string,
    personName: row.person_name as string,
    chunkIndex: row.chunk_index as number,
    sourceTitle: row.source_title as string,
    sourceType: row.source_type as "podcast" | "newsletter",
    sourceDate: row.source_date as string,
    text: row.text as string,
    guestOnly: row.guest_only as string,
    wordCount: row.word_count as number,
  };
}

export async function loadChunksForPerson(slug: string): Promise<Chunk[]> {
  const { data, error } = await supabase
    .from("chunks")
    .select("*")
    .eq("person_slug", slug)
    .order("chunk_index", { ascending: true });
  if (error) throw new Error(`Failed to load chunks: ${error.message}`);
  return (data || []).map(rowToChunk);
}

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "each",
  "every", "both", "few", "more", "most", "other", "some", "such", "no",
  "nor", "not", "only", "own", "same", "so", "than", "too", "very",
  "just", "because", "but", "and", "or", "if", "while", "about", "up",
  "it", "its", "i", "me", "my", "you", "your", "he", "him", "his",
  "she", "her", "we", "us", "our", "they", "them", "their", "what",
  "which", "who", "whom", "this", "that", "these", "those", "am",
  "also", "like", "think", "know", "really", "going", "get", "got",
  "one", "thing", "things", "people", "much", "well", "right",
]);

export function scoreChunkRelevance(chunk: Chunk, question: string): number {
  const questionWords = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const chunkText = (chunk.guestOnly || chunk.text).toLowerCase();
  let score = 0;
  for (const word of questionWords) {
    const regex = new RegExp(`\\b${word}`, "g");
    const matches = chunkText.match(regex);
    if (matches) score += matches.length;
  }
  return score;
}

export async function getRelevantChunks(slug: string, question: string, maxWords: number = 8000): Promise<Chunk[]> {
  const chunks = await loadChunksForPerson(slug);
  const scored = chunks.map((c) => ({ chunk: c, score: scoreChunkRelevance(c, question) }));
  scored.sort((a, b) => b.score - a.score);

  const result: Chunk[] = [];
  let totalWords = 0;
  for (const { chunk } of scored) {
    if (totalWords + chunk.wordCount > maxWords) break;
    result.push(chunk);
    totalWords += chunk.wordCount;
  }
  result.sort((a, b) => a.chunkIndex - b.chunkIndex);
  return result;
}

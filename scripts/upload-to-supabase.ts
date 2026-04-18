import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

const DATA_DIR = path.resolve(__dirname, "../public/data");
const CHUNKS_DIR = path.join(DATA_DIR, "chunks");

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

interface Person {
  slug: string;
  name: string;
  title: string;
  description: string;
  tags: string[];
  sources: { type: string; title: string; date: string; filename: string }[];
  totalWords: number;
  chunkCount: number;
}

interface Chunk {
  personSlug: string;
  personName: string;
  chunkIndex: number;
  sourceTitle: string;
  sourceType: string;
  sourceDate: string;
  text: string;
  guestOnly: string;
  wordCount: number;
}

async function uploadPeople() {
  const raw = fs.readFileSync(path.join(DATA_DIR, "people.json"), "utf-8");
  const people: Person[] = JSON.parse(raw);

  const rows = people.map((p) => ({
    slug: p.slug,
    name: p.name,
    title: p.title,
    description: p.description,
    tags: p.tags,
    sources: p.sources,
    total_words: p.totalWords,
    chunk_count: p.chunkCount,
  }));

  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("people").upsert(batch);
    if (error) throw new Error(`People batch ${i}: ${error.message}`);
    console.log(`People: uploaded ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }
}

async function uploadChunks() {
  const files = fs.readdirSync(CHUNKS_DIR).filter((f) => f.endsWith(".json"));
  console.log(`Found ${files.length} chunk files`);

  const BATCH = 50;
  let uploaded = 0;

  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH).map((f) => {
      const chunk: Chunk = JSON.parse(
        fs.readFileSync(path.join(CHUNKS_DIR, f), "utf-8")
      );
      return {
        person_slug: chunk.personSlug,
        person_name: chunk.personName,
        chunk_index: chunk.chunkIndex,
        source_title: chunk.sourceTitle,
        source_type: chunk.sourceType,
        source_date: chunk.sourceDate,
        text: chunk.text,
        guest_only: chunk.guestOnly,
        word_count: chunk.wordCount,
      };
    });

    const { error } = await supabase.from("chunks").upsert(batch, {
      onConflict: "person_slug,chunk_index",
    });
    if (error) throw new Error(`Chunks batch ${i}: ${error.message}`);
    uploaded += batch.length;
    console.log(`Chunks: uploaded ${uploaded}/${files.length}`);
  }
}

async function main() {
  console.log("Uploading people...");
  await uploadPeople();
  console.log("Uploading chunks...");
  await uploadChunks();
  console.log("Done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

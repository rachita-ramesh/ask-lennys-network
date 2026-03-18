import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.resolve(__dirname, "../../lennys-newsletterpodcastdata-all");
const OUT_DIR = path.resolve(__dirname, "../public/data");
const CHUNKS_DIR = path.join(OUT_DIR, "chunks");
const CHUNK_WORDS = 3000;

interface IndexEntry {
  title: string;
  filename: string;
  tags: string[];
  word_count: number;
  date: string;
  description?: string;
  subtitle?: string;
  guest?: string;
}

interface Index {
  podcasts: IndexEntry[];
  newsletters: IndexEntry[];
}

interface PersonAccum {
  slug: string;
  name: string;
  title: string;
  description: string;
  tags: Set<string>;
  sources: { type: "podcast" | "newsletter"; title: string; date: string; filename: string }[];
  totalWords: number;
  chunks: { text: string; guestOnly: string; sourceTitle: string; sourceType: string; sourceDate: string }[];
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractTitleFromPodcastTitle(podcastTitle: string): string {
  // Try to extract role from parenthetical: "Name (Role, Company)"
  const match = podcastTitle.match(/\(([^)]+)\)/);
  if (match) {
    return match[1].split(",").slice(0, 2).join(",").trim();
  }
  return "";
}

function extractGuestAuthor(subtitle: string): string | null {
  // Match "guest post by Name" or "by Name" at end
  const patterns = [
    /guest post by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    /—\s*by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s*$/i,
  ];
  for (const pat of patterns) {
    const m = subtitle.match(pat);
    if (m) return m[1].trim();
  }
  return null;
}

function extractGuestSpeech(text: string, guestName: string): string {
  // Parse **Name** (HH:MM:SS): format and keep only guest turns
  const lines = text.split("\n");
  const guestLines: string[] = [];
  let isGuestTurn = false;
  const namePattern = guestName.split(" ")[0]; // First name matching

  for (const line of lines) {
    const speakerMatch = line.match(/^\*\*([^*]+)\*\*\s*\(/);
    if (speakerMatch) {
      const speaker = speakerMatch[1].trim();
      isGuestTurn = speaker.includes(namePattern) && !speaker.toLowerCase().includes("lenny");
    }
    if (isGuestTurn) {
      guestLines.push(line);
    }
  }
  return guestLines.join("\n").trim();
}

function splitIntoChunks(
  text: string,
  guestOnly: string,
  sourceTitle: string,
  sourceType: string,
  sourceDate: string
): { text: string; guestOnly: string; sourceTitle: string; sourceType: string; sourceDate: string }[] {
  const words = text.split(/\s+/);
  const guestWords = guestOnly.split(/\s+/);
  const chunks: { text: string; guestOnly: string; sourceTitle: string; sourceType: string; sourceDate: string }[] = [];

  for (let i = 0; i < words.length; i += CHUNK_WORDS) {
    const chunkText = words.slice(i, i + CHUNK_WORDS).join(" ");
    // Proportional slice of guest-only text
    const gStart = Math.floor((i / words.length) * guestWords.length);
    const gEnd = Math.floor(((i + CHUNK_WORDS) / words.length) * guestWords.length);
    const chunkGuest = guestWords.slice(gStart, gEnd).join(" ");

    chunks.push({
      text: chunkText,
      guestOnly: chunkGuest || chunkText,
      sourceTitle,
      sourceType,
      sourceDate,
    });
  }
  return chunks;
}

function parseFrontmatter(content: string): { meta: Record<string, any>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta: Record<string, any> = {};
  const lines = match[1].split("\n");
  for (const line of lines) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) {
      let val = kv[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("[")) {
        try {
          meta[kv[1]] = JSON.parse(val);
        } catch {
          meta[kv[1]] = val;
        }
      } else {
        meta[kv[1]] = val;
      }
    }
  }
  return { meta, body: match[2] };
}

function main() {
  console.log("Reading index.json...");
  const index: Index = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "index.json"), "utf-8"));

  fs.mkdirSync(CHUNKS_DIR, { recursive: true });

  const people = new Map<string, PersonAccum>();

  function getOrCreate(name: string): PersonAccum {
    const slug = slugify(name);
    if (!people.has(slug)) {
      people.set(slug, {
        slug,
        name,
        title: "",
        description: "",
        tags: new Set(),
        sources: [],
        totalWords: 0,
        chunks: [],
      });
    }
    return people.get(slug)!;
  }

  // Process podcasts
  console.log(`Processing ${index.podcasts.length} podcasts...`);
  for (const entry of index.podcasts) {
    const guestName = entry.guest;
    if (!guestName) continue;

    const filePath = path.join(DATA_DIR, entry.filename);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, "utf-8");
    const { body } = parseFrontmatter(content);

    const person = getOrCreate(guestName);
    const extractedTitle = extractTitleFromPodcastTitle(entry.title);
    if (extractedTitle && !person.title) {
      person.title = extractedTitle;
    }
    if (entry.description && !person.description) {
      person.description = entry.description;
    }
    for (const tag of entry.tags || []) {
      person.tags.add(tag);
    }
    person.sources.push({
      type: "podcast",
      title: entry.title,
      date: entry.date,
      filename: entry.filename,
    });

    const guestOnly = extractGuestSpeech(body, guestName);
    const chunks = splitIntoChunks(body, guestOnly, entry.title, "podcast", entry.date);
    person.chunks.push(...chunks);
    person.totalWords += entry.word_count;
  }

  // Process newsletters
  console.log(`Processing ${index.newsletters.length} newsletters...`);
  for (const entry of index.newsletters) {
    const guestAuthor = entry.subtitle ? extractGuestAuthor(entry.subtitle) : null;

    const filePath = path.join(DATA_DIR, entry.filename);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, "utf-8");
    const { body } = parseFrontmatter(content);

    if (guestAuthor) {
      // Guest newsletter — attribute to the guest
      const person = getOrCreate(guestAuthor);
      if (!person.title) person.title = "Newsletter guest author";
      for (const tag of entry.tags || []) {
        person.tags.add(tag);
      }
      person.sources.push({
        type: "newsletter",
        title: entry.title,
        date: entry.date,
        filename: entry.filename,
      });
      const chunks = splitIntoChunks(body, body, entry.title, "newsletter", entry.date);
      person.chunks.push(...chunks);
      person.totalWords += entry.word_count;
    } else {
      // Lenny's own newsletter — attribute to Lenny
      const person = getOrCreate("Lenny Rachitsky");
      if (!person.title) person.title = "Author of Lenny's Newsletter & Podcast";
      for (const tag of entry.tags || []) {
        person.tags.add(tag);
      }
      person.sources.push({
        type: "newsletter",
        title: entry.title,
        date: entry.date,
        filename: entry.filename,
      });
      const chunks = splitIntoChunks(body, body, entry.title, "newsletter", entry.date);
      person.chunks.push(...chunks);
      person.totalWords += entry.word_count;
    }
  }

  // Write chunk files
  console.log("Writing chunk files...");
  let totalChunks = 0;
  for (const [, person] of people) {
    for (let i = 0; i < person.chunks.length; i++) {
      const chunk = person.chunks[i];
      const chunkFile = {
        personSlug: person.slug,
        personName: person.name,
        chunkIndex: i,
        sourceTitle: chunk.sourceTitle,
        sourceType: chunk.sourceType,
        sourceDate: chunk.sourceDate,
        text: chunk.text,
        guestOnly: chunk.guestOnly,
        wordCount: chunk.text.split(/\s+/).length,
      };
      fs.writeFileSync(
        path.join(CHUNKS_DIR, `${person.slug}-${i}.json`),
        JSON.stringify(chunkFile)
      );
      totalChunks++;
    }
  }

  // Write people.json (full)
  const peopleArray = Array.from(people.values()).map((p) => ({
    slug: p.slug,
    name: p.name,
    title: p.title,
    description: p.description,
    tags: Array.from(p.tags),
    sources: p.sources,
    totalWords: p.totalWords,
    chunkCount: p.chunks.length,
  }));
  peopleArray.sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(path.join(OUT_DIR, "people.json"), JSON.stringify(peopleArray, null, 2));

  // Write people-meta.json (compact for Claude prompt)
  const peopleMeta = peopleArray.map((p) => ({
    slug: p.slug,
    name: p.name,
    title: p.title,
    tags: p.tags,
    description: p.description,
  }));
  fs.writeFileSync(path.join(OUT_DIR, "people-meta.json"), JSON.stringify(peopleMeta));

  console.log(`\nDone!`);
  console.log(`  People: ${peopleArray.length}`);
  console.log(`  Chunks: ${totalChunks}`);
  console.log(`  people-meta.json: ${(fs.statSync(path.join(OUT_DIR, "people-meta.json")).size / 1024).toFixed(1)}KB`);
}

main();

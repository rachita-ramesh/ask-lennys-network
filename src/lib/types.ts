export interface Person {
  slug: string;
  name: string;
  title: string;
  description: string;
  tags: string[];
  sources: Source[];
  totalWords: number;
  chunkCount: number;
}

export interface Source {
  type: "podcast" | "newsletter";
  title: string;
  date: string;
  filename: string;
}

export interface PersonMeta {
  slug: string;
  name: string;
  title: string;
  tags: string[];
  description: string;
}

export interface Chunk {
  personSlug: string;
  personName: string;
  chunkIndex: number;
  sourceTitle: string;
  sourceType: "podcast" | "newsletter";
  sourceDate: string;
  text: string;
  guestOnly: string;
  wordCount: number;
}

export interface Suggestion {
  person: Person;
  reason: string;
}

export interface DissentResult {
  dissenter: Person;
  point: string;
  quote: string;
}

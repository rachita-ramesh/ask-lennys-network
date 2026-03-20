import { Person } from "./types";

export interface PRDSection {
  id: string;
  heading: string | null;
  content: string;
  index: number;
}

export interface PRDImage {
  id: string;
  src: string;
  alt: string;
}

export interface ParsedPRD {
  title: string;
  sections: PRDSection[];
  rawText: string;
  images: PRDImage[];
}

export interface PRDComment {
  id: string;
  sectionId: string;
  highlightText: string;
  expert: Person;
  content: string;
  timestamp: number;
  parentId: string | null;
}

export type ExpertReviewStatus = "pending" | "streaming" | "done" | "error";

export interface ExpertReview {
  expert: Person;
  reason: string;
  status: ExpertReviewStatus;
  comments: PRDComment[];
}

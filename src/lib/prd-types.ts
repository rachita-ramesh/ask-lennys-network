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

export interface PDFPageImage {
  pageIndex: number;
  imageDataUrl: string;
  width: number;
  height: number;
}

export interface ParsedPRD {
  title: string;
  sections: PRDSection[];
  rawText: string;
  images: PRDImage[];
  sourceType: "pdf" | "docx";
  pageImages?: PDFPageImage[];
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

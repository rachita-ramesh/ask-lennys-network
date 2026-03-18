import fs from "fs";
import path from "path";
import { Person, PersonMeta } from "./types";

const DATA_DIR = path.join(process.cwd(), "public/data");

let _people: Person[] | null = null;
let _peopleMeta: PersonMeta[] | null = null;
let _peopleMap: Map<string, Person> | null = null;

export function getAllPeople(): Person[] {
  if (!_people) {
    _people = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "people.json"), "utf-8"));
  }
  return _people!;
}

export function getPeopleMeta(): PersonMeta[] {
  if (!_peopleMeta) {
    _peopleMeta = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "people-meta.json"), "utf-8"));
  }
  return _peopleMeta!;
}

export function getPeopleMetaString(): string {
  return fs.readFileSync(path.join(DATA_DIR, "people-meta.json"), "utf-8");
}

export function getPersonBySlug(slug: string): Person | undefined {
  if (!_peopleMap) {
    _peopleMap = new Map(getAllPeople().map((p) => [p.slug, p]));
  }
  return _peopleMap.get(slug);
}

export function searchPeople(query: string): Person[] {
  const q = query.toLowerCase();
  return getAllPeople().filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q))
  );
}

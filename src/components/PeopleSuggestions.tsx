"use client";
import { Suggestion, Person } from "@/lib/types";
import PersonCard from "./PersonCard";

interface Props {
  suggestions: Suggestion[];
  onSelect: (person: Person) => void;
}

export default function PeopleSuggestions({ suggestions, onSelect }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <section className="w-full animate-fade-up delay-4">
      <div style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "2rem",
        gap: "1rem",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#5F6854",
        }}>
          Best Matches
        </span>
        <div style={{
          flex: 1,
          height: "1px",
          background: "rgba(42, 49, 34, 0.15)",
        }} />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "1.5rem",
      }}>
        {suggestions.map((s) => (
          <PersonCard
            key={s.person.slug}
            person={s.person}
            reason={s.reason}
            onClick={() => onSelect(s.person)}
          />
        ))}
      </div>
    </section>
  );
}

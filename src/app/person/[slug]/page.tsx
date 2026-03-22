import Header from "@/components/Header";
import { Person } from "@/lib/types";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import PersonQuestion from "./PersonQuestion";

async function getPerson(slug: string): Promise<Person | undefined> {
  const data = fs.readFileSync(
    path.join(process.cwd(), "public/data/people.json"),
    "utf-8"
  );
  const people: Person[] = JSON.parse(data);
  return people.find((p) => p.slug === slug);
}

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#D45D48", "#5F6854", "#8B7355", "#6B8E7B", "#9B6B5E", "#7B8471", "#A67B5B"];
  return colors[Math.abs(hash) % colors.length];
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export default async function PersonPage({
  params,
}: {
  params: { slug: string };
}) {
  const person = await getPerson(params.slug);
  if (!person) notFound();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
    }}>
      <Header />
      <div style={{ width: "100%", maxWidth: "740px", margin: "0 auto", padding: "0 clamp(1rem, 4vw, 2rem)" }}>

        <main>
          <Link
            href="/browse"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#D45D48",
              textDecoration: "none",
              display: "inline-block",
              marginBottom: "1rem",
            }}
          >
            &larr; Back to browse
          </Link>

          {/* Person profile card */}
          <div style={{
            border: "1px solid rgba(42, 49, 34, 0.15)",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.3)",
            padding: "clamp(1rem, 3vw, 2rem)",
            marginBottom: "1.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: avatarColor(person.name),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 600,
                fontSize: "1.25rem",
                flexShrink: 0,
              }}>
                {initials(person.name)}
              </div>
              <div>
                <h1 style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(1.5rem, 4vw, 2rem)",
                  fontWeight: 400,
                  color: "#2A3122",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}>
                  {person.name}
                </h1>
                {person.title && (
                  <p style={{
                    fontSize: "0.9rem",
                    color: "#5F6854",
                    fontFamily: "var(--font-sans)",
                    marginTop: "0.25rem",
                  }}>
                    {person.title}
                  </p>
                )}
              </div>
            </div>

            {person.description && (
              <p style={{ fontSize: "0.9rem", color: "#5F6854", lineHeight: 1.6, marginBottom: "1rem" }}>
                {person.description}
              </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {person.tags.map((tag) => (
                <span key={tag} style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#5F6854",
                  border: "1px solid rgba(42, 49, 34, 0.15)",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                }}>
                  {tag}
                </span>
              ))}
            </div>

            <div style={{ borderTop: "1px solid rgba(42, 49, 34, 0.1)", paddingTop: "1.25rem" }}>
              <h3 style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#5F6854",
                marginBottom: "0.75rem",
              }}>
                Sources ({person.sources.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {person.sources.map((source, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.9rem",
                    color: "#5F6854",
                  }}>
                    <span>{source.type === "podcast" ? "\uD83C\uDFA4" : "\uD83D\uDCDD"}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {source.title}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      color: "rgba(95, 104, 84, 0.5)",
                      flexShrink: 0,
                    }}>
                      {source.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ask section */}
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
              gap: "1rem",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#5F6854",
              }}>
                Ask {person.name.split(" ")[0]}
              </span>
              <div style={{ flex: 1, height: "1px", background: "rgba(42, 49, 34, 0.15)" }} />
            </div>
            <PersonQuestion person={person} />
          </div>
        </main>
      </div>
    </div>
  );
}

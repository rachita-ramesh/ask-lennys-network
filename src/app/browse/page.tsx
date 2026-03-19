import Header from "@/components/Header";
import PersonBrowser from "@/components/PersonBrowser";
import { Person } from "@/lib/types";
import fs from "fs";
import path from "path";

async function getPeople(): Promise<Person[]> {
  const data = fs.readFileSync(
    path.join(process.cwd(), "public/data/people.json"),
    "utf-8"
  );
  return JSON.parse(data);
}

export default async function BrowsePage() {
  const people = await getPeople();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
    }}>
      <Header />
      <div style={{ width: "100%", maxWidth: "1120px", margin: "0 auto", padding: "0 2rem", position: "relative", zIndex: 1 }}>
        <main>
          {/* Page header — centered */}
          <div className="animate-fade-up delay-1" style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#D45D48",
              marginBottom: "1.5rem",
              display: "block",
            }}>
              Expert Directory
            </span>
            <h1 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(3.5rem, 6vw, 5.5rem)",
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              marginBottom: "1.5rem",
              color: "#2A3122",
            }}>
              Meet the <i style={{ fontStyle: "italic", paddingRight: "0.1em" }}>Experts</i>
            </h1>
            <p style={{
              fontSize: "1.125rem",
              color: "#5F6854",
              fontFamily: "var(--font-sans)",
              maxWidth: "500px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}>
              Explore world-class product leaders from Lenny&apos;s Podcast and Newsletter.
            </p>
          </div>

          <PersonBrowser people={people} />
        </main>
      </div>
    </div>
  );
}

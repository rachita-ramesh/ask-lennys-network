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
            <h1 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "4rem",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              marginBottom: "2rem",
              color: "#2A3122",
            }}>
              Browse <em style={{ fontStyle: "italic" }}>Expert</em> Directory
            </h1>
          </div>

          <PersonBrowser people={people} />
        </main>
      </div>
    </div>
  );
}

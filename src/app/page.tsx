"use client";
import Header from "@/components/Header";
import PRDReviewLayout from "@/components/PRDReviewLayout";

export default function Home() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
    }}>
      <div style={{ padding: "0.5rem 2rem 0", flexShrink: 0 }}>
        <Header compact />
      </div>
      <PRDReviewLayout />
    </div>
  );
}

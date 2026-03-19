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
      <Header />
      <PRDReviewLayout />
    </div>
  );
}

"use client";
import Header from "@/components/Header";
import PRDReviewLayout from "@/components/PRDReviewLayout";
import AuthGate from "@/components/AuthGate";

export default function ReviewPage() {
  return (
    <AuthGate>
      <div style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        <Header />
        <PRDReviewLayout />
      </div>
    </AuthGate>
  );
}

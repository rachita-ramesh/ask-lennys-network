"use client";
import Header from "@/components/Header";
import PRDReviewLayout from "@/components/PRDReviewLayout";
import AuthGate from "@/components/AuthGate";

export default function ReviewPage() {
  return (
    <AuthGate>
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}>
        <Header />
        <PRDReviewLayout />
      </div>
    </AuthGate>
  );
}

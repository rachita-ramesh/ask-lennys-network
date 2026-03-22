"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const [buttonHovered, setButtonHovered] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {!isMobile && (
        <>
          <div style={{ position: "absolute", top: "-15%", left: "-10%", width: "50%", height: "60%", backgroundColor: "#D45D48", opacity: 0.03, filter: "blur(120px)", borderRadius: "50%", pointerEvents: "none", mixBlendMode: "multiply" }} />
          <div style={{ position: "absolute", bottom: "-15%", right: "-5%", width: "60%", height: "70%", backgroundColor: "#5F6854", opacity: 0.04, filter: "blur(150px)", borderRadius: "50%", pointerEvents: "none", mixBlendMode: "multiply" }} />
          <div style={{ position: "absolute", inset: 0, zIndex: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: "900px", height: "650px", border: "1px solid rgba(42, 49, 34, 0.08)", borderRadius: "40px", transform: "rotate(-2deg) scale(1.05)", opacity: 0.6 }} />
            <div style={{ position: "absolute", width: "880px", height: "630px", border: "1px solid rgba(255, 255, 255, 0.5)", background: "rgba(255, 255, 255, 0.05)", borderRadius: "40px", transform: "rotate(1.5deg)", opacity: 0.8, backdropFilter: "blur(2px)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }} />
          </div>
        </>
      )}

      {/* Header */}
      <header
        style={{
          position: "absolute",
          top: "24px",
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="none"
            stroke="#D45D48"
            strokeWidth="2"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.5rem",
              fontWeight: 400,
              color: "#2A3122",
              letterSpacing: "-0.02em",
            }}
          >
            Lenny&apos;s Network
          </span>
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          width: "100%",
          maxWidth: "1024px",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          zIndex: 10,
          position: "relative",
          paddingTop: isMobile ? "80px" : "32px",
        }}
      >
        <div
          style={{
            maxWidth: "768px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: isMobile ? "2.25rem" : "clamp(3.5rem, 6vw, 5.5rem)",
              lineHeight: 1,
              color: "#2A3122",
              letterSpacing: "-0.03em",
              marginBottom: "1rem",
              fontWeight: 400,
            }}
          >
            Get{" "}
            <i style={{ fontStyle: "italic", paddingRight: "0.1em" }}>
              expert feedback
            </i>
            <br />
            on your PRD
          </h1>

          <p
            style={{
              fontSize: "1.125rem",
              color: "#5F6854",
              fontFamily: "var(--font-sans)",
              maxWidth: "500px",
              margin: "0 auto",
              lineHeight: 1.6,
              marginBottom: "2.5rem",
            }}
          >
            Upload your product requirements document and get specific,
            actionable feedback from world-class product leaders.
          </p>
        </div>

        {/* CTA Button */}
        <button
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "16px 40px",
            backgroundColor: "#FFFFFF",
            borderRadius: "9999px",
            color: "#2A3122",
            fontWeight: 500,
            fontFamily: "var(--font-sans)",
            transition: "all 0.3s",
            boxShadow: buttonHovered
              ? "0 12px 30px -4px rgba(0,0,0,0.1), 0 4px 10px -2px rgba(0,0,0,0.05)"
              : "0 2px 10px -2px rgba(0,0,0,0.06), 0 1px 4px -1px rgba(0,0,0,0.03)",
            transform: buttonHovered ? "translateY(-2px)" : "translateY(0)",
            border: buttonHovered
              ? "1px solid rgba(42, 49, 34, 0.2)"
              : "1px solid rgba(42, 49, 34, 0.1)",
            cursor: "pointer",
            fontSize: "17px",
            letterSpacing: "0.025em",
          }}
          onMouseEnter={() => setButtonHovered(true)}
          onMouseLeave={() => setButtonHovered(false)}
          onClick={() => signIn("google", { callbackUrl: "/review" })}
        >
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        {/* Feature cards */}
        <div
          style={{
            width: "100%",
            marginTop: "3rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(42, 49, 34, 0.1)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
              maxWidth: "896px",
              margin: "0 auto",
            }}
          >
            <FeatureCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  <path d="M5 3v4" /><path d="M19 17v4" />
                  <path d="M3 5h4" /><path d="M17 19h4" />
                </svg>
              }
              title="3 Free Reviews"
              description="Get 3 PRD reviews to start with no commitment."
              iconBg="rgba(95, 104, 84, 0.1)"
              iconBorder="rgba(95, 104, 84, 0.2)"
              iconColor="#5F6854"
            />
            <FeatureCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
                  <path d="m21 2-9.6 9.6" />
                  <circle cx="7.5" cy="15.5" r="5.5" />
                </svg>
              }
              title="Unlimited Use"
              description="Bring your own Anthropic API key for unlimited access."
              iconBg="rgba(212, 93, 72, 0.1)"
              iconBorder="rgba(212, 93, 72, 0.2)"
              iconColor="#D45D48"
            />
            <FeatureCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              }
              title="Fully Secure"
              description="Your Anthropic API key is never stored on our servers."
              iconBg="rgba(42, 49, 34, 0.05)"
              iconBorder="rgba(42, 49, 34, 0.1)"
              iconColor="#5F6854"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  iconBg,
  iconBorder,
  iconColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        boxShadow: "0 4px 24px -8px rgba(0, 0, 0, 0.03), inset 0 0 0 1px rgba(255, 255, 255, 0.4)",
        borderRadius: "16px",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        textAlign: "center" as const,
        transition: "all 0.3s",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
          background: iconBg,
          border: `1px solid ${iconBorder}`,
          color: iconColor,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 500,
          color: "#2A3122",
          marginBottom: "0.375rem",
          fontSize: "1rem",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "0.875rem",
          lineHeight: 1.6,
          color: "#5F6854",
        }}
      >
        {description}
      </p>
    </div>
  );
}

"use client";
import { useState } from "react";

interface Props {
  onSuccess: () => void;
}

export default function ApiKeyForm({ onSuccess }: Props) {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = apiKey.trim();

    if (!key) return;

    if (!key.startsWith("sk-ant-")) {
      setError("API key should start with sk-ant-");
      return;
    }

    localStorage.setItem("anthropic-api-key", key);
    onSuccess();
  };

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        padding: "2.5rem",
        background: "#fff",
        borderRadius: "16px",
        border: "1px solid rgba(42, 49, 34, 0.1)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.5rem",
          fontWeight: 400,
          color: "#2A3122",
          marginBottom: "0.5rem",
        }}
      >
        Add your API key
      </h2>
      <p
        style={{
          fontSize: "0.9rem",
          color: "#78716c",
          lineHeight: 1.6,
          marginBottom: "1.5rem",
        }}
      >
        You&apos;ve used your 3 free reviews. Add your own Anthropic API key for
        unlimited reviews.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-ant-..."
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            border: "1px solid rgba(42, 49, 34, 0.15)",
            fontSize: "0.9rem",
            fontFamily: "var(--font-mono)",
            color: "#2A3122",
            background: "rgba(255,255,255,0.5)",
            outline: "none",
            marginBottom: "1rem",
            boxSizing: "border-box",
          }}
        />

        {error && (
          <p style={{ fontSize: "0.85rem", color: "#D45D48", marginBottom: "1rem" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!apiKey.trim()}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "100px",
            border: "none",
            background: !apiKey.trim() ? "rgba(212, 93, 72, 0.4)" : "#D45D48",
            color: "#fff",
            fontSize: "0.9rem",
            fontWeight: 500,
            cursor: !apiKey.trim() ? "not-allowed" : "pointer",
            transition: "background 0.2s ease",
          }}
        >
          Save & Continue
        </button>
      </form>

      {/* Trust messaging */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          background: "rgba(107, 142, 123, 0.06)",
          borderRadius: "8px",
          border: "1px solid rgba(107, 142, 123, 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B8E7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "2px", flexShrink: 0 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <p style={{ fontSize: "0.8rem", color: "#57534e", lineHeight: 1.5, margin: 0 }}>
            <strong style={{ color: "#2A3122" }}>Your key never leaves your browser.</strong>{" "}
            It&apos;s stored in your browser&apos;s local storage and sent directly with each request. We never save or log it on our servers.
          </p>
        </div>
        <p style={{ fontSize: "0.75rem", color: "#a8a29e", margin: "0.5rem 0 0 22px" }}>
          You can revoke this key anytime at{" "}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#D45D48", textDecoration: "none" }}
          >
            console.anthropic.com
          </a>
        </p>
      </div>
    </div>
  );
}

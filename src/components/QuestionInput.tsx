"use client";
import { useState, FormEvent } from "react";

interface Props {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  initialValue?: string;
  placeholder?: string;
}

export default function QuestionInput({ onSubmit, isLoading, initialValue = "", placeholder }: Props) {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (q && !isLoading) {
      onSubmit(q);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full" style={{ maxWidth: "640px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          background: isFocused ? "#fff" : "rgba(255, 255, 255, 0.3)",
          border: `1px solid ${isFocused ? "rgba(212, 93, 72, 0.6)" : "rgba(42, 49, 34, 0.15)"}`,
          borderRadius: "100px",
          padding: "0.375rem",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: isFocused
            ? "0 0 0 4px rgba(212, 93, 72, 0.1), inset 0 2px 4px rgba(0,0,0,0.01)"
            : "inset 0 2px 4px rgba(0,0,0,0.02)",
        }}
      >
        <svg
          style={{
            width: "20px",
            height: "20px",
            position: "absolute",
            left: "1.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#5F6854",
            pointerEvents: "none",
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || "E.g. How to structure a growth team..."}
          aria-label="Search questions"
          disabled={isLoading}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            padding: "1rem 1rem 1rem 3.5rem",
            fontFamily: "var(--font-sans)",
            fontSize: "1.125rem",
            color: "#2A3122",
            outline: "none",
            caretColor: "#D45D48",
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            backgroundColor: isLoading ? "#ccc" : btnHovered ? "#BF4D39" : "#D45D48",
            color: "#fff",
            border: "none",
            borderRadius: "100px",
            padding: "0 2rem",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: "1rem",
            cursor: isLoading || !value.trim() ? "not-allowed" : "pointer",
            transition: "background-color 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            transform: btnHovered ? "scale(0.98)" : "scale(1)",
            opacity: !value.trim() && !isLoading ? 0.5 : 1,
          }}
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
}

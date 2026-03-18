import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ask Lenny's Network",
  description: "Search thousands of vetted answers, frameworks, and advice from world-class product leaders.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}

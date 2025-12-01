// ============================================================================
// FILE: src/app/layout.tsx
// ============================================================================
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
// Remove createClient/redirect import to keep layout lightweight
// We will handle auth state in Client Components or specific Page Server Components

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Halo | Research Intelligence",
  description: "Self-correcting research engine with 3D knowledge graph.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased bg-black text-gray-100 overflow-hidden selection:bg-cyan-500/30`}>
        {children}
      </body>
    </html>
  );
}

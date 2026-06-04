import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { AIAssistantShell } from "@/components/dashboard/AIAssistantShell";

export const metadata: Metadata = {
  title: "YT Research Dashboard",
  description: "KOL Research Campaign Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50 antialiased">
        <Sidebar />
        <main className="ml-56 min-h-full">
          <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
        </main>
        <AIAssistantShell />
      </body>
    </html>
  );
}

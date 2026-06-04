"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { openAIAssistant } from "@/components/dashboard/AIAssistantShell";

const nav = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/campaigns",
    label: "Campaigns",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-200 flex flex-col z-10">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">YT</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">YouthsToday</div>
            <div className="text-xs text-gray-400">Research Portal</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* AI Assistant trigger */}
      <div className="px-3 pb-3">
        <button
          onClick={openAIAssistant}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all group"
        >
          <span className="text-base group-hover:scale-110 transition-transform">✨</span>
          <span>AI Assistant</span>
          <span className="ml-auto text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Beta</span>
        </button>
        <p className="text-[10px] text-gray-400 mt-1.5 px-1 leading-snug">
          Ask questions or draft copywriting
        </p>
      </div>

      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">KOL Research Dashboard</p>
      </div>
    </aside>
  );
}

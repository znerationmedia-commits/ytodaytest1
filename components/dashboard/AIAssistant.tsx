"use client";
import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "Who has the most ASAP campaigns?",
  "List campaigns pending Zynn approval",
  "Draft an outreach DM for a beauty KOL",
  "How many active campaigns is Anis handling?",
];

interface AIAssistantProps {
  open: boolean;
  onClose: () => void;
}

export function AIAssistant({ open, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to bottom when a new message arrives
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  // Focus the input when the drawer opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  async function send(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Unknown error");
      setMessages([...next, { role: "assistant", content: json.reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to reach AI";
      setError(msg);
      setMessages([
        ...next,
        { role: "assistant", content: `⚠️ Error: ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-[400px] max-w-[90vw] bg-white border-r border-gray-200 shadow-xl z-40 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="AI Assistant"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              ✨
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">AI Assistant</h3>
              <p className="text-[10px] text-gray-500 leading-tight">Powered by Gemini · live campaign data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-white/70"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/40">
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed">
                  👋 Hi! Ask me anything about your campaigns, or have me draft copywriting for outreach.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  I can see all {""}<span className="font-semibold">live data</span> from your Research sheet.
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Quick starts</p>
                <div className="space-y-1.5">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="block w-full text-left text-sm text-gray-700 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} />
          ))}

          {loading && (
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse [animation-delay:150ms]"></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse [animation-delay:300ms]"></span>
              <span className="text-xs text-gray-500 ml-1">Thinking…</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 p-3 bg-white">
          {error && (
            <div className="mb-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{error}</div>
          )}
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything…"
              rows={1}
              disabled={loading}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none max-h-32 disabled:opacity-50"
              style={{ minHeight: 38 }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setError(null); }}
              className="text-[10px] text-gray-400 hover:text-gray-700 mt-2"
            >
              Clear chat
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-indigo-600 text-white text-sm px-3.5 py-2 rounded-2xl rounded-br-md whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] bg-white border border-gray-200 text-sm text-gray-800 px-3.5 py-2.5 rounded-2xl rounded-bl-md whitespace-pre-wrap leading-relaxed">
        <FormattedReply text={content} />
      </div>
    </div>
  );
}

/**
 * Light markdown rendering — handles **bold**, `code`, and bullet lines.
 * Avoids pulling in a full markdown library.
 */
function FormattedReply({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-indigo-400">•</span>
              <span className="flex-1">{renderInline(trimmed.slice(2))}</span>
            </div>
          );
        }
        if (trimmed === "") return <div key={i} className="h-1" />;
        return <div key={i}>{renderInline(line)}</div>;
      })}
    </>
  );
}

function renderInline(text: string): React.ReactNode {
  // Replace **bold** and `code`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++} className="font-semibold text-gray-900">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      parts.push(<code key={key++} className="bg-gray-100 text-indigo-700 text-xs px-1 py-0.5 rounded">{token.slice(1, -1)}</code>);
    }
    lastIdx = match.index + token.length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
}

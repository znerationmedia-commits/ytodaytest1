"use client";
import { useEffect, useState } from "react";
import { AIAssistant } from "./AIAssistant";

const EVENT_NAME = "open-ai-assistant";

/** Trigger button — drop into any nav. Dispatches the open event. */
export function openAIAssistant() {
  window.dispatchEvent(new Event(EVENT_NAME));
}

/** Mount this once in the root layout. Listens for the global open event. */
export function AIAssistantShell() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  return <AIAssistant open={open} onClose={() => setOpen(false)} />;
}

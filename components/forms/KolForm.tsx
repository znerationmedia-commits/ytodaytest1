"use client";
import { useState } from "react";
import type { KolEntry } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { FormField } from "./FormField";
import { SelectField } from "./SelectField";

type KolFormData = Omit<KolEntry, "rowIndex" | "no">;

interface KolFormProps {
  onSubmit: (data: KolFormData) => Promise<void>;
  onCancel: () => void;
  initial?: Partial<KolFormData>;
}

const empty: KolFormData = {
  name: "", profileLink: "", followers: "",
  interestCheckClient: "", interestCheckKol: "",
  ytRemarks: "", clientRemarks: "",
};

const interestOptions = [
  { value: "", label: "— Not set —" },
  { value: "YES", label: "YES" },
  { value: "NO", label: "NO" },
];

export function KolForm({ onSubmit, onCancel, initial }: KolFormProps) {
  const [form, setForm] = useState<KolFormData>({ ...empty, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof KolFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
      <FormField label="Name" required value={form.name} onChange={set("name")} placeholder="KOL / Seeder name" />
      <FormField label="TikTok Profile Link" value={form.profileLink} onChange={set("profileLink")} placeholder="https://www.tiktok.com/@username" />
      <FormField label="Followers" type="number" value={form.followers} onChange={set("followers")} placeholder="e.g. 4000" />
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Interest Check (Client)" value={form.interestCheckClient} onChange={set("interestCheckClient")} options={interestOptions} />
        <SelectField label="Interest Check (KOL)" value={form.interestCheckKol} onChange={set("interestCheckKol")} options={interestOptions} />
      </div>
      <FormField label="YT Remarks" value={form.ytRemarks} onChange={set("ytRemarks")} placeholder="Internal notes" />
      <FormField label="Client Remarks" value={form.clientRemarks} onChange={set("clientRemarks")} placeholder="Client feedback" />
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" loading={loading}>Add KOL</Button>
      </div>
    </form>
  );
}

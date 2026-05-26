"use client";
import { useState, useEffect } from "react";
import { getSettings, updateSettings } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { Spinner } from "@/components/ui/Spinner";
import { PIC_LIST, BD_LIST } from "@/lib/constants";

function ListEditor({
  title,
  subtitle,
  items,
  onSave,
  saving,
}: {
  title: string;
  subtitle: string;
  items: string[];
  onSave: (updated: string[]) => Promise<void>;
  saving: boolean;
}) {
  const [list, setList] = useState<string[]>(items);
  const [newName, setNewName] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");

  useEffect(() => { setList(items); }, [items]);

  function add() {
    const name = newName.trim();
    if (!name || list.includes(name)) return;
    setList((l) => [...l, name]);
    setNewName("");
  }

  function remove(i: number) {
    setList((l) => l.filter((_, idx) => idx !== i));
  }

  function startEdit(i: number) {
    setEditIdx(i);
    setEditVal(list[i]);
  }

  function confirmEdit() {
    if (editIdx === null) return;
    const val = editVal.trim();
    if (!val) return;
    setList((l) => l.map((item, i) => (i === editIdx ? val : item)));
    setEditIdx(null);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>

      <ul className="space-y-2 mb-4">
        {list.map((name, i) => (
          <li key={i} className="flex items-center gap-2">
            {editIdx === i ? (
              <>
                <input
                  className="flex-1 text-sm border border-indigo-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
                  autoFocus
                />
                <Button size="sm" onClick={confirmEdit}>Save</Button>
                <Button size="sm" variant="secondary" onClick={() => setEditIdx(null)}>Cancel</Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                  {name}
                </span>
                <button
                  onClick={() => startEdit(i)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(i)}
                  className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                >
                  Remove
                </button>
              </>
            )}
          </li>
        ))}
        {list.length === 0 && (
          <li className="text-sm text-gray-400 italic">No entries yet</li>
        )}
      </ul>

      {/* Add new */}
      <div className="flex gap-2 mb-5">
        <input
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Add new name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <Button size="sm" variant="secondary" onClick={add} disabled={!newName.trim()}>
          + Add
        </Button>
      </div>

      <Button size="sm" loading={saving} onClick={() => onSave(list)}>
        Save Changes
      </Button>
    </div>
  );
}

export default function SettingsPage() {
  const [picList, setPicList] = useState<string[]>([...PIC_LIST]);
  const [bdList, setBdList] = useState<string[]>([...BD_LIST]);
  const [loading, setLoading] = useState(true);
  const [savingPic, setSavingPic] = useState(false);
  const [savingBd, setSavingBd] = useState(false);
  const { toasts, showToast, dismissToast } = useToast();

  useEffect(() => {
    getSettings()
      .then((s) => { setPicList(s.picList); setBdList(s.bdList); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSavePic(updated: string[]) {
    setSavingPic(true);
    try {
      await updateSettings({ picList: updated });
      setPicList(updated);
      showToast("Intern list saved");
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setSavingPic(false);
    }
  }

  async function handleSaveBd(updated: string[]) {
    setSavingBd(true);
    try {
      await updateSettings({ bdList: updated });
      setBdList(updated);
      showToast("BD list saved");
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setSavingBd(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-gray-500">
        <Spinner /> Loading settings...
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage team members and BD names used across the dashboard.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ListEditor
          title="Research Interns (PIC)"
          subtitle="These names appear in all PIC assignment dropdowns."
          items={picList}
          onSave={handleSavePic}
          saving={savingPic}
        />
        <ListEditor
          title="BD Names"
          subtitle="These names appear in campaign filters and forms."
          items={bdList}
          onSave={handleSaveBd}
          saving={savingBd}
        />
      </div>
    </>
  );
}

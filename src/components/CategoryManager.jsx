import { useState, useEffect, useCallback } from "react";

const STORE_URL_KEY = "rikky_store_url";

const DEFAULT_CATEGORIES = [
  { id: "all",      label: "All",           short: "All"      },
  { id: "perfume",  label: "Perfume",        short: "Perfume"  },
  { id: "spray",    label: "Body Spray",     short: "Spray"    },
  { id: "roll-on",  label: "Roll On",        short: "Roll On"  },
  { id: "oil",      label: "Perfume Oil",    short: "Oil"      },
  { id: "diffuser", label: "Reed Diffuser",  short: "Diffuser" },
  { id: "gift-set", label: "Gift Set",       short: "Gift"     },
];

function toSlug(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}


export default function CategoryManager({ token, apiUrl }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [apiError, setApiError]     = useState("");
  const [status, setStatus]         = useState(null); // null | "saved" | "reset"
  const [editing, setEditing]       = useState(null);
  const [newForm, setNewForm]       = useState({ label: "", short: "", id: "" });
  const [storeUrl, setStoreUrl]     = useState(() => localStorage.getItem(STORE_URL_KEY) || "");
  const [urlInput, setUrlInput]     = useState(() => localStorage.getItem(STORE_URL_KEY) || "");
  const [urlSaved, setUrlSaved]     = useState(false);
  const [copied, setCopied]         = useState(false);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // ── Load categories from API ──────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch(`${apiUrl}/api/categories`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(Array.isArray(data) && data.length ? data : DEFAULT_CATEGORIES);
    } catch {
      setApiError("Could not reach the server. Showing defaults.");
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ── Save to API ───────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    setApiError("");
    try {
      const res = await fetch(`${apiUrl}/api/categories`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ categories }),
      });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data);
      setStatus("saved");
      setTimeout(() => setStatus(null), 2500);
    } catch {
      setApiError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!window.confirm("Reset to default categories? All custom categories will be lost.")) return;
    setSaving(true);
    setApiError("");
    try {
      const res = await fetch(`${apiUrl}/api/categories`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ categories: DEFAULT_CATEGORIES }),
      });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data);
      setStatus("reset");
      setTimeout(() => setStatus(null), 2500);
    } catch {
      setApiError("Failed to reset. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Store URL ─────────────────────────────────────────────
  const saveStoreUrl = () => {
    const url = urlInput.trim();
    localStorage.setItem(STORE_URL_KEY, url);
    setStoreUrl(url);
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2000);
  };

  // ── Export ────────────────────────────────────────────────
  const exportJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(categories, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Category editing ──────────────────────────────────────
  const moveUp = (i) => {
    if (i <= 1) return;
    setCategories((prev) => { const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; });
  };

  const moveDown = (i) => {
    if (i === 0 || i >= categories.length - 1) return;
    setCategories((prev) => { const a = [...prev]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a; });
  };

  const deleteCategory = (id) => {
    const cat = categories.find((c) => c.id === id);
    if (!window.confirm(`Delete "${cat?.label}" category?`)) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const startEdit = (cat) => setEditing({ id: cat.id, label: cat.label, short: cat.short || cat.label });

  const saveEdit = () => {
    if (!editing.label.trim()) return;
    setCategories((prev) =>
      prev.map((c) =>
        c.id === editing.id
          ? { ...c, label: editing.label.trim(), short: editing.short.trim() || editing.label.trim() }
          : c
      )
    );
    setEditing(null);
  };

  const handleNewLabelChange = (val) => {
    setNewForm((f) => ({ ...f, label: val, id: f.id || toSlug(val), short: f.short || val.split(" ")[0] }));
  };

  const addCategory = () => {
    if (!newForm.label.trim() || !newForm.id.trim()) return;
    const id = toSlug(newForm.id);
    if (categories.find((c) => c.id === id)) { alert(`A category with ID "${id}" already exists.`); return; }
    setCategories((prev) => [
      ...prev,
      { id, label: newForm.label.trim(), short: newForm.short.trim() || newForm.label.trim().split(" ")[0] },
    ]);
    setNewForm({ label: "", short: "", id: "" });
  };

  const saveButtonLabel = saving ? "Saving…" : status === "saved" ? "Saved ✓" : status === "reset" ? "Reset ✓" : "Save Changes";
  const saveButtonClass = saving
    ? "bg-[#6A0DAD]/50 text-white cursor-not-allowed"
    : status === "saved"
    ? "bg-green-600 text-white"
    : status === "reset"
    ? "bg-[#D4A373] text-white"
    : "bg-[#6A0DAD] text-white hover:bg-[#3B0A45]";

  return (
    <div>
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5 sm:px-6 sm:py-8 sm:space-y-6">

        {/* API error banner */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <p className="font-sans text-xs text-red-600">{apiError}</p>
            <button onClick={() => setApiError("")} className="text-red-300 hover:text-red-500 text-sm leading-none">✕</button>
          </div>
        )}

        {/* Page title + action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#3B0A45] tracking-wide">Categories</h1>
            <p className="font-sans text-[.54rem] uppercase tracking-[.16em] text-[#6A0DAD]/50 mt-1">
              Control the store's category filter tabs
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={exportJSON}
              className={`font-sans text-[.56rem] tracking-[.15em] uppercase px-4 py-2 rounded-lg transition-all border ${
                copied ? "bg-green-50 text-green-600 border-green-200" : "text-[#6A0DAD]/60 border-[#6A0DAD]/20 hover:bg-[#6A0DAD]/5"
              }`}
            >
              {copied ? "Copied ✓" : "Copy JSON"}
            </button>
            <button
              onClick={reset}
              disabled={saving || loading}
              className="font-sans text-[.56rem] tracking-[.15em] uppercase text-[#6A0DAD]/60 border border-[#6A0DAD]/20 px-4 py-2 rounded-lg hover:bg-[#6A0DAD]/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Reset
            </button>
            <button
              onClick={save}
              disabled={saving || loading}
              className={`font-sans text-[.56rem] tracking-[.15em] uppercase px-5 py-2 rounded-lg transition-all ${saveButtonClass}`}
            >
              {saveButtonLabel}
            </button>
          </div>
        </div>

        {/* ── Store website link ─────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#6A0DAD]/[.12] shadow-md overflow-hidden">
          <div className="px-5 py-3 border-b border-[#6A0DAD]/[.08] bg-[#FAF8FC]">
            <p className="font-sans text-[.54rem] uppercase tracking-[.24em] text-[#6A0DAD]/70">Store Website</p>
          </div>
          <div className="p-5">
            <div className="flex gap-3 items-end flex-wrap">
              <label className="flex-1 min-w-[200px]">
                <span className="block font-sans text-[.52rem] uppercase tracking-[.2em] text-[#6A0DAD]/60 mb-1.5">Website URL</span>
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveStoreUrl(); }}
                  className="w-full border border-[#6A0DAD]/20 rounded-xl px-3.5 py-2.5 font-sans text-sm text-[#3B0A45] focus:outline-none focus:border-[#6A0DAD] focus:ring-1 focus:ring-[#6A0DAD]/20 transition-all placeholder:text-gray-300"
                  placeholder="https://yourstore.com"
                />
              </label>
              <button
                onClick={saveStoreUrl}
                className={`font-sans text-[.56rem] tracking-[.15em] uppercase px-5 py-2.5 rounded-xl transition-all ${urlSaved ? "bg-green-600 text-white" : "bg-[#6A0DAD] text-white hover:bg-[#3B0A45]"}`}
              >
                {urlSaved ? "Saved ✓" : "Save URL"}
              </button>
              {storeUrl && (
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-[.56rem] tracking-[.15em] uppercase text-[#6A0DAD] border border-[#6A0DAD]/30 px-5 py-2.5 rounded-xl hover:bg-[#6A0DAD]/5 transition-colors flex items-center gap-1.5"
                >
                  Open Store <ExternalLinkIcon />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Category list ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#6A0DAD]/[.12] shadow-md overflow-hidden">
          <div className="px-5 py-3 border-b border-[#6A0DAD]/[.08] bg-[#FAF8FC] flex items-center justify-between">
            <p className="font-sans text-[.54rem] uppercase tracking-[.24em] text-[#6A0DAD]/70">
              Current Categories {!loading && `(${categories.length})`}
            </p>
            {!loading && (
              <p className="font-sans text-[.48rem] uppercase tracking-[.14em] text-[#6A0DAD]/40">
                Click label to edit · hover for delete
              </p>
            )}
          </div>

          {loading ? (
            <div className="px-5 py-10 flex items-center justify-center">
              <p className="font-sans text-[.58rem] uppercase tracking-[.2em] text-[#6A0DAD]/40 animate-pulse">Loading…</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#6A0DAD]/[.05]">
              {categories.map((cat, i) => (
                <li
                  key={cat.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAF8FC]/70 transition-colors group"
                >
                  <div className="flex flex-col gap-px shrink-0">
                    <button onClick={() => moveUp(i)} disabled={i <= 1} title="Move up"
                      className="text-[#6A0DAD]/30 hover:text-[#6A0DAD] disabled:opacity-10 disabled:cursor-default transition-colors text-[.6rem] leading-none py-0.5 px-1">▲</button>
                    <button onClick={() => moveDown(i)} disabled={i === 0 || i === categories.length - 1} title="Move down"
                      className="text-[#6A0DAD]/30 hover:text-[#6A0DAD] disabled:opacity-10 disabled:cursor-default transition-colors text-[.6rem] leading-none py-0.5 px-1">▼</button>
                  </div>

                  <span className="rounded-full bg-[#6A0DAD]/[.08] px-2.5 py-[3px] font-sans text-[.5rem] uppercase tracking-[.14em] text-[#6A0DAD] min-w-[5.5rem] text-center shrink-0">
                    {cat.id}
                  </span>

                  {editing?.id === cat.id ? (
                    <div className="flex flex-1 items-center gap-2 flex-wrap">
                      <input value={editing.label}
                        onChange={(e) => setEditing((ed) => ({ ...ed, label: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(null); }}
                        className="flex-1 min-w-[120px] border border-[#6A0DAD]/30 rounded-lg px-3 py-1.5 font-sans text-sm text-[#3B0A45] focus:outline-none focus:border-[#6A0DAD] focus:ring-1 focus:ring-[#6A0DAD]/20"
                        placeholder="Full label" autoFocus />
                      <input value={editing.short}
                        onChange={(e) => setEditing((ed) => ({ ...ed, short: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(null); }}
                        className="w-24 border border-[#6A0DAD]/30 rounded-lg px-3 py-1.5 font-sans text-sm text-[#3B0A45] focus:outline-none focus:border-[#6A0DAD] focus:ring-1 focus:ring-[#6A0DAD]/20"
                        placeholder="Short (mobile)" />
                      <button onClick={saveEdit}
                        className="font-sans text-[.56rem] uppercase tracking-[.12em] text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">Save</button>
                      <button onClick={() => setEditing(null)}
                        className="font-sans text-[.56rem] uppercase tracking-[.12em] text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                    </div>
                  ) : (
                    <div
                      className={`flex flex-1 items-center gap-3 ${cat.id !== "all" ? "cursor-pointer" : ""}`}
                      onClick={() => cat.id !== "all" && startEdit(cat)}
                      title={cat.id !== "all" ? "Click to edit" : ""}
                    >
                      <span className="font-sans text-sm text-[#3B0A45] group-hover:text-[#6A0DAD] transition-colors">{cat.label}</span>
                      {cat.short && cat.short !== cat.label && (
                        <span className="font-sans text-[.48rem] uppercase tracking-[.1em] text-[#6A0DAD]/40 border border-[#6A0DAD]/15 rounded-full px-2 py-[2px] shrink-0">
                          mobile: {cat.short}
                        </span>
                      )}
                      {cat.id !== "all" && (
                        <span className="font-sans text-[.46rem] uppercase tracking-[.1em] text-[#6A0DAD]/25 opacity-0 group-hover:opacity-100 transition-opacity">✎ edit</span>
                      )}
                    </div>
                  )}

                  {cat.id !== "all" && editing?.id !== cat.id && (
                    <button onClick={() => deleteCategory(cat.id)} title="Delete category"
                      className="shrink-0 text-red-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100">
                      <TrashIcon />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Add new category ────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#6A0DAD]/[.12] shadow-md overflow-hidden">
          <div className="px-5 py-3 border-b border-[#6A0DAD]/[.08] bg-[#FAF8FC]">
            <p className="font-sans text-[.54rem] uppercase tracking-[.24em] text-[#6A0DAD]/70">Add New Category</p>
          </div>
          <div className="p-5">
            <div className="flex gap-3 items-end flex-wrap">
              <label className="flex-1 min-w-[160px]">
                <span className="block font-sans text-[.52rem] uppercase tracking-[.2em] text-[#6A0DAD]/60 mb-1.5">Display Label *</span>
                <input value={newForm.label} onChange={(e) => handleNewLabelChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addCategory(); }}
                  className="w-full border border-[#6A0DAD]/20 rounded-xl px-3.5 py-2.5 font-sans text-sm text-[#3B0A45] focus:outline-none focus:border-[#6A0DAD] focus:ring-1 focus:ring-[#6A0DAD]/20 transition-all placeholder:text-gray-300"
                  placeholder="e.g. Wax Melts" />
              </label>
              <label className="w-28">
                <span className="block font-sans text-[.52rem] uppercase tracking-[.2em] text-[#6A0DAD]/60 mb-1.5">Short (mobile)</span>
                <input value={newForm.short} onChange={(e) => setNewForm((f) => ({ ...f, short: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") addCategory(); }}
                  className="w-full border border-[#6A0DAD]/20 rounded-xl px-3.5 py-2.5 font-sans text-sm text-[#3B0A45] focus:outline-none focus:border-[#6A0DAD] focus:ring-1 focus:ring-[#6A0DAD]/20 transition-all placeholder:text-gray-300"
                  placeholder="Wax" />
              </label>
              <label className="w-32">
                <span className="block font-sans text-[.52rem] uppercase tracking-[.2em] text-[#6A0DAD]/60 mb-1.5">ID / Slug *</span>
                <input value={newForm.id} onChange={(e) => setNewForm((f) => ({ ...f, id: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") addCategory(); }}
                  className="w-full border border-[#6A0DAD]/20 rounded-xl px-3.5 py-2.5 font-sans text-sm text-[#3B0A45] focus:outline-none focus:border-[#6A0DAD] focus:ring-1 focus:ring-[#6A0DAD]/20 transition-all placeholder:text-gray-300"
                  placeholder="wax-melts" />
              </label>
              <button onClick={addCategory} disabled={!newForm.label.trim() || !newForm.id.trim()}
                className="bg-[#6A0DAD] text-white font-sans text-[.56rem] tracking-[.18em] uppercase px-5 py-2.5 rounded-xl hover:bg-[#3B0A45] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                + Add
              </button>
            </div>
            <p className="mt-3 font-sans text-[.5rem] uppercase tracking-[.12em] text-[#6A0DAD]/35">
              ID must match the{" "}
              <code className="normal-case tracking-normal bg-[#6A0DAD]/[.07] px-1.5 py-0.5 rounded text-[.58rem] text-[#6A0DAD]">category</code>
              {" "}field in your products data · lowercase with hyphens
            </p>
          </div>
        </div>

        {/* ── How it works ────────────────────────────────────── */}
        <div className="bg-[#6A0DAD]/[.04] rounded-xl border border-[#6A0DAD]/[.1] p-5">
          <p className="font-sans text-[.54rem] uppercase tracking-[.2em] text-[#6A0DAD]/60 mb-3">How it works</p>
          <ul className="space-y-1.5">
            {[
              "Categories are stored in MongoDB — changes are visible across all devices instantly.",
              "Press Save Changes to push updates to the server; the store website picks them up on next load.",
              "Your session token expires after 8 hours — you'll be asked to sign in again.",
              "\"All\" category is permanent — it cannot be deleted or edited.",
              "The ID must match the category field in your products data file.",
            ].map((note, i) => (
              <li key={i} className="font-sans text-[.52rem] text-[#3B0A45]/60 flex gap-2 leading-relaxed">
                <span className="text-[#D4A373] shrink-0 mt-px">·</span>
                {note}
              </li>
            ))}
          </ul>
        </div>

      </main>
    </div>
  );
}

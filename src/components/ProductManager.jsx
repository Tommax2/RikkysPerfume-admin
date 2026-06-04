import { useState, useEffect, useCallback, useRef } from "react";

const NAIRA = "₦";
const fmt = (n) => `${NAIRA}${Number(n).toLocaleString("en-NG")}`;
const BADGES = ["", "Bestseller", "New", "Limited", "Sale"];
const EMPTY_FORM = {
  name: "", sub: "", family: "", notes: "",
  price: "", badge: "", color: "#FAF8FC", accent: "#6A0DAD",
  category: "", image: "", featured: false,
};

const inputCls = "border border-[#6A0DAD]/20 rounded-xl px-3 py-2.5 font-sans text-sm text-[#3B0A45] focus:outline-none focus:border-[#6A0DAD] focus:ring-1 focus:ring-[#6A0DAD]/20 transition-all placeholder:text-gray-300 w-full bg-white";
const selectCls = inputCls + " cursor-pointer";

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
function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

// ── Sub-components defined OUTSIDE to prevent remount ─────────────────────────

function Field({ label, children, required, full }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "col-span-2 sm:col-span-3" : ""}`}>
      <span className="font-sans text-[.52rem] uppercase tracking-[.2em] text-[#6A0DAD]/60">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

function ImageField({ form, setForm, uploading, fileRef, onUpload }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-sans text-[.52rem] uppercase tracking-[.2em] text-[#6A0DAD]/60">Image</span>
      <div className="flex gap-3 items-start">
        {/* Preview */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-[#6A0DAD]/15 shrink-0 overflow-hidden flex items-center justify-center"
          style={{ background: form.color || "#FAF8FC" }}>
          {form.image
            ? <img src={form.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
            : <span className="text-[#6A0DAD]/20 text-xl">✦</span>
          }
        </div>
        {/* Upload + URL */}
        <div className="flex-1 min-w-0 space-y-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, setForm, form); }} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 font-sans text-[.54rem] uppercase tracking-[.12em] border border-[#6A0DAD]/30 text-[#6A0DAD] px-3 py-2 rounded-xl hover:bg-[#6A0DAD]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto">
            <UploadIcon />
            {uploading ? "Uploading…" : "Upload Image"}
          </button>
          <input className={inputCls} value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="or paste URL" />
        </div>
      </div>
    </div>
  );
}

function ProductForm({ form, setForm, onSubmit, onCancel, submitLabel, error, saving, uploading, fileRef, categories, onUpload }) {
  const set = (k, v) => setForm({ ...form, [k]: v });
  return (
    <div className="space-y-4">
      {error && (
        <p className="font-sans text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <Field label="Name" required>
          <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Khamrah Qahwa" />
        </Field>
        <Field label="Brand">
          <input className={inputCls} value={form.sub} onChange={(e) => set("sub", e.target.value)} placeholder="Lattafa" />
        </Field>
        <Field label="Family" full>
          <input className={inputCls} value={form.family} onChange={(e) => set("family", e.target.value)} placeholder="Oriental Woody" />
        </Field>

        <Field label="Scent Notes" full>
          <input className={inputCls} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Oud · Coffee · Vanilla · Amber" />
        </Field>

        <Field label={`Price (${NAIRA})`} required>
          <input className={inputCls} type="number" min="0" value={form.price}
            onChange={(e) => set("price", e.target.value)} placeholder="34000" />
        </Field>
        <Field label="Category" required>
          <select className={selectCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
            <option value="">— select —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Badge">
          <select className={selectCls} value={form.badge} onChange={(e) => set("badge", e.target.value)}>
            {BADGES.map((b) => <option key={b} value={b}>{b || "None"}</option>)}
          </select>
        </Field>

        {/* Image — full width */}
        <div className="col-span-2 sm:col-span-3">
          <ImageField form={form} setForm={setForm} uploading={uploading} fileRef={fileRef} onUpload={onUpload} />
        </div>

        {/* Colors */}
        <Field label="Background">
          <div className="flex gap-2">
            <input type="color" value={form.color} onChange={(e) => set("color", e.target.value)}
              className="h-10 w-10 rounded-lg border border-[#6A0DAD]/20 cursor-pointer p-1 shrink-0" />
            <input className={inputCls} value={form.color} onChange={(e) => set("color", e.target.value)} />
          </div>
        </Field>
        <Field label="Accent">
          <div className="flex gap-2">
            <input type="color" value={form.accent} onChange={(e) => set("accent", e.target.value)}
              className="h-10 w-10 rounded-lg border border-[#6A0DAD]/20 cursor-pointer p-1 shrink-0" />
            <input className={inputCls} value={form.accent} onChange={(e) => set("accent", e.target.value)} />
          </div>
        </Field>
        <Field label="Featured">
          <div className="flex items-center gap-2 h-10">
            <input type="checkbox" id={`feat-${submitLabel}`} checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="w-4 h-4 accent-[#6A0DAD] cursor-pointer" />
            <label htmlFor={`feat-${submitLabel}`} className="font-sans text-sm text-[#3B0A45] cursor-pointer">
              Carousel
            </label>
          </div>
        </Field>
      </div>

      {/* Submit row — stacks on mobile */}
      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end sm:gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="w-full sm:w-auto font-sans text-[.56rem] uppercase tracking-[.15em] text-[#6A0DAD]/60 border border-[#6A0DAD]/20 px-5 py-2.5 rounded-xl hover:bg-[#6A0DAD]/5 transition-colors text-center">
            Cancel
          </button>
        )}
        <button type="button" onClick={onSubmit} disabled={saving || uploading}
          className="w-full sm:w-auto font-sans text-[.56rem] uppercase tracking-[.15em] bg-[#6A0DAD] text-white px-6 py-2.5 rounded-xl hover:bg-[#3B0A45] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-center">
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ProductManager({ token, apiUrl }) {
  const [products,      setProducts]      = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [apiError,      setApiError]      = useState("");
  const [saving,        setSaving]        = useState(false);
  const [editingId,     setEditingId]     = useState(null);
  const [editForm,      setEditForm]      = useState({});
  const [addForm,       setAddForm]       = useState(EMPTY_FORM);
  const [addError,      setAddError]      = useState("");
  const [uploadingAdd,  setUploadingAdd]  = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);
  const addFileRef  = useRef(null);
  const editFileRef = useRef(null);

  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const [pRes, cRes] = await Promise.all([
        fetch(`${apiUrl}/api/products`),
        fetch(`${apiUrl}/api/categories`),
      ]);
      setProducts(pRes.ok ? await pRes.json() : []);
      const cats = cRes.ok ? await cRes.json() : [];
      setCategories(cats.filter((c) => c.id !== "all"));
    } catch {
      setApiError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const uploadImage = useCallback(async (file, setForm, currentForm) => {
    const setUploading = setForm === setAddForm ? setUploadingAdd : setUploadingEdit;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      if (!res.ok) { setApiError("Image upload failed."); return; }
      const { url } = await res.json();
      setForm({ ...currentForm, image: url });
    } catch {
      setApiError("Image upload failed. Check Cloudinary credentials.");
    } finally {
      setUploading(false);
    }
  }, [apiUrl, token]);

  const handleAdd = async () => {
    setAddError("");
    if (!addForm.name.trim()) return setAddError("Product name is required.");
    if (!addForm.price || isNaN(Number(addForm.price))) return setAddError("Enter a valid price (e.g. 34000).");
    if (!addForm.category) return setAddError("Please select a category.");
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/products`, {
        method: "POST", headers: authHeaders,
        body: JSON.stringify({ ...addForm, price: Number(addForm.price) }),
      });
      if (!res.ok) { const d = await res.json(); return setAddError(d.error || "Failed to add product."); }
      const created = await res.json();
      setProducts((prev) => [...prev, created]);
      setAddForm(EMPTY_FORM);
      if (addFileRef.current) addFileRef.current.value = "";
    } catch {
      setAddError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`${apiUrl}/api/products/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      setApiError("Failed to delete.");
    }
  };

  const startEdit = (p) => { setEditingId(p._id); setEditForm({ ...p, price: String(p.price) }); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editForm.name?.trim() || !editForm.price || !editForm.category) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/products/${editingId}`, {
        method: "PUT", headers: authHeaders,
        body: JSON.stringify({ ...editForm, price: Number(editForm.price) }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => p._id === editingId ? updated : p));
      setEditingId(null);
      if (editFileRef.current) editFileRef.current.value = "";
    } catch {
      setApiError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5 sm:px-6 sm:py-8 sm:space-y-6">

        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex justify-between items-center gap-3">
            <p className="font-sans text-xs text-red-600">{apiError}</p>
            <button onClick={() => setApiError("")} className="text-red-300 hover:text-red-500 shrink-0">✕</button>
          </div>
        )}

        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#3B0A45] tracking-wide">Products</h1>
          <p className="font-sans text-[.54rem] uppercase tracking-[.16em] text-[#6A0DAD]/50 mt-1">
            {loading ? "Loading…" : `${products.length} product${products.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* ── Product list ─────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#6A0DAD]/[.12] shadow-md overflow-hidden">
          <div className="px-4 py-3 border-b border-[#6A0DAD]/[.08] bg-[#FAF8FC] sm:px-5">
            <p className="font-sans text-[.54rem] uppercase tracking-[.24em] text-[#6A0DAD]/70">All Products</p>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <p className="font-sans text-[.58rem] uppercase tracking-[.2em] text-[#6A0DAD]/40 animate-pulse">Loading…</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center px-4">
              <p className="font-sans text-sm text-[#3B0A45]/40">No products yet — add one below.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#6A0DAD]/[.05]">
              {products.map((p) => (
                <li key={p._id}>
                  {editingId === p._id ? (
                    /* ── Inline edit ── */
                    <div className="px-4 py-4 bg-[#FAF8FC]/60 sm:px-5 sm:py-5">
                      <p className="font-sans text-[.52rem] uppercase tracking-[.18em] text-[#6A0DAD]/60 mb-4 truncate">
                        Editing: {p.name}
                      </p>
                      <ProductForm
                        form={editForm} setForm={setEditForm}
                        onSubmit={saveEdit} onCancel={cancelEdit}
                        submitLabel="Save Changes" error={null}
                        saving={saving} uploading={uploadingEdit}
                        fileRef={editFileRef} categories={categories}
                        onUpload={uploadImage}
                      />
                    </div>
                  ) : (
                    /* ── Product row ── */
                    <div className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">

                      {/* Thumbnail */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0 overflow-hidden border border-[#6A0DAD]/10 flex items-center justify-center"
                        style={{ background: p.color || "#FAF8FC" }}>
                        {p.image
                          ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                          : <span style={{ color: p.accent || "#6A0DAD" }} className="text-base">✦</span>
                        }
                      </div>

                      {/* Name + meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-sans text-sm font-medium text-[#3B0A45] truncate">{p.name}</span>
                          {p.sub && <span className="font-sans text-[.48rem] uppercase tracking-[.1em] text-[#6A0DAD]/45 hidden sm:inline">{p.sub}</span>}
                          {p.badge && <span className="font-sans text-[.44rem] uppercase text-[#D4A373] border border-[#D4A373]/40 rounded-full px-1.5 py-[2px] hidden sm:inline">{p.badge}</span>}
                        </div>
                        {/* Price shown below name on mobile */}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-sans text-xs font-medium text-[#6A0DAD] sm:hidden">{fmt(p.price)}</span>
                          <span className="font-sans text-[.48rem] uppercase tracking-[.1em] text-[#3B0A45]/40 hidden sm:inline">{p.category}</span>
                        </div>
                      </div>

                      {/* Price — desktop only */}
                      <span className="font-sans text-sm text-[#3B0A45] font-medium shrink-0 hidden sm:block">{fmt(p.price)}</span>

                      {/* Action buttons — always visible on mobile, hover-only on desktop */}
                      <div className="flex gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity [&]:opacity-100">
                        <button onClick={() => startEdit(p)} title="Edit"
                          className="text-[#6A0DAD]/50 hover:text-[#6A0DAD] p-1.5 sm:p-2 rounded-lg hover:bg-[#6A0DAD]/5 transition-colors">
                          <PencilIcon />
                        </button>
                        <button onClick={() => handleDelete(p._id, p.name)} title="Delete"
                          className="text-red-300 hover:text-red-500 p-1.5 sm:p-2 rounded-lg hover:bg-red-50 transition-colors">
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Add product ───────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#6A0DAD]/[.12] shadow-md overflow-hidden">
          <div className="px-4 py-3 border-b border-[#6A0DAD]/[.08] bg-[#FAF8FC] sm:px-5">
            <p className="font-sans text-[.54rem] uppercase tracking-[.24em] text-[#6A0DAD]/70">Add Product</p>
          </div>
          <div className="p-4 sm:p-5">
            <ProductForm
              form={addForm} setForm={setAddForm}
              onSubmit={handleAdd} onCancel={null}
              submitLabel="+ Add Product" error={addError}
              saving={saving} uploading={uploadingAdd}
              fileRef={addFileRef} categories={categories}
              onUpload={uploadImage}
            />
          </div>
        </div>

      </main>
    </div>
  );
}

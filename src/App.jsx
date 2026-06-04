import { useState } from "react";
import Login from "./components/Login";
import CategoryManager from "./components/CategoryManager";
import ProductManager from "./components/ProductManager";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

const STORE_URL_KEY = "rikky_store_url";

function AdminShell({ token, onLogout }) {
  const [page, setPage] = useState("products");
  const [storeUrl] = useState(() => localStorage.getItem(STORE_URL_KEY) || "");

  const navItems = [
    { id: "products",   label: "Products"   },
    { id: "categories", label: "Categories" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8FC]">
      {/* Sticky header */}
      <header className="bg-white border-b border-[#6A0DAD]/10 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* ── Mobile: two rows ── */}
          <div className="sm:hidden">
            {/* Row 1: brand + sign out */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-serif text-xl font-light text-[#6A0DAD] tracking-[.12em]">Rikky's</p>
                <p className="font-sans text-[.48rem] tracking-[.28em] uppercase text-[#B57CFF]">Admin Panel</p>
              </div>
              <div className="flex items-center gap-2">
                {storeUrl && (
                  <a href={storeUrl} target="_blank" rel="noopener noreferrer"
                    className="font-sans text-[.56rem] tracking-[.12em] uppercase text-[#6A0DAD] border border-[#6A0DAD]/30 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#6A0DAD]/5 transition-colors">
                    Store <ExternalLinkIcon />
                  </a>
                )}
                <button onClick={onLogout}
                  className="font-sans text-[.56rem] tracking-[.12em] uppercase text-[#6A0DAD]/60 border border-[#6A0DAD]/20 px-3 py-1.5 rounded-lg hover:bg-[#6A0DAD]/5 transition-colors">
                  Sign Out
                </button>
              </div>
            </div>
            {/* Row 2: nav tabs (full width) */}
            <div className="flex gap-1 rounded-xl border border-[#6A0DAD]/15 p-1 bg-[#FAF8FC] mb-2">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => setPage(item.id)}
                  className={`flex-1 font-sans text-[.56rem] tracking-[.15em] uppercase py-2 rounded-lg transition-all ${
                    page === item.id ? "bg-[#6A0DAD] text-white shadow-sm" : "text-[#6A0DAD]/60 hover:text-[#6A0DAD] hover:bg-[#6A0DAD]/5"
                  }`}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Desktop: single row ── */}
          <div className="hidden sm:flex items-center justify-between gap-4 py-4">
            <div className="shrink-0">
              <p className="font-serif text-2xl font-light text-[#6A0DAD] tracking-[.12em]">Rikky's</p>
              <p className="font-sans text-[.52rem] tracking-[.3em] uppercase text-[#B57CFF]">Admin Panel</p>
            </div>
            <nav className="flex gap-1 rounded-xl border border-[#6A0DAD]/15 p-1 bg-[#FAF8FC]">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => setPage(item.id)}
                  className={`font-sans text-[.58rem] tracking-[.18em] uppercase px-5 py-2 rounded-lg transition-all ${
                    page === item.id ? "bg-[#6A0DAD] text-white shadow-sm" : "text-[#6A0DAD]/60 hover:text-[#6A0DAD] hover:bg-[#6A0DAD]/5"
                  }`}>
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-3 shrink-0">
              {storeUrl && (
                <a href={storeUrl} target="_blank" rel="noopener noreferrer"
                  className="font-sans text-[.58rem] tracking-[.15em] uppercase text-[#6A0DAD] border border-[#6A0DAD]/30 px-4 py-2 rounded-lg hover:bg-[#6A0DAD]/5 transition-colors flex items-center gap-1.5">
                  Visit Store <ExternalLinkIcon />
                </a>
              )}
              <button onClick={onLogout}
                className="font-sans text-[.58rem] tracking-[.18em] uppercase text-[#6A0DAD]/60 border border-[#6A0DAD]/20 px-4 py-2 rounded-lg hover:bg-[#6A0DAD]/5 transition-colors">
                Sign Out
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Page content */}
      {page === "products"   && <ProductManager   token={token} apiUrl={API} />}
      {page === "categories" && <CategoryManager  token={token} apiUrl={API} onStoreUrlChange={() => {}} />}
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem("rikky_admin_token") || "");

  const handleLogin = async (pass) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      sessionStorage.setItem("rikky_admin_token", data.token);
      setToken(data.token);
      return true;
    } catch {
      return false;
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("rikky_admin_token");
    setToken("");
  };

  return token
    ? <AdminShell token={token} onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />;
}

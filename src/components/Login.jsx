import { useState } from "react";

export default function Login({ onLogin }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (!onLogin(pass)) {
        setError("Incorrect password. Please try again.");
        setPass("");
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#FAF8FC] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Brand mark */}
        <div className="text-center mb-10">
          <p className="font-serif text-5xl font-light text-[#6A0DAD] tracking-[.15em]">Rikky's</p>
          <p className="font-sans text-[.6rem] tracking-[.35em] uppercase text-[#B57CFF] mt-2">
            Perfumes · Admin Panel
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-white rounded-2xl border border-[#6A0DAD]/15 shadow-xl p-8"
        >
          <h1 className="font-serif text-xl text-[#3B0A45] mb-7 text-center font-light tracking-wide">
            Welcome Back
          </h1>

          <label className="block mb-5">
            <span className="block font-sans text-[.58rem] uppercase tracking-[.22em] text-[#6A0DAD]/70 mb-1.5">
              Admin Password
            </span>
            <input
              type="password"
              value={pass}
              onChange={(e) => { setPass(e.target.value); setError(""); }}
              className="w-full border border-[#6A0DAD]/20 rounded-xl px-4 py-3 font-sans text-sm text-[#3B0A45] focus:outline-none focus:border-[#6A0DAD] focus:ring-1 focus:ring-[#6A0DAD]/20 transition-all placeholder:text-gray-300"
              placeholder="••••••••"
              autoFocus
            />
          </label>

          {error && (
            <p className="text-red-500 text-xs font-sans mb-4 flex items-center gap-1.5">
              <span>⚠</span> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !pass}
            className="w-full bg-[#6A0DAD] text-[#FAF8FC] font-sans text-[.62rem] tracking-[.22em] uppercase py-3.5 rounded-xl hover:bg-[#3B0A45] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Verifying…" : "Sign In"}
          </button>
        </form>

        <p className="text-center font-sans text-[.5rem] uppercase tracking-[.2em] text-[#6A0DAD]/30 mt-6">
          Rikky's Perfumes · Admin
        </p>
      </div>
    </div>
  );
}

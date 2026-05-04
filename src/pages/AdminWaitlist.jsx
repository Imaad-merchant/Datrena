import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, RefreshCw, Mail, Users, Loader2 } from "lucide-react";
import { useSecretAccess } from "@/hooks/useSecretAccess";

/**
 * Admin-only waitlist viewer. Gated by useSecretAccess (the same
 * Shift+Z + admin/123456 flow that gates the rest of the authenticated app).
 *
 * Reads from /api/waitlist/list. The admin token is read from localStorage —
 * set it once via the prompt on first visit, then it persists.
 */

const TOKEN_KEY = "datrena_admin_token";

export default function AdminWaitlist() {
  const navigate = useNavigate();
  const { isAdmin } = useSecretAccess();
  const [entries, setEntries] = useState([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [error, setError] = useState("");
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; }
  });
  const [tokenInput, setTokenInput] = useState("");

  // If not admin, bounce to home
  useEffect(() => {
    if (!isAdmin) navigate("/");
  }, [isAdmin, navigate]);

  const load = async (t = token) => {
    if (!t) return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/waitlist/list", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.status === 401) throw new Error("Invalid admin token");
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setEntries(data.entries || []);
      setCount(data.count || 0);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  };

  useEffect(() => {
    if (token) load(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToken = (e) => {
    e.preventDefault();
    if (!tokenInput) return;
    try { localStorage.setItem(TOKEN_KEY, tokenInput); } catch {}
    setToken(tokenInput);
    load(tokenInput);
  };

  const exportCSV = () => {
    const rows = [
      ["email", "signed_up_at", "referrer", "source", "ip"].join(","),
      ...entries.map((e) =>
        [
          e.email,
          e.signedUpAt,
          e.referrer ? `"${String(e.referrer).replace(/"/g, '""')}"` : "",
          e.source || "",
          e.ip || "",
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `datrena-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-1">
              Admin
            </div>
            <h1 className="text-2xl font-light tracking-tight">Waitlist</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load()}
              disabled={status === "loading" || !token}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-zinc-800 rounded px-3 py-1.5 disabled:opacity-40"
            >
              {status === "loading" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Refresh
            </button>
            <button
              onClick={exportCSV}
              disabled={!entries.length}
              className="flex items-center gap-1.5 text-xs text-black bg-white hover:bg-zinc-200 font-semibold rounded px-3 py-1.5 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {!token ? (
          <form onSubmit={saveToken} className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-md">
            <h2 className="text-sm font-semibold mb-2">Admin token required</h2>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              Set <code className="text-zinc-300">WAITLIST_ADMIN_TOKEN</code> in
              server/.env, then enter it here. Default in dev is{" "}
              <code className="text-zinc-300">datrena-admin</code>.
            </p>
            <input
              type="password"
              autoFocus
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Bearer token"
              className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-zinc-600 mb-3"
            />
            <button type="submit" className="w-full bg-white text-black rounded py-2 text-sm font-semibold hover:bg-zinc-200">
              Unlock
            </button>
          </form>
        ) : error ? (
          <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-4 max-w-md">
            <div className="text-sm text-red-300 mb-2">{error}</div>
            <button
              onClick={() => {
                try { localStorage.removeItem(TOKEN_KEY); } catch {}
                setToken(""); setEntries([]);
              }}
              className="text-xs text-red-400 hover:text-red-200 underline"
            >
              Reset admin token
            </button>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-wider mb-1">
                  <Users className="w-3.5 h-3.5" />
                  Total signups
                </div>
                <div className="text-2xl font-light">{count}</div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-wider mb-1">
                  <Mail className="w-3.5 h-3.5" />
                  Unique referrers
                </div>
                <div className="text-2xl font-light">
                  {new Set(entries.map((e) => e.referrer).filter(Boolean)).size}
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">
                  Last 24h
                </div>
                <div className="text-2xl font-light">
                  {entries.filter((e) => Date.now() - new Date(e.signedUpAt).getTime() < 86400000).length}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                    <th className="text-left font-normal px-4 py-3">Email</th>
                    <th className="text-left font-normal px-4 py-3">Signed up</th>
                    <th className="text-left font-normal px-4 py-3">Referrer</th>
                    <th className="text-left font-normal px-4 py-3">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-zinc-500 text-sm">
                        No signups yet.
                      </td>
                    </tr>
                  ) : (
                    entries.map((e, i) => (
                      <tr
                        key={`${e.email}-${i}`}
                        className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/50"
                      >
                        <td className="px-4 py-3 font-mono text-zinc-200">{e.email}</td>
                        <td className="px-4 py-3 text-zinc-500 text-xs">
                          {new Date(e.signedUpAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">
                          {e.referrer || <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-3 text-zinc-500 text-xs">{e.source || "unknown"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

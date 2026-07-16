"use client";
import { useState } from "react";

type AtsCheck  = { id: string; created_at: string; job_role: string; score: number; email?: string };
type CvRewrite = {
  id: string; created_at: string; job_role: string; score_before: number;
  email: string; payment_id: string; original_pdf_url: string; rewritten_pdf_url: string;
};
type CvReview = {
  id: string; created_at: string; stars: number; comment?: string; email?: string; payment_id?: string;
};

function groupByDay(checks: AtsCheck[]) {
  const map: Record<string, number> = {};
  for (const c of checks) {
    const day = c.created_at.slice(0, 10);
    map[day] = (map[day] || 0) + 1;
  }
  return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 14);
}

function getISTDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed,   setAuthed]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [atsChecks,  setAtsChecks]  = useState<AtsCheck[]>([]);
  const [rewrites,   setRewrites]   = useState<CvRewrite[]>([]);
  const [reviews,    setReviews]    = useState<CvReview[]>([]);
  const [filterFrom, setFilterFrom] = useState(getISTDate(-1)); // yesterday
  const [filterTo,   setFilterTo]   = useState(getISTDate(0));  // today

  async function handleLogin() {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/admin/data?password=${password}`);
      if (!res.ok) { setError("Wrong password"); setLoading(false); return; }
      const data = await res.json();
      setAtsChecks(data.atsChecks || []);
      setRewrites(data.rewrites || []);
      setReviews(data.reviews || []);
      setAuthed(true);
    } catch {
      setError("Failed to load data");
    }
    setLoading(false);
  }

  async function refresh() {
    setLoading(true);
    // Reset filter to today + yesterday on every refresh
    setFilterFrom(getISTDate(-1));
    setFilterTo(getISTDate(0));
    try {
      const res = await fetch(`/api/admin/data?password=${password}`);
      const data = await res.json();
      setAtsChecks(data.atsChecks || []);
      setRewrites(data.rewrites || []);
      setReviews(data.reviews || []);
    } catch {}
    setLoading(false);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Loading..." : "Login"}
          </button>
        </div>
      </div>
    );
  }

  const todayStr      = getISTDate(0);
  const todayChecks   = atsChecks.filter(c => new Date(c.created_at).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) === todayStr).length;
  const todayRewrites = rewrites.filter(r => new Date(r.created_at).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) === todayStr).length;
  const dailyCounts   = groupByDay(atsChecks);

  // Filter both tables by date range (compare YYYY-MM-DD prefix in IST)
  const filteredChecks  = atsChecks.filter(c => {
    const d = new Date(c.created_at).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    return d >= filterFrom && d <= filterTo;
  });
  const filteredRewrites = rewrites.filter(r => {
    const d = new Date(r.created_at).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    return d >= filterFrom && d <= filterTo;
  });

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800">ScoreMyCV Admin</h1>
          <button onClick={refresh} disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <p className="text-3xl font-extrabold text-blue-600">{todayChecks}</p>
            <p className="text-sm text-slate-500 mt-1">ATS Checks Today</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <p className="text-3xl font-extrabold text-blue-600">{atsChecks.length}</p>
            <p className="text-sm text-slate-500 mt-1">Total ATS Checks</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <p className="text-3xl font-extrabold text-green-600">{todayRewrites}</p>
            <p className="text-sm text-slate-500 mt-1">Rewrites Today</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <p className="text-3xl font-extrabold text-green-600">{rewrites.length}</p>
            <p className="text-sm text-slate-500 mt-1">Total Rewrites</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <p className="text-3xl font-extrabold text-yellow-500">
              {reviews.length > 0 ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1) : "—"}
            </p>
            <p className="text-sm text-slate-500 mt-1">Avg Rating ({reviews.length})</p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-8 flex flex-wrap items-center gap-4">
          <span className="font-bold text-slate-700 text-sm">📅 Filter by Date:</span>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500">From</label>
            <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500">To</label>
            <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <button onClick={() => { setFilterFrom(getISTDate(-1)); setFilterTo(getISTDate(0)); }}
            className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-200">
            Reset
          </button>
          <span className="text-xs text-slate-400 ml-auto">
            Showing {filteredChecks.length} checks · {filteredRewrites.length} rewrites
          </span>
        </div>

        {/* Recent ATS Checks Table */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">ATS Checks ({filteredChecks.length})</h2>
          {filteredChecks.length === 0 ? (
            <p className="text-slate-400 text-sm">No checks for selected dates</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="pb-2 pr-4">Date (IST)</th>
                    <th className="pb-2 pr-4">Job Role</th>
                    <th className="pb-2 pr-4">Score</th>
                    <th className="pb-2">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChecks.map(c => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-2 pr-4 text-slate-500 whitespace-nowrap">{new Date(c.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })}</td>
                      <td className="py-2 pr-4 text-slate-700">{c.job_role}</td>
                      <td className="py-2 pr-4">
                        <span className={`font-bold px-2 py-1 rounded-full text-xs ${c.score < 50 ? "bg-red-100 text-red-600" : c.score < 70 ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"}`}>
                          {c.score}/100
                        </span>
                      </td>
                      <td className="py-2 text-slate-600">{c.email || <span className="text-slate-300">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CV Rewrites Table */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Paid CV Rewrites ({filteredRewrites.length})</h2>
          {filteredRewrites.length === 0 ? (
            <p className="text-slate-400 text-sm">No rewrites for selected dates</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="pb-2 pr-4">Date (IST)</th>
                    <th className="pb-2 pr-4">Job Role</th>
                    <th className="pb-2 pr-4">Score Before</th>
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Payment ID</th>
                    <th className="pb-2 pr-4">Original CV</th>
                    <th className="pb-2">Rewritten CV</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRewrites.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">{new Date(r.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })}</td>
                      <td className="py-3 pr-4 font-medium text-slate-800">{r.job_role}</td>
                      <td className="py-3 pr-4">
                        {r.score_before ? (
                          <span className={`font-bold px-2 py-1 rounded-full text-xs ${r.score_before < 50 ? "bg-red-100 text-red-600" : r.score_before < 70 ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"}`}>
                            {r.score_before}/100
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{r.email || "—"}</td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">{r.payment_id || "—"}</td>
                      <td className="py-3 pr-4">
                        {r.original_pdf_url ? (
                          <a href={r.original_pdf_url} target="_blank" rel="noopener noreferrer"
                            className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-slate-200">
                            View PDF
                          </a>
                        ) : "—"}
                      </td>
                      <td className="py-3">
                        {r.rewritten_pdf_url ? (
                          <a href={r.rewritten_pdf_url} target="_blank" rel="noopener noreferrer"
                            className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-200">
                            View PDF
                          </a>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reviews summary + link */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">⭐ Customer Reviews</h2>
            <p className="text-slate-500 text-sm mt-1">
              {reviews.length > 0
                ? `${(reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1)} avg · ${reviews.length} review${reviews.length !== 1 ? "s" : ""}`
                : "No reviews yet"}
            </p>
          </div>
          <a href="/admin/reviews" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
            View All Reviews →
          </a>
        </div>

      </div>
    </div>
  );
}

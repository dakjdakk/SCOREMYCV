"use client";
import { useState, useEffect } from "react";

type CvReview = {
  id: string; created_at: string; stars: number; comment?: string; email?: string; payment_id?: string;
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState<CvReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const pwd = sessionStorage.getItem("adminPwd");
    if (!pwd) {
      window.location.href = "/admin";
      return;
    }
    fetch(`/api/admin/reviews?password=${pwd}`)
      .then(r => {
        if (r.status === 401) { window.location.href = "/admin"; return null; }
        return r.json();
      })
      .then(d => { if (d) { setReviews(d.reviews || []); setLoading(false); } })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, []);

  const avg = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <a href="/admin" className="text-blue-600 hover:underline text-sm">← Back to Admin</a>
          <h1 className="text-2xl font-extrabold text-slate-800">⭐ Customer Reviews</h1>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 inline-flex items-center gap-4">
          <div className="text-4xl font-black text-yellow-400">{avg}</div>
          <div>
            <div className="text-yellow-400 text-xl">{"★".repeat(Math.round(parseFloat(avg) || 0))}{"☆".repeat(5 - Math.round(parseFloat(avg) || 0))}</div>
            <div className="text-sm text-slate-500">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</div>
          </div>
        </div>

        {loading && <p className="text-slate-400">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && reviews.length === 0 && (
          <p className="text-slate-400">No reviews yet.</p>
        )}

        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-yellow-400 text-lg">{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</span>
                <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
              </div>
              {r.comment && <p className="text-slate-700 text-sm mt-1">&ldquo;{r.comment}&rdquo;</p>}
              <div className="flex gap-4 mt-2 text-xs text-slate-400">
                {r.email && <span>📧 {r.email}</span>}
                {r.payment_id && <span>💳 {r.payment_id}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

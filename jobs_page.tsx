"use client";

import { useState } from "react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  date: string;
  description: string;
  apply_link: string;
  employment_type: string;
  is_remote: boolean;
}

export default function JobsPage() {
  const [role,     setRole]     = useState("");
  const [location, setLocation] = useState("Bangalore");
  const [jobs,     setJobs]     = useState<Job[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error,    setError]    = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!role.trim()) return;

    setLoading(true);
    setSearched(true);
    setError("");
    setJobs([]);
    setExpanded(null);

    try {
      const res = await fetch(
        `/api/search-jobs?role=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}`
      );
      const data = await res.json();
      if (data.error) {
        setError("Something went wrong. Please try again.");
      } else {
        setJobs(data.jobs || []);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function timeAgo(dateStr: string) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7)  return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-500 text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">Find IT Jobs</h1>
          <p className="text-indigo-200 text-sm mb-8">Search thousands of tech jobs across India</p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-3 shadow-xl flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Job role  (e.g. Java Developer)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex-1 px-4 py-3 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
            <input
              type="text"
              placeholder="Location  (e.g. Bangalore)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full sm:w-44 px-4 py-3 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
            <button
              type="submit"
              disabled={loading || !role.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              {loading ? "Searching..." : "Search Jobs"}
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Finding jobs for you...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-500 py-8">{error}</p>
        )}

        {/* No results */}
        {!loading && searched && jobs.length === 0 && !error && (
          <p className="text-center text-gray-500 py-16">
            No jobs found for <b>{role}</b> in <b>{location}</b>. Try a different search.
          </p>
        )}

        {/* Results count */}
        {!loading && jobs.length > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            Found <b>{jobs.length}</b> jobs for <b>{role}</b> in <b>{location}</b>
          </p>
        )}

        {/* Job Cards */}
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {job.is_remote && (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Remote</span>
                    )}
                    {job.employment_type && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">{job.employment_type}</span>
                    )}
                    {job.date && (
                      <span className="text-xs text-gray-400">{timeAgo(job.date)}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 text-base leading-tight">{job.title}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{job.company}</p>
                  <p className="text-xs text-gray-400 mt-0.5">📍 {job.location}</p>
                </div>
                <a
                  href={job.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Apply
                </a>
              </div>

              <button
                onClick={() => setExpanded(expanded === job.id ? null : job.id)}
                className="mt-2 text-xs text-indigo-500 hover:underline"
              >
                {expanded === job.id ? "▲ Hide details" : "▼ View details"}
              </button>

              {expanded === job.id && (
                <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed whitespace-pre-line">
                  {job.description || "No description available."}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        {jobs.length > 0 && (
          <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-bold text-indigo-800">Got an interview?</h3>
            <p className="text-sm text-indigo-600 mt-1">Get your resume scored by AI in 3 hours — just ₹99</p>
            <a
              href="https://scoremycv.in"
              className="inline-block mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors text-sm"
            >
              Score My CV →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

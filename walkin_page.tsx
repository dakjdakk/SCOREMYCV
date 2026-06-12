"use client";

import { useEffect, useState } from "react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  date: string;
  description: string;
  apply_link: string;
  city: string;
  category: string;
}

const CITIES = [
  "All Cities", "Bangalore", "Hyderabad", "Chennai", "Mumbai", "Pune",
  "Delhi", "Noida", "Gurgaon", "Kolkata", "Ahmedabad", "Kochi",
  "Jaipur", "Bhopal", "Indore", "Chandigarh",
];

const CATEGORIES = [
  "All Roles", "Software Developer", "Data Analyst", "Testing / QA",
  "DevOps / Cloud", "Frontend", "Backend", "Full Stack",
  "Mobile Developer", "Data Science / ML", "Business Analyst",
  "Support / L1 L2", "HR / Recruiter", "Sales / Marketing",
];

function isRecent(dateStr: string) {
  const jobDate = new Date(dateStr);
  const now = new Date();
  const diff = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60);
  return diff <= 48;
}

export default function WalkinJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [city, setCity] = useState("All Cities");
  const [category, setCategory] = useState("All Roles");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/walkin-jobs.json")
      .then((r) => r.json())
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((j) => {
    const cityMatch = city === "All Cities" || j.city?.toLowerCase().includes(city.toLowerCase());
    const catMatch  = category === "All Roles" || j.category === category;
    return cityMatch && catMatch;
  });

  const freshJobs = filtered.filter((j) => isRecent(j.date));
  const olderJobs = filtered.filter((j) => !isRecent(j.date));

  const JobCard = ({ job }: { job: Job }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
              Walk-In
            </span>
            {isRecent(job.date) && (
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                Fresh
              </span>
            )}
            <span className="text-xs text-gray-400">
              {new Date(job.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <h3 className="font-semibold text-gray-800 mt-1 text-base">{job.title}</h3>
          <p className="text-sm text-gray-600">{job.company}</p>
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
        {expanded === job.id ? "Hide details" : "View details"}
      </button>
      {expanded === job.id && (
        <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed whitespace-pre-line">
          {job.description || "No description available."}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 text-white py-10 px-4 text-center">
        <h1 className="text-3xl font-bold">Walk-In Interview Jobs</h1>
        <p className="mt-2 text-indigo-100 text-sm">Updated daily · IT & Tech roles across India</p>
      </div>

      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3 items-center">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <span className="text-sm text-gray-500 ml-auto">
            {filtered.length} job{filtered.length !== 1 ? "s" : ""} found
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {loading ? (
          <p className="text-center text-gray-500 py-16">Loading jobs...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No walk-in jobs found for selected filters.</p>
        ) : (
          <>
            {freshJobs.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-700 mb-3">Fresh (Last 48 hrs) — {freshJobs.length} jobs</h2>
                <div className="space-y-3">
                  {freshJobs.map((job) => <JobCard key={job.id} job={job} />)}
                </div>
              </section>
            )}
            {olderJobs.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-700 mb-3">Earlier — {olderJobs.length} jobs</h2>
                <div className="space-y-3">
                  {olderJobs.map((job) => <JobCard key={job.id} job={job} />)}
                </div>
              </section>
            )}
          </>
        )}

        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-bold text-indigo-800">Want to ace your walk-in interview?</h3>
          <p className="text-sm text-indigo-600 mt-1">Get your resume scored by AI in 3 hours — just ₹99</p>
          <a
            href="https://scoremycv.in"
            className="inline-block mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors text-sm"
          >
            Score My CV
          </a>
        </div>
      </div>
    </div>
  );
}

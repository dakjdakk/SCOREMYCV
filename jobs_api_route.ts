import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role     = searchParams.get("role") || "";
  const location = searchParams.get("location") || "India";

  if (!role.trim()) {
    return NextResponse.json({ error: "Job role is required" }, { status: 400 });
  }

  const query = `${role} jobs in ${location}`;

  try {
    const url = new URL("https://jsearch.p.rapidapi.com/search");
    url.searchParams.set("query",      query);
    url.searchParams.set("num_pages",  "2");
    url.searchParams.set("country",    "in");
    url.searchParams.set("date_posted","month");

    const res = await fetch(url.toString(), {
      headers: {
        "X-RapidAPI-Key":  process.env.RAPIDAPI_KEY || "",
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "API error", status: res.status }, { status: 500 });
    }

    const data = await res.json();

    // Clean up and return only what we need
    const jobs = (data.data || []).map((job: any) => ({
      id:          job.job_id,
      title:       job.job_title,
      company:     job.employer_name,
      location:    [job.job_city, job.job_state].filter(Boolean).join(", ") || location,
      date:        job.job_posted_at_datetime_utc,
      description: (job.job_description || "").slice(0, 600),
      apply_link:  job.job_apply_link || job.job_google_link || "",
      employment_type: job.job_employment_type || "",
      is_remote:   job.job_is_remote || false,
    }));

    return NextResponse.json({ jobs });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

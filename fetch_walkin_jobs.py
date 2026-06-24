"""
fetch_walkin_jobs.py
Fetches walk-in IT jobs from JSearch API (RapidAPI) and saves to public/data/walkin-jobs.json
Run daily via GitHub Actions.
"""

import os
import json
import hashlib
import requests
from datetime import datetime, timezone

RAPIDAPI_KEY = os.environ.get("RAPIDAPI_KEY", "YOUR_RAPIDAPI_KEY_HERE")

INDIA_CITIES = [
    "bangalore", "bengaluru", "hyderabad", "chennai", "mumbai", "pune",
    "delhi", "new delhi", "noida", "gurgaon", "gurugram", "kolkata",
    "ahmedabad", "kochi", "cochin", "jaipur", "bhopal", "indore",
    "chandigarh", "coimbatore", "nagpur", "vadodara", "surat",
    "trivandrum", "thiruvananthapuram", "vizag", "visakhapatnam",
    "mysore", "mysuru", "lucknow", "bhubaneswar",
]

CATEGORY_KEYWORDS = {
    "Software Developer":   ["software developer", "software engineer"],
    "Data Analyst":         ["data analyst"],
    "Testing / QA":         ["qa engineer", "test engineer", "quality assurance", "manual testing", "automation testing"],
    "DevOps / Cloud":       ["devops", "cloud engineer", "aws", "azure", "gcp"],
    "Frontend":             ["frontend developer", "react developer", "angular developer", "vue developer"],
    "Backend":              ["backend developer", "java developer", "python developer", "node developer"],
    "Full Stack":           ["full stack", "fullstack"],
    "Mobile Developer":     ["android developer", "ios developer", "flutter developer", "react native"],
    "Data Science / ML":    ["data scientist", "machine learning", "ml engineer", "ai engineer"],
    "Business Analyst":     ["business analyst"],
    "Support / L1 L2":      ["technical support", "l1 support", "l2 support", "help desk"],
    "HR / Recruiter":       ["hr recruiter", "human resources", "talent acquisition"],
    "Sales / Marketing":    ["sales", "marketing", "business development"],
}

SEARCH_QUERIES = [
    "walk in interview IT jobs India",
    "walk in drive software developer India",
    "walk in interview developer Bangalore",
    "walk in drive IT Hyderabad",
    "walk in interview fresher IT India",
    "walk in drive QA testing India",
    "walk in interview data analyst India",
]

def detect_category(title: str, description: str) -> str:
    text = (title + " " + description).lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return category
    return "Software Developer"

CITY_NORMALIZE = {
    "bengaluru": "Bangalore",
    "bangalore": "Bangalore",
    "gurugram":  "Gurgaon",
    "gurgaon":   "Gurgaon",
    "cochin":    "Kochi",
    "kochi":     "Kochi",
    "mysuru":    "Mysore",
    "mysore":    "Mysore",
    "new delhi": "Delhi",
    "delhi":     "Delhi",
    "thiruvananthapuram": "Trivandrum",
    "trivandrum":         "Trivandrum",
    "visakhapatnam":      "Vizag",
    "vizag":              "Vizag",
}

def detect_city(location: str) -> str:
    loc_lower = location.lower()
    for key, normalized in CITY_NORMALIZE.items():
        if key in loc_lower:
            return normalized
    for city in INDIA_CITIES:
        if city in loc_lower:
            return city.capitalize()
    return "India"

def is_india_job(job: dict) -> bool:
    """Accept job if country is IN/India OR city matches known India cities."""
    country = (job.get("job_country") or "").strip()
    city    = (job.get("job_city") or "").lower()
    state   = (job.get("job_state") or "").lower()
    # Accept if country code is IN or India
    if country.upper() in ("IN", "INDIA") or country.lower() == "india":
        return True
    # Accept if city or state matches known India cities/states
    location_text = city + " " + state
    return any(term in location_text for term in INDIA_CITIES)

def fetch_jobs_for_query(query: str) -> list:
    url = "https://jsearch.p.rapidapi.com/search"
    headers = {
        "X-RapidAPI-Key":  RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    }
    params = {
        "query":        query,
        "num_pages":    "2",
        "date_posted":  "week",
        "country":      "in",
    }
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        return data.get("data", [])
    except Exception as e:
        print(f"  Error fetching '{query}': {e}")
        return []

def process_jobs(raw_jobs: list) -> list:
    seen_ids = set()
    jobs = []

    for job in raw_jobs:
        if not is_india_job(job):
            continue
        location = (job.get("job_city") or "") + " " + (job.get("job_country") or "")

        title       = job.get("job_title", "")
        description = job.get("job_description", "")[:500]
        apply_link  = job.get("job_apply_link", "") or job.get("job_google_link", "")
        company     = job.get("employer_name", "Unknown Company")
        posted_at   = job.get("job_posted_at_datetime_utc") or datetime.now(timezone.utc).isoformat()
        city        = detect_city(location)
        category    = detect_category(title, description)

        # Deduplicate
        job_id = hashlib.md5(f"{title}{company}{location}".encode()).hexdigest()[:12]
        if job_id in seen_ids:
            continue
        seen_ids.add(job_id)

        jobs.append({
            "id":          job_id,
            "title":       title,
            "company":     company,
            "location":    f"{job.get('job_city') or ''}, {job.get('job_state') or ''}".strip(", "),
            "city":        city,
            "category":    category,
            "description": description,
            "apply_link":  apply_link,
            "date":        posted_at,
        })

    # Sort by date descending
    jobs.sort(key=lambda x: x["date"], reverse=True)
    return jobs

def main():
    print(f"Starting job fetch — {datetime.now().strftime('%d %b %Y %H:%M')}")

    if RAPIDAPI_KEY == "YOUR_RAPIDAPI_KEY_HERE":
        print("ERROR: Set RAPIDAPI_KEY environment variable!")
        return

    all_raw = []
    for query in SEARCH_QUERIES:
        print(f"  Searching: {query}")
        results = fetch_jobs_for_query(query)
        print(f"    → {len(results)} results")
        all_raw.extend(results)

    jobs = process_jobs(all_raw)
    print(f"\nTotal unique India IT walk-in jobs: {len(jobs)}")

    # Save to public/data/walkin-jobs.json
    out_path = os.path.join(os.path.dirname(__file__), "..", "public", "data", "walkin-jobs.json")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(jobs, f, indent=2, ensure_ascii=False)

    print(f"Saved to {out_path}")

if __name__ == "__main__":
    main()

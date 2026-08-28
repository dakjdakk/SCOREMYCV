const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const headers = (prefer = "return=minimal") => ({
  "Content-Type": "application/json",
  "apikey": SUPABASE_SERVICE_KEY,
  "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Prefer": prefer,
});

export async function dbInsert(table: string, data: Record<string, any>) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Supabase insert FAILED [${table}]: HTTP ${res.status} — ${errText}`);
    } else {
      console.log(`Supabase insert OK [${table}]`);
    }
  } catch (e) {
    console.error(`Supabase insert error [${table}]:`, e);
  }
}

// Insert and return the new row (with id)
export async function dbInsertReturn(table: string, data: Record<string, any>): Promise<Record<string, any> | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: headers("return=representation"),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Supabase insertReturn FAILED [${table}]: HTTP ${res.status} — ${errText}`);
      return null;
    }
    const rows = await res.json();
    return Array.isArray(rows) ? rows[0] : null;
  } catch (e) {
    console.error(`Supabase insertReturn error [${table}]:`, e);
    return null;
  }
}

// Patch a row by id
export async function dbPatch(table: string, id: string, data: Record<string, any>) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Supabase patch FAILED [${table}]: HTTP ${res.status} — ${errText}`);
    }
  } catch (e) {
    console.error(`Supabase patch error [${table}]:`, e);
  }
}

export async function storageUpload(
  bucket: string,
  path: string,
  data: Buffer,
  contentType: string
): Promise<string | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "x-upsert": "true",
      },
      body: new Uint8Array(data) as BodyInit,
    });
    if (!res.ok) {
      console.error("Storage upload failed:", await res.text());
      return null;
    }
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
  } catch (e) {
    console.error("Storage upload error:", e);
    return null;
  }
}

export async function dbSelect(
  table: string,
  params: string,
  password: string
): Promise<any[]> {
  if (password !== "25227") return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
      headers: {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error(`Supabase select error [${table}]:`, e);
    return [];
  }
}

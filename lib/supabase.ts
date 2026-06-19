const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const headers = () => ({
  "Content-Type": "application/json",
  "apikey": SUPABASE_SERVICE_KEY,
  "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Prefer": "return=minimal",
});

export async function dbInsert(table: string, data: Record<string, any>) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
  } catch (e) {
    console.error(`Supabase insert error [${table}]:`, e);
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

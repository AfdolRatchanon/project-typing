/**
 * Firebase Emulator REST API helpers
 * ใช้ใน global-setup.ts และ spec files เพื่อสร้าง/ล้างข้อมูลทดสอบ
 */

const AUTH_EMU = 'http://localhost:9099';
const FIRESTORE_EMU = 'http://localhost:8080';
const PROJECT_ID = 'project-typing-2026';
const EMU_KEY = 'test'; // emulator รับ key อะไรก็ได้

// ── Auth ─────────────────────────────────────────────────────────────────────

/** สร้าง user ใน Auth Emulator — คืน uid */
export async function createEmulatorUser(
  email: string,
  password: string,
  displayName?: string,
): Promise<string> {
  const res = await fetch(
    `${AUTH_EMU}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${EMU_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName: displayName ?? email, returnSecureToken: true }),
    },
  );
  const data = await res.json();

  if (data.error?.message === 'EMAIL_EXISTS') {
    // account มีอยู่แล้ว — sign in เพื่อดึง uid
    const signIn = await fetch(
      `${AUTH_EMU}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${EMU_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      },
    );
    const sd = await signIn.json();
    return sd.localId as string;
  }

  if (data.error) throw new Error(`Auth create failed (${email}): ${data.error.message}`);
  return data.localId as string;
}

/** ลบ user ทั้งหมดใน Auth Emulator */
export async function clearAuthEmulator() {
  await fetch(
    `${AUTH_EMU}/emulator/v1/projects/${PROJECT_ID}/accounts`,
    { method: 'DELETE' },
  );
}

// ── Firestore ─────────────────────────────────────────────────────────────────

/** เขียน document ลง Firestore Emulator ตรงๆ (ใช้ Bearer owner เพื่อ bypass security rules) */
export async function writeFirestoreDoc(
  path: string, // เช่น 'users/uid123' หรือ 'classrooms/abc'
  data: Record<string, unknown>,
) {
  const fields = objToFirestore(data);
  const url = `${FIRESTORE_EMU}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer owner', // bypass security rules ใน emulator
    },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore write failed [${path}]: ${err}`);
  }
}

const EMU_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer owner',
};

/** อ่าน document จาก Firestore Emulator */
export async function readFirestoreDoc(path: string): Promise<Record<string, unknown> | null> {
  const url = `${FIRESTORE_EMU}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`;
  const res = await fetch(url, { headers: EMU_HEADERS });
  if (res.status === 404) return null;
  const data = await res.json();
  return firestoreToObj(data.fields ?? {});
}

/** ลบ collection ทั้งหมด (max 100 docs) */
export async function clearFirestoreCollection(collection: string) {
  const url = `${FIRESTORE_EMU}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}?pageSize=100`;
  const res = await fetch(url, { headers: EMU_HEADERS });
  const data = await res.json();
  if (!data.documents?.length) return;
  await Promise.all(
    (data.documents as { name: string }[]).map(doc =>
      fetch(`${FIRESTORE_EMU}/v1/${doc.name}`, { method: 'DELETE', headers: EMU_HEADERS }),
    ),
  );
}

// ── Firestore value converters ────────────────────────────────────────────────

function objToFirestore(obj: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFsValue(v);
  }
  return fields;
}

function toFsValue(v: unknown): unknown {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFsValue) } };
  if (typeof v === 'object') return { mapValue: { fields: objToFirestore(v as Record<string, unknown>) } };
  return { stringValue: String(v) };
}

function firestoreToObj(fields: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    out[k] = fromFsValue(v as Record<string, unknown>);
  }
  return out;
}

function fromFsValue(v: Record<string, unknown>): unknown {
  if ('nullValue' in v) return null;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('stringValue' in v) return v.stringValue;
  if ('arrayValue' in v) return ((v.arrayValue as any).values ?? []).map(fromFsValue);
  if ('mapValue' in v) return firestoreToObj((v.mapValue as any).fields ?? {});
  return null;
}

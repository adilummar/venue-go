import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// Force Node.js runtime so fs, crypto, and auth session cookies all work together
export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(request: NextRequest) {
  // ── 1. Auth first — must complete before touching request body ──────────────
  let session: { user?: { id?: string; role?: string } } | null = null;
  try {
    session = await auth() as { user?: { id?: string; role?: string } } | null;
  } catch {
    return NextResponse.json(
      { data: null, error: "Authentication error — please refresh and try again" },
      { status: 401 }
    );
  }

  if (!session?.user) {
    return NextResponse.json(
      { data: null, error: "Unauthorized — please log in first" },
      { status: 401 }
    );
  }

  // ── 2. Parse the multipart form ─────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err: any) {
    console.error("[upload] formData parse error:", err?.message);
    return NextResponse.json(
      { data: null, error: "Could not read uploaded file. Please try again." },
      { status: 400 }
    );
  }

  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { data: null, error: "No file provided" },
      { status: 400 }
    );
  }

  // ── 3. Validate ─────────────────────────────────────────────────────────────
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { data: null, error: `Unsupported format "${file.type}". Use JPEG, PNG, WebP, or AVIF.` },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return NextResponse.json(
      { data: null, error: `File too large (${mb}MB). Maximum allowed is 10MB.` },
      { status: 400 }
    );
  }

  // ── 4. Save to disk ─────────────────────────────────────────────────────────
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const safeExt = ["jpg", "jpeg", "png", "webp", "avif"].includes(ext) ? ext : "jpg";
    const filename = `${crypto.randomUUID()}.${safeExt}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "venues");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const fileUrl = `/uploads/venues/${filename}`;
    return NextResponse.json(
      { data: { url: fileUrl, publicId: filename }, error: null },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json(
      { data: null, error: "Failed to save file. Check server disk permissions." },
      { status: 500 }
    );
  }
}

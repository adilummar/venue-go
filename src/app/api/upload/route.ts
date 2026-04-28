import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(request: NextRequest) {
  try {
    // Use getToken (JWT-only, no DB needed) to check auth
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ data: null, error: "Unauthorized — please log in first" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ data: null, error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { data: null, error: "Only JPEG, PNG, WebP, and AVIF images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { data: null, error: "File size must be under 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${crypto.randomUUID()}.${ext}`;
    
    // Save to public/uploads/venues
    const uploadDir = path.join(process.cwd(), "public", "uploads", "venues");
    
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    // Return the URL path
    const fileUrl = `/uploads/venues/${filename}`;

    return NextResponse.json(
      { data: { url: fileUrl, publicId: filename }, error: null },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ data: null, error: "Failed to save file to local server disk" }, { status: 500 });
  }
}

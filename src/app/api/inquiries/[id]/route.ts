import { NextRequest, NextResponse } from "next/server";
import { updateInquiryStatus } from "@/db/queries/inquiries";
import { updateInquiryStatusSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "owner" && session.user.role !== "admin") {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateInquiryStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateInquiryStatus(id, parsed.data.status, parsed.data.whatsappSent);
    return NextResponse.json({ data: updated, error: null }, { status: 200 });
  } catch (err) {
    console.error("[PATCH /api/inquiries/[id]]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

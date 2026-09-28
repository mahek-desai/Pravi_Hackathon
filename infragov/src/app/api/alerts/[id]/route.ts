import { NextResponse } from "next/server";
import { updateAlertStatus } from "@/lib/services/alert";
import { getSession } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getSession();
    const body = await req.json();

    if (!body.status || !["ACKNOWLEDGED", "RESOLVED", "DISMISSED"].includes(body.status)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid status" } },
        { status: 400 }
      );
    }

    const userId = session?.id || "system";
    const updated = await updateAlertStatus(resolvedParams.id, body.status, userId);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}

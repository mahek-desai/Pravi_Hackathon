import { NextResponse } from "next/server";
import { updateWorkOrder } from "@/lib/services/workOrder";
import { getSession } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getSession();
    const body = await req.json();
    const userId = session?.id || body.userId || "system";

    const updated = await updateWorkOrder(resolvedParams.id, body, userId);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}

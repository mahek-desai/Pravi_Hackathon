import { NextResponse } from "next/server";
import { createWorkOrder, getWorkOrders } from "@/lib/services/workOrder";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get("assetId") || undefined;
    const status = searchParams.get("status") || undefined;
    const workOrders = await getWorkOrders({ assetId, status });
    return NextResponse.json({ success: true, data: workOrders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const createdById = session?.id || body.createdById;

    if (!createdById) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_UNAUTHORIZED", message: "User ID required" } },
        { status: 401 }
      );
    }

    const workOrder = await createWorkOrder({ ...body, createdById });
    return NextResponse.json({ success: true, data: workOrder }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}

import { NextResponse } from "next/server";
import { getInspections, submitInspection } from "@/lib/services/inspection";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get("assetId") || undefined;
    const inspections = await getInspections({ assetId });
    return NextResponse.json({ success: true, data: inspections });
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
    const inspectorId = session?.id || body.inspectorId;

    if (!inspectorId) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_UNAUTHORIZED", message: "Inspector ID required" } },
        { status: 401 }
      );
    }

    const result = await submitInspection({ ...body, inspectorId });
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}

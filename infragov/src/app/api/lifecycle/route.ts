import { NextResponse } from "next/server";
import { changeLifecycleStatus, getLifecycleStageCounts, getRecentLifecycleEvents } from "@/lib/services/lifecycle";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const [stageCounts, recentEvents] = await Promise.all([
      getLifecycleStageCounts(),
      getRecentLifecycleEvents(25),
    ]);
    return NextResponse.json({ success: true, data: { stageCounts, recentEvents } });
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

    if (!body.assetId || !body.newStatus) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "assetId and newStatus are required" } },
        { status: 400 }
      );
    }

    const userId = session?.id || "system";
    const updatedAsset = await changeLifecycleStatus(
      body.assetId,
      body.newStatus,
      userId,
      body.notes,
      body.cost ? parseFloat(body.cost) : undefined
    );

    return NextResponse.json({ success: true, data: updatedAsset });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}

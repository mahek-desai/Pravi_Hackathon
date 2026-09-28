import { NextResponse } from "next/server";
import { getAssetById } from "@/lib/services/asset";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const asset = await getAssetById(resolvedParams.id);
    if (!asset) {
      return NextResponse.json(
        { success: false, error: { code: "ASSET_NOT_FOUND", message: "Asset not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: asset });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

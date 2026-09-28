import { NextResponse } from "next/server";
import { createAsset, getAssets } from "@/lib/services/asset";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      search: searchParams.get("search") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      assetTypeId: searchParams.get("assetTypeId") || undefined,
      departmentId: searchParams.get("departmentId") || undefined,
      conditionLabel: searchParams.get("conditionLabel") || undefined,
      criticality: searchParams.get("criticality") || undefined,
      riskLabel: searchParams.get("riskLabel") || undefined,
      status: searchParams.get("status") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50,
    };

    const result = await getAssets(filters);
    return NextResponse.json({ success: true, data: result });
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
    const asset = await createAsset(body, session?.id);
    return NextResponse.json({ success: true, data: asset }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}

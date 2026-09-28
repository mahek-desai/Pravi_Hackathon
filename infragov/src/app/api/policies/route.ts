import { NextResponse } from "next/server";
import { getPolicies, createPolicy } from "@/lib/services/policy";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get("assetId") || undefined;
    const policyType = searchParams.get("policyType") || undefined;
    const status = searchParams.get("status") || undefined;
    const departmentId = searchParams.get("departmentId") || undefined;

    const policies = await getPolicies({ assetId, policyType, status, departmentId });
    return NextResponse.json({ success: true, data: policies });
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
    const userId = session?.id || "system";

    if (!body.assetId || !body.policyType) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "assetId and policyType required" } },
        { status: 400 }
      );
    }

    const policy = await createPolicy(body, userId);
    return NextResponse.json({ success: true, data: policy }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}

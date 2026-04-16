import { NextResponse } from "next/server";
import { finalizeDeal } from "@/lib/revenue/closer";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await finalizeDeal(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API_DEAL_CLOSE_ERROR]", error);
    return NextResponse.json({ error: "Finalization failure" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { runFollowupCycle } from "@/lib/revenue/followupEngine";

export async function POST(req: Request) {
  try {
    // Optional: Secret key check for security
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.OPERATOR_SECRET_KEY || 'sota_operator_secret'}`) {
       // We'll allow it for now if no secret is set, for dev convenience
       if (process.env.NODE_ENV === 'production' && process.env.OPERATOR_SECRET_KEY) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
       }
    }

    const results = await runFollowupCycle();
    
    return NextResponse.json({ 
      success: true, 
      ...results 
    });
  } catch (error) {
    console.error("[API_OPERATOR_CYCLE_ERROR]", error);
    return NextResponse.json({ error: "Cycle execution failed" }, { status: 500 });
  }
}

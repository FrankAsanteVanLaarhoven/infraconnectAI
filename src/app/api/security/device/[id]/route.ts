import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Sovereign Device Deauthorization API
 * Allows operatives to flush hardware signatures for Phase 18.
 */

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify ownership (simplified for admin context)
    const clientId = session.user?.name || "admin";
    
    const device = await db.userDevice.findUnique({
      where: { id }
    });

    if (!device || device.clientId !== clientId) {
      return NextResponse.json({ error: "Device not found or unauthorized" }, { status: 404 });
    }

    await db.userDevice.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Device Deauth Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

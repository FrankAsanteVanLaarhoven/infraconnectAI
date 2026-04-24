import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urdfContent, robotName, simConfig, parsedData } = body;

    if (!urdfContent || !robotName) {
      return NextResponse.json(
        { success: false, error: 'urdfContent and robotName are required' },
        { status: 400 }
      );
    }

    // Store the imported robot in the database
    const robot = await db.robotModel.create({
      data: {
        name: robotName,
        urdfContent,
        simConfig: typeof simConfig === 'string' ? simConfig : JSON.stringify(simConfig || {}),
        status: 'IMPORTED',
        jointCount: parsedData?.joints?.length || 0,
        linkCount: parsedData?.links?.length || 0,
        totalMass: parsedData?.totalMass || 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Robot "${robotName}" imported successfully with exact real-world specifications`,
      robotId: robot.id,
      simConfig: simConfig || null,
      parsed: {
        jointCount: parsedData?.joints?.length || 0,
        linkCount: parsedData?.links?.length || 0,
        totalMass: parsedData?.totalMass || 0,
        dof: parsedData?.revoluteJoints?.length || 0,
      },
    });
  } catch (error) {
    console.error('URDF import error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import URDF' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const robots = await db.robotModel.findMany({
      orderBy: { importedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      robots: robots.map((r) => ({
        id: r.id,
        name: r.name,
        status: r.status,
        jointCount: r.jointCount,
        linkCount: r.linkCount,
        totalMass: r.totalMass,
        importedAt: r.importedAt,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch robots' },
      { status: 500 }
    );
  }
}

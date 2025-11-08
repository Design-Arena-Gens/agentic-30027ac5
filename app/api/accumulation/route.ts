import { NextResponse } from 'next/server';
import { computeAccumulation } from '@/lib/accumulation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await computeAccumulation();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to compute accumulation signals.'
      },
      { status: 500 }
    );
  }
}

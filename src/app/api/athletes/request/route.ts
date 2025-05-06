import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'COACH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { athleteId } = await request.json();
    // Prevent duplicate requests
    const existing = await prisma.coachAthlete.findFirst({
      where: { coachId: session.user.id, athleteId },
    });
    if (existing) {
      return NextResponse.json({ error: 'Request already exists' }, { status: 400 });
    }
    await prisma.coachAthlete.create({
      data: {
        coachId: session.user.id,
        athleteId,
        status: 'PENDING',
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
  }
} 
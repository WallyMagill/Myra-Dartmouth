import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ATHLETE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const requests = await prisma.coachAthlete.findMany({
      where: { athleteId: session.user.id, status: 'PENDING' },
      include: {
        coach: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    return NextResponse.json(requests.map(r => ({ id: r.id, coach: r.coach })));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
} 
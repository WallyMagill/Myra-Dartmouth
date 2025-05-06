import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { testSessionSchema } from '@/lib/validations/test-session';
import { UserRole } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testSessions = await prisma.testSession.findMany({
      include: {
        athlete: true,
        conductedBy: true,
        protocol: true,
        schedule: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(testSessions);
  } catch (error) {
    console.error('Error fetching test sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
    });

    if (!user || user.role !== UserRole.COACH) {
      return NextResponse.json(
        { error: 'Only coaches can create test sessions' },
        { status: 403 }
      );
    }

    const json = await request.json();
    const body = testSessionSchema.parse(json);

    const testSession = await prisma.testSession.create({
      data: {
        ...body,
        conductedById: user.id,
      },
      include: {
        athlete: true,
        conductedBy: true,
        protocol: true,
        schedule: true,
      },
    });

    return NextResponse.json(testSession);
  } catch (error) {
    console.error('Error creating test session:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
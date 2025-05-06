import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Input validation schema for updates
const athleteUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this athlete
    const hasAccess = await prisma.coachAthlete.findFirst({
      where: {
        coachId: session.user.id,
        athleteId: params.id,
      },
    });

    if (session.user.role !== 'ADMIN' && !hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const athlete = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        height: true,
        weight: true,
        dateOfBirth: true,
        gender: true,
        athleteTests: {
          select: {
            id: true,
            date: true,
            protocol: {
              select: {
                name: true,
                testType: true,
              },
            },
          },
        },
      },
    });

    if (!athlete) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 });
    }

    return NextResponse.json(athlete);
  } catch (error) {
    console.error('Error fetching athlete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['COACH', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this athlete
    const hasAccess = await prisma.coachAthlete.findFirst({
      where: {
        coachId: session.user.id,
        athleteId: params.id,
      },
    });

    if (session.user.role !== 'ADMIN' && !hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = athleteUpdateSchema.parse(body);

    const athlete = await prisma.user.update({
      where: { id: params.id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        height: true,
        weight: true,
        dateOfBirth: true,
        gender: true,
      },
    });

    return NextResponse.json(athlete);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating athlete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['COACH', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this athlete
    const hasAccess = await prisma.coachAthlete.findFirst({
      where: {
        coachId: session.user.id,
        athleteId: params.id,
      },
    });

    if (session.user.role !== 'ADMIN' && !hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete coach-athlete relationship if it exists
    await prisma.coachAthlete.deleteMany({
      where: { athleteId: params.id },
    });

    // Delete the athlete
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting athlete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
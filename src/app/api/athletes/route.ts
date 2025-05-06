import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Input validation schema
const athleteSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  height: z.number().optional(),
  weight: z.number().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams, pathname } = new URL(request.url);
  const searchQuery = searchParams.get('search');
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Search endpoint for coaches
    if (searchQuery && session.user.role === 'COACH') {
      // Get all athletes already connected or requested
      const coachAthletes = await prisma.coachAthlete.findMany({
        where: { coachId: session.user.id },
        select: { athleteId: true },
      });
      const excludedIds = coachAthletes.map(ca => ca.athleteId);
      const athletes = await prisma.user.findMany({
        where: {
          role: 'ATHLETE',
          id: { notIn: excludedIds },
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
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
      return NextResponse.json(athletes);
    }

    // If user is a coach, get their athletes
    if (session.user.role === 'COACH') {
      const coachAthletes = await prisma.coachAthlete.findMany({
        where: { coachId: session.user.id },
        include: {
          athlete: {
            select: {
              id: true,
              name: true,
              email: true,
              height: true,
              weight: true,
              dateOfBirth: true,
              gender: true,
            },
          },
        },
      });

      const accepted = coachAthletes
        .filter(ca => ca.status === 'ACCEPTED')
        .map(ca => ca.athlete);
      const pending = coachAthletes
        .filter(ca => ca.status === 'PENDING')
        .map(ca => ca.athlete);

      return NextResponse.json({ accepted, pending });
    }

    // If user is an admin, get all athletes
    if (session.user.role === 'ADMIN') {
      const athletes = await prisma.user.findMany({
        where: { role: 'ATHLETE' },
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
      
      return NextResponse.json(athletes);
    }

    // Athlete: Get pending coach requests
    if (pathname.endsWith('/pending-coach-requests')) {
      try {
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

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    console.error('Error fetching athletes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { pathname } = new URL(request.url);
  if (pathname.endsWith('/request')) {
    // Handle coach sending a request to an athlete
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

  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['COACH', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = athleteSchema.parse(body);

    // Create the athlete
    const athlete = await prisma.user.create({
      data: {
        ...validatedData,
        role: 'ATHLETE',
      },
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

    // If the creator is a coach, create the coach-athlete relationship
    if (session.user.role === 'COACH') {
      await prisma.coachAthlete.create({
        data: {
          coachId: session.user.id,
          athleteId: athlete.id,
        },
      });
    }

    return NextResponse.json(athlete, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating athlete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { pathname } = new URL(request.url);
  if (pathname.endsWith('/accept-coach-request')) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== 'ATHLETE') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const { requestId } = await request.json();
      const requestRecord = await prisma.coachAthlete.findUnique({ where: { id: requestId } });
      if (!requestRecord || requestRecord.athleteId !== session.user.id) {
        return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
      }
      await prisma.coachAthlete.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      });
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to accept request' }, { status: 500 });
    }
  }
} 
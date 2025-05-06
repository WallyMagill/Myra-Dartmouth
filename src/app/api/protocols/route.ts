import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Input validation schema
const protocolSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  testType: z.enum(['TREADMILL', 'SKI_ERG', 'BIKE_ERG']),
  stages: z.array(z.object({
    duration: z.number().min(1), // in minutes
    intensity: z.number().min(0).max(100), // percentage
    targetHeartRate: z.number().optional(),
    targetLactate: z.number().optional(),
    notes: z.string().optional(),
  })),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If user is a coach, get their protocols
    if (session.user.role === 'COACH') {
      const protocols = await prisma.testProtocol.findMany({
        where: { createdBy: session.user.id },
        include: {
          creator: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
      
      return NextResponse.json(protocols);
    }

    // If user is an admin, get all protocols
    if (session.user.role === 'ADMIN') {
      const protocols = await prisma.testProtocol.findMany({
        include: {
          creator: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
      
      return NextResponse.json(protocols);
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    console.error('Error fetching protocols:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['COACH', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = protocolSchema.parse(body);

    const protocol = await prisma.testProtocol.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(protocol, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating protocol:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Input validation schema for updates
const protocolUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  testType: z.enum(['TREADMILL', 'SKI_ERG', 'BIKE_ERG']).optional(),
  stages: z.array(z.object({
    duration: z.number().min(1), // in minutes
    intensity: z.number().min(0).max(100), // percentage
    targetHeartRate: z.number().optional(),
    targetLactate: z.number().optional(),
    notes: z.string().optional(),
  })).optional(),
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

    const protocol = await prisma.testProtocol.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
        sessions: {
          select: {
            id: true,
            date: true,
            athlete: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!protocol) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    // Check if user has access to this protocol
    if (session.user.role !== 'ADMIN' && protocol.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(protocol);
  } catch (error) {
    console.error('Error fetching protocol:', error);
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

    // Check if protocol exists and user has access
    const existingProtocol = await prisma.testProtocol.findUnique({
      where: { id: params.id },
    });

    if (!existingProtocol) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    if (session.user.role !== 'ADMIN' && existingProtocol.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = protocolUpdateSchema.parse(body);

    const protocol = await prisma.testProtocol.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(protocol);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating protocol:', error);
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

    // Check if protocol exists and user has access
    const existingProtocol = await prisma.testProtocol.findUnique({
      where: { id: params.id },
    });

    if (!existingProtocol) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    if (session.user.role !== 'ADMIN' && existingProtocol.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the protocol
    await prisma.testProtocol.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting protocol:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
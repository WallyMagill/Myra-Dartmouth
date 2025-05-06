import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { updateTestSessionSchema } from '@/lib/validations/test-session';
import { UserRole } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testSession = await prisma.testSession.findUnique({
      where: { id: params.id },
      include: {
        athlete: true,
        conductedBy: true,
        protocol: true,
        schedule: true,
      },
    });

    if (!testSession) {
      return NextResponse.json(
        { error: 'Test session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(testSession);
  } catch (error) {
    console.error('Error fetching test session:', error);
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
    });

    if (!user || user.role !== UserRole.COACH) {
      return NextResponse.json(
        { error: 'Only coaches can update test sessions' },
        { status: 403 }
      );
    }

    const json = await request.json();
    const body = updateTestSessionSchema.parse(json);

    const testSession = await prisma.testSession.update({
      where: { id: params.id },
      data: body,
      include: {
        athlete: true,
        conductedBy: true,
        protocol: true,
        schedule: true,
      },
    });

    return NextResponse.json(testSession);
  } catch (error) {
    console.error('Error updating test session:', error);
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
        { error: 'Only coaches can delete test sessions' },
        { status: 403 }
      );
    }

    await prisma.testSession.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting test session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { InterviewerStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authErrorStatus, requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth(['ADMIN']);

    const interviewers = await prisma.interviewerProfile.findMany({
      include: {
        user: {
          select: { email: true, name: true, profilePicture: true, provider: true },
        },
        _count: {
          select: {
            sessions: {
              where: { status: 'SCHEDULED', scheduledTime: { gte: new Date() } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ interviewers });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: authErrorStatus(error.message) }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAuth(['ADMIN']);
    const body = await request.json();
    const interviewerId = Number(body.interviewerId);
    const status = String(body.status || '');

    if (!interviewerId || !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid interviewer update' }, { status: 400 });
    }

    const interviewer = await prisma.interviewerProfile.update({
      where: { id: interviewerId },
      data: { status: status as InterviewerStatus },
    });

    return NextResponse.json({ interviewer });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: authErrorStatus(error.message) }
    );
  }
}

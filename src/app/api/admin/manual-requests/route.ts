import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authErrorStatus, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(['ADMIN']);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';

    const requests = await prisma.manual_booking_requests.findMany({
      where: status === 'ALL' ? {} : { status: status as any },
      include: {
        student_profiles: {
          include: {
            user: { select: { email: true, name: true, profilePicture: true } },
          },
        },
        interviewer_profiles: {
          include: {
            user: { select: { email: true, name: true, profilePicture: true } },
          },
        },
        sessions: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const normalized = requests.map((request) => ({
      id: request.id,
      status: request.status,
      sessionType: request.session_type,
      role: request.role,
      difficulty: request.difficulty,
      interviewType: request.interview_type,
      topic: request.topic,
      paymentStatus: request.payment_status,
      createdAt: request.created_at,
      preferredInterviewerId: request.preferred_interviewer_id,
      student: {
        name: request.student_profiles.name,
        user: request.student_profiles.user,
      },
      preferredInterviewer: request.interviewer_profiles
        ? {
            name: request.interviewer_profiles.name,
            user: request.interviewer_profiles.user,
          }
        : null,
      session: request.sessions ? { id: request.sessions.id } : null,
    }));

    return NextResponse.json({ requests: normalized });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: authErrorStatus(error.message) }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(['ADMIN']);
    const body = await request.json();
    const requestId = Number(body.requestId);
    const interviewerId = Number(body.interviewerId);
    const scheduledTime = body.scheduledTime;
    const durationMinutes = Number(body.durationMinutes || 60);

    if (!requestId || !interviewerId || !scheduledTime) {
      return NextResponse.json(
        { error: 'requestId, interviewerId and scheduledTime are required.' },
        { status: 400 }
      );
    }

    const manualRequest = await prisma.manual_booking_requests.findUnique({
      where: { id: requestId },
      include: {
        student_profiles: {
          include: { user: { select: { email: true, name: true } } },
        },
      },
    });

    if (!manualRequest || manualRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request is unavailable.' }, { status: 400 });
    }

    const interviewer = await prisma.interviewerProfile.findUnique({
      where: { id: interviewerId },
    });

    if (!interviewer || interviewer.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Interviewer not approved.' }, { status: 400 });
    }

    const session = await prisma.session.create({
      data: {
        studentId: manualRequest.student_id,
        interviewerId,
        sessionType: manualRequest.session_type,
        status: 'SCHEDULED',
        scheduledTime: new Date(scheduledTime),
        durationMinutes,
        topic: manualRequest.topic || null,
        role: manualRequest.role || null,
        difficulty: manualRequest.difficulty || null,
        interviewType: manualRequest.interview_type || null,
      },
    });

    await prisma.manual_booking_requests.update({
      where: { id: manualRequest.id },
      data: {
        status: 'ASSIGNED',
        preferred_interviewer_id: interviewerId,
        session_id: session.id,
      },
    });

    await prisma.studentProfile.update({
      where: { id: manualRequest.student_id },
      data:
        manualRequest.session_type === 'INTERVIEW'
          ? { interviewsUsed: { increment: 1 } }
          : { guidanceUsed: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      message: 'Interviewer assigned successfully.',
      sessionId: session.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: authErrorStatus(error.message) }
    );
  }
}

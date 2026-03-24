import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, authErrorStatus } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAuth(['ADMIN']);

    const [
      totalStudents,
      totalInterviewers,
      pendingInterviewers,
      approvedInterviewers,
      totalSessions,
      completedSessions,
      scheduledSessions,
      guidanceSessions,
      interviewSessions,
      recentSessionsRaw,
      topInterviewersRaw,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.interviewerProfile.count(),
      prisma.interviewerProfile.count({ where: { status: 'PENDING' } }),
      prisma.interviewerProfile.count({ where: { status: 'APPROVED' } }),
      prisma.session.count(),
      prisma.session.count({ where: { status: 'COMPLETED' } }),
      prisma.session.count({ where: { status: 'SCHEDULED' } }),
      prisma.session.count({ where: { sessionType: 'GUIDANCE' } }),
      prisma.session.count({ where: { sessionType: 'INTERVIEW' } }),
      prisma.session.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { name: true } },
          interviewer: { select: { name: true } },
        },
      }),
      prisma.interviewerProfile.findMany({
        take: 5,
        where: { status: 'APPROVED' },
        select: {
          id: true,
          name: true,
          rolesSupported: true,
          _count: {
            select: {
              sessions: {
                where: { status: 'COMPLETED' },
              },
            },
          },
        },
        orderBy: {
          sessions: { _count: 'desc' },
        },
      }),
    ]);

    const recentSessions = recentSessionsRaw.map((session) => ({
      id: session.id,
      sessionType: session.sessionType,
      status: session.status,
      scheduledTime: session.scheduledTime,
      student: { name: session.student.name },
      interviewer: { name: session.interviewer.name },
    }));

    const topInterviewers = topInterviewersRaw.map((interviewer) => ({
      id: interviewer.id,
      name: interviewer.name,
      rolesSupported: interviewer.rolesSupported,
      sessionCount: interviewer._count.sessions,
    }));

    return NextResponse.json({
      analytics: {
        totalStudents,
        totalInterviewers,
        pendingInterviewers,
        approvedInterviewers,
        totalSessions,
        completedSessions,
        scheduledSessions,
        guidanceSessions,
        interviewSessions,
      },
      recentSessions,
      topInterviewers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: authErrorStatus(error.message) }
    );
  }
}

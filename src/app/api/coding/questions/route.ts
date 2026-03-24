import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authErrorStatus, requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth(['ADMIN']);

    const questions = await prisma.codingQuestion.findMany({
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        category: true,
        isActive: true,
      },
    });

    return NextResponse.json({ questions });
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

    const question = await prisma.codingQuestion.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        difficulty: body.difficulty,
        category: body.category,
        tags: body.tags || [],
        constraints: body.constraints || null,
        hints: body.hints || [],
        examples: body.examples,
        testCases: body.testCases,
        starterCode: body.starterCode,
        solution: body.solution || null,
        orderIndex: Number(body.orderIndex || 0),
      },
    });

    return NextResponse.json({ question });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: authErrorStatus(error.message) }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authErrorStatus, requireAuth } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await requireAuth(['ADMIN']);

    const question = await prisma.codingQuestion.findUnique({
      where: { slug: params.slug },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ question });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: authErrorStatus(error.message) }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await requireAuth(['ADMIN']);
    const body = await request.json();

    const question = await prisma.codingQuestion.update({
      where: { slug: params.slug },
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await requireAuth(['ADMIN']);
    await prisma.codingQuestion.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: authErrorStatus(error.message) }
    );
  }
}

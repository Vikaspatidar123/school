import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: testId } = await params;
    const userId = (session.user as any).id;

    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      return NextResponse.json({ error: "Student record not found" }, { status: 404 });
    }

    const test = await prisma.practiceTest.findUnique({
      where: { id: testId },
      include: { attempts: { where: { studentId: student.id } } },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const hasAttempted = test.attempts.length > 0;
    let questions: any[] = [];
    try { questions = JSON.parse(test.questions); } catch { questions = []; }

    // If student hasn't attempted, strip correct answers
    const sanitizedQuestions = hasAttempted
      ? questions
      : questions.map((q: any) => ({
          id: q.id,
          question: q.question,
          options: q.options,
        }));

    return NextResponse.json({
      id: test.id,
      title: test.title,
      subject: test.subject,
      totalMarks: test.totalMarks,
      duration: test.duration,
      questions: sanitizedQuestions,
      hasAttempted,
      attempt: hasAttempted ? test.attempts[0] : null,
    });
  } catch (error) {
    console.error("Practice test GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: testId } = await params;
    const userId = (session.user as any).id;

    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      return NextResponse.json({ error: "Student record not found" }, { status: 404 });
    }

    // Check if already attempted
    const existingAttempt = await prisma.practiceTestAttempt.findUnique({
      where: { testId_studentId: { testId, studentId: student.id } },
    });
    if (existingAttempt) {
      return NextResponse.json({ error: "You have already attempted this test" }, { status: 400 });
    }

    const test = await prisma.practiceTest.findUnique({ where: { id: testId } });
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const body = await req.json();
    const { answers, timeTaken } = body;
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "answers object is required" }, { status: 400 });
    }

    let questions: any[] = [];
    try { questions = JSON.parse(test.questions); } catch {
      return NextResponse.json({ error: "Invalid test data" }, { status: 500 });
    }

    // Calculate score — seed uses "correct" field
    let correctCount = 0;
    for (const q of questions) {
      const qId = String(q.id);
      if (answers[qId] === q.correct) {
        correctCount++;
      }
    }

    const totalQuestions = questions.length;
    const score = totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * test.totalMarks)
      : 0;

    const attempt = await prisma.practiceTestAttempt.create({
      data: {
        testId,
        studentId: student.id,
        answers: JSON.stringify(answers),
        score,
        totalQuestions,
        timeTaken: timeTaken ?? null,
      },
    });

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        totalMarks: test.totalMarks,
        timeTaken: attempt.timeTaken,
        correctCount,
      },
      // Return correct answers so the review screen works
      questions: questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct: q.correct,
      })),
    }, { status: 201 });
  } catch (error) {
    console.error("Practice test POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student record not found" }, { status: 404 });
    }

    const tests = await prisma.practiceTest.findMany({
      include: {
        attempts: {
          where: { studentId: student.id },
          select: {
            id: true,
            score: true,
            totalQuestions: true,
            timeTaken: true,
            completedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = tests.map((t) => {
      let questionCount = 0;
      try {
        const questions = JSON.parse(t.questions);
        questionCount = Array.isArray(questions) ? questions.length : 0;
      } catch {
        questionCount = 0;
      }

      return {
        id: t.id,
        title: t.title,
        subject: t.subject,
        totalMarks: t.totalMarks,
        duration: t.duration,
        questionCount,
        attempted: t.attempts.length > 0,
        attempt: t.attempts.length > 0 ? t.attempts[0] : null,
      };
    });

    return NextResponse.json({ tests: formatted });
  } catch (error) {
    console.error("Practice tests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

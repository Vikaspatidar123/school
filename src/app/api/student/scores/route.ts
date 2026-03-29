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

    const results = await prisma.result.findMany({
      where: { studentId: student.id },
      include: {
        exam: {
          select: {
            name: true,
            examType: true,
            totalMarks: true,
            subject: true,
            date: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group results by subject
    const grouped: Record<
      string,
      Array<{
        examName: string;
        examType: string;
        marks: number;
        totalMarks: number;
        grade: string | null;
        rank: number | null;
        date: Date;
      }>
    > = {};

    for (const r of results) {
      const subject = r.exam.subject;
      if (!grouped[subject]) {
        grouped[subject] = [];
      }
      grouped[subject].push({
        examName: r.exam.name,
        examType: r.exam.examType,
        marks: r.marks,
        totalMarks: r.exam.totalMarks,
        grade: r.grade,
        rank: r.rank,
        date: r.exam.date,
      });
    }

    return NextResponse.json({ scores: grouped });
  } catch (error) {
    console.error("Scores error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

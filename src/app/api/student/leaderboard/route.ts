import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all students with their results and exam details
    const students = await prisma.student.findMany({
      where: { status: "active" },
      include: {
        user: { select: { name: true } },
        class: { select: { name: true, section: true } },
        results: {
          include: {
            exam: { select: { totalMarks: true } },
          },
        },
      },
    });

    // Calculate average percentage for each student
    const leaderboard = students
      .filter((s) => s.results.length > 0)
      .map((s) => {
        const totalPercentage = s.results.reduce((sum, r) => {
          return sum + (r.marks / r.exam.totalMarks) * 100;
        }, 0);
        const averagePercentage =
          Math.round((totalPercentage / s.results.length) * 100) / 100;

        return {
          studentId: s.id,
          name: s.user.name,
          class: s.class ? `${s.class.name} - ${s.class.section}` : null,
          averagePercentage,
          totalExams: s.results.length,
        };
      })
      .sort((a, b) => b.averagePercentage - a.averagePercentage)
      .slice(0, 10);

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

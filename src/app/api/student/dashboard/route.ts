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
      include: {
        user: { select: { name: true, email: true } },
        class: { select: { name: true, section: true } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student record not found" }, { status: 404 });
    }

    // Attendance summary
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId: student.id },
    });

    const totalRecords = attendanceRecords.length;
    const present = attendanceRecords.filter((a) => a.status === "present").length;
    const absent = attendanceRecords.filter((a) => a.status === "absent").length;
    const late = attendanceRecords.filter((a) => a.status === "late").length;
    const attendancePercentage = totalRecords > 0 ? Math.round((present / totalRecords) * 100 * 100) / 100 : 0;

    const attendanceSummary = {
      total: totalRecords,
      present,
      absent,
      late,
      attendancePercentage,
    };

    // Recent 5 results
    const recentResults = await prisma.result.findMany({
      where: { studentId: student.id },
      include: {
        exam: { select: { name: true, subject: true, totalMarks: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const formattedResults = recentResults.map((r) => ({
      examName: r.exam.name,
      subject: r.exam.subject,
      marks: r.marks,
      totalMarks: r.exam.totalMarks,
      grade: r.grade,
    }));

    // Pending fees
    const pendingFees = await prisma.fee.findMany({
      where: {
        studentId: student.id,
        status: { in: ["pending", "overdue"] },
      },
    });

    const pendingFeesCount = pendingFees.length;
    const pendingFeesTotal = pendingFees.reduce((sum, f) => sum + f.amount, 0);

    // Overall average percentage
    const allResults = await prisma.result.findMany({
      where: { studentId: student.id },
      include: { exam: { select: { totalMarks: true } } },
    });

    let averagePercentage = 0;
    if (allResults.length > 0) {
      const totalPercentage = allResults.reduce((sum, r) => {
        return sum + (r.marks / r.exam.totalMarks) * 100;
      }, 0);
      averagePercentage = Math.round((totalPercentage / allResults.length) * 100) / 100;
    }

    return NextResponse.json({
      profile: {
        name: student.user.name,
        email: student.user.email,
        class: student.class ? `${student.class.name} - ${student.class.section}` : null,
        rollNo: student.rollNo,
        admissionNo: student.admissionNo,
      },
      attendanceSummary,
      recentResults: formattedResults,
      fees: {
        pendingCount: pendingFeesCount,
        totalAmount: pendingFeesTotal,
      },
      averagePercentage,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

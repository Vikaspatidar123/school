import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    pendingFees,
    paidFees,
    todayAttendance,
    recentStudents,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.class.count(),
    prisma.fee.aggregate({ where: { status: { not: "paid" } }, _sum: { amount: true } }),
    prisma.fee.aggregate({ where: { status: "paid" }, _sum: { amount: true } }),
    prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.student.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } }, class: true },
    }),
  ]);

  const presentToday = todayAttendance.filter((a) => a.status === "present").length;
  const absentToday = todayAttendance.filter((a) => a.status === "absent").length;
  const lateToday = todayAttendance.filter((a) => a.status === "late").length;

  return NextResponse.json({
    totalStudents,
    totalTeachers,
    totalClasses,
    pendingFees: pendingFees._sum.amount || 0,
    paidFees: paidFees._sum.amount || 0,
    attendance: { present: presentToday, absent: absentToday, late: lateToday, total: todayAttendance.length },
    recentStudents,
  });
}

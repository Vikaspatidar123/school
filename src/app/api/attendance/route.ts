import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = req.nextUrl.searchParams;
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const classId = searchParams.get("classId") || "";

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const where: Record<string, unknown> = {
    date: { gte: startOfDay, lte: endOfDay },
  };

  if (classId) {
    where.student = { classId };
  }

  const attendance = await prisma.attendance.findMany({
    where,
    include: {
      student: {
        include: {
          user: { select: { name: true } },
          class: true,
        },
      },
    },
    orderBy: { student: { rollNo: "asc" } },
  });

  return NextResponse.json(attendance);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role: string }).role;
  if (role !== "admin" && role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { records } = body; // [{ studentId, date, status }]

  const results = [];
  for (const record of records) {
    const date = new Date(record.date);
    date.setHours(0, 0, 0, 0);

    const result = await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId: record.studentId,
          date,
        },
      },
      update: { status: record.status },
      create: {
        studentId: record.studentId,
        date,
        status: record.status,
      },
    });
    results.push(result);
  }

  return NextResponse.json(results, { status: 201 });
}

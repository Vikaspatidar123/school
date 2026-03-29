import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const day = searchParams.get("day");

    const where: Record<string, string> = {};
    if (classId) where.classId = classId;
    if (day) where.day = day;

    const timetable = await prisma.timetable.findMany({
      where,
      include: {
        class: true,
        subject: true,
        teacher: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(timetable);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role: string }).role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { classId, subjectId, teacherId, day, startTime, endTime, room } = body;

    const entry = await prisma.timetable.create({
      data: {
        classId,
        subjectId,
        teacherId,
        day,
        startTime,
        endTime,
        room,
      },
      include: {
        class: true,
        subject: true,
        teacher: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create timetable entry" }, { status: 500 });
  }
}

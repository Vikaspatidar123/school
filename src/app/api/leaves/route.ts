import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const role = (session.user as { role: string }).role;
    const userId = (session.user as { id: string }).id;

    let where = {};

    // Teachers can only see their own leaves
    if (role === "teacher") {
      const teacher = await prisma.teacher.findUnique({ where: { userId } });
      if (teacher) {
        where = { teacherId: teacher.id };
      }
    }

    const leaves = await prisma.leave.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leaves);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaves" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role: string }).role;
  if (role !== "teacher") {
    return NextResponse.json({ error: "Only teachers can apply for leave" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { startDate, endDate, reason, type } = body;
    const userId = (session.user as { id: string }).id;

    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    const leave = await prisma.leave.create({
      data: {
        teacherId: teacher.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        type: type || "casual",
        status: "pending",
      },
      include: {
        teacher: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json(leave, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role: string }).role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Only admin can approve/reject leaves" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Use 'approved' or 'rejected'" }, { status: 400 });
    }

    const leave = await prisma.leave.update({
      where: { id },
      data: { status },
      include: {
        teacher: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json(leave);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update leave" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      class: true,
      parent: { include: { user: { select: { name: true } } } },
      attendance: { orderBy: { date: "desc" }, take: 30 },
      fees: { orderBy: { createdAt: "desc" } },
      results: { include: { exam: true } },
    },
  });

  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(student);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, classId, rollNo, dob, address, phone } = body;

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (name) {
    await prisma.user.update({ where: { id: student.userId }, data: { name } });
  }

  const updated = await prisma.student.update({
    where: { id },
    data: {
      classId: classId || undefined,
      rollNo: rollNo || undefined,
      dob: dob ? new Date(dob) : undefined,
      address: address || undefined,
      phone: phone || undefined,
    },
    include: {
      user: { select: { name: true, email: true } },
      class: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.student.delete({ where: { id } });
  await prisma.user.delete({ where: { id: student.userId } });

  return NextResponse.json({ message: "Deleted" });
}

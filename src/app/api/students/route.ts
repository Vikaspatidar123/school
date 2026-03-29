import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const classId = searchParams.get("classId") || "";

  const where: Record<string, unknown> = {};
  if (classId) where.classId = classId;
  if (search) {
    where.user = { name: { contains: search } };
  }

  const students = await prisma.student.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      class: true,
      parent: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, classId, rollNo, dob, address, phone } = body;

  const hashedPassword = await bcrypt.hash("student123", 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "student",
    },
  });

  const student = await prisma.student.create({
    data: {
      userId: user.id,
      classId: classId || null,
      rollNo,
      dob: dob ? new Date(dob) : null,
      address,
      phone,
    },
    include: {
      user: { select: { name: true, email: true } },
      class: true,
    },
  });

  return NextResponse.json(student, { status: 201 });
}

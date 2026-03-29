import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get("status") || "";
  const studentId = searchParams.get("studentId") || "";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (studentId) where.studentId = studentId;

  const fees = await prisma.fee.findMany({
    where,
    include: {
      student: {
        include: {
          user: { select: { name: true } },
          class: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(fees);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { studentId, amount, type, dueDate } = body;

  const fee = await prisma.fee.create({
    data: {
      studentId,
      amount: parseFloat(amount),
      type,
      dueDate: new Date(dueDate),
    },
    include: {
      student: {
        include: { user: { select: { name: true } } },
      },
    },
  });

  return NextResponse.json(fee, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, status } = body;

  const fee = await prisma.fee.update({
    where: { id },
    data: {
      status,
      paidDate: status === "paid" ? new Date() : null,
    },
  });

  return NextResponse.json(fee);
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teachers = await prisma.teacher.findMany({
      where: { status: "active" },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const formatted = teachers.map((t) => ({
      id: t.id,
      name: t.user.name,
      email: t.user.email,
      subject: t.subject,
      qualification: t.qualification,
      phone: t.phone,
      employeeId: t.employeeId,
    }));

    return NextResponse.json({ teachers: formatted });
  } catch (error) {
    console.error("Teachers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

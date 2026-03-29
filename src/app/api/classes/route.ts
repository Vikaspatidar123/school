import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classes = await prisma.class.findMany({
    include: {
      teacher: { include: { user: { select: { name: true } } } },
      _count: { select: { students: true } },
    },
    orderBy: [{ name: "asc" }, { section: "asc" }],
  });

  return NextResponse.json(classes);
}

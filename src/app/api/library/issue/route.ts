import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const issues = await prisma.bookIssue.findMany({
      include: {
        book: { select: { title: true, author: true, isbn: true } },
        student: {
          include: {
            user: { select: { name: true } },
            class: { select: { name: true, section: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(issues);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch book issues" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role: string }).role;
  if (role !== "admin" && role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { bookId, studentId, dueDate } = body;

    // Check book availability
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.available <= 0) {
      return NextResponse.json({ error: "Book not available" }, { status: 400 });
    }

    // Create issue and decrement availability in a transaction
    const issue = await prisma.$transaction(async (tx) => {
      await tx.book.update({
        where: { id: bookId },
        data: { available: { decrement: 1 } },
      });

      return tx.bookIssue.create({
        data: {
          bookId,
          studentId,
          dueDate: new Date(dueDate),
          status: "issued",
        },
        include: {
          book: { select: { title: true } },
          student: { include: { user: { select: { name: true } } } },
        },
      });
    });

    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to issue book" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role: string }).role;
  if (role !== "admin" && role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { issueId, fine } = body;

    const existingIssue = await prisma.bookIssue.findUnique({ where: { id: issueId } });
    if (!existingIssue) {
      return NextResponse.json({ error: "Issue record not found" }, { status: 404 });
    }
    if (existingIssue.status === "returned") {
      return NextResponse.json({ error: "Book already returned" }, { status: 400 });
    }

    // Return book and increment availability in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      await tx.book.update({
        where: { id: existingIssue.bookId },
        data: { available: { increment: 1 } },
      });

      return tx.bookIssue.update({
        where: { id: issueId },
        data: {
          returnDate: new Date(),
          status: "returned",
          fine: fine ? parseFloat(fine) : 0,
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to return book" }, { status: 500 });
  }
}

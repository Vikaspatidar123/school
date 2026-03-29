import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const books = await prisma.book.findMany({
      include: {
        _count: {
          select: { issues: true },
        },
      },
      orderBy: { title: "asc" },
    });

    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
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
    const { title, author, isbn, category, quantity, shelf } = body;

    const book = await prisma.book.create({
      data: {
        title,
        author,
        isbn,
        category,
        quantity: quantity ? parseInt(quantity) : 1,
        available: quantity ? parseInt(quantity) : 1,
        shelf,
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add book" }, { status: 500 });
  }
}

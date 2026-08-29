import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// TICKET-017: read-only list endpoint. Excludes archived foods by
// default (TICKET-043's soft-delete) — search (TICKET-018) and Add Food
// (TICKET-019) should never surface one. Write endpoints belong to
// EPIC-10 (Admin), not here.
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE),
  );

  const where = { isArchived: false };

  const [foods, total] = await Promise.all([
    prisma.food.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.food.count({ where }),
  ]);

  return NextResponse.json({
    foods,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// TICKET-017: unlike the list endpoint, this returns an archived food
// too — a historical MealEntry needs to resolve a soft-deleted food's
// name/details to render correctly in History (TICKET-031) and the
// Dashboard (TICKET-025).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const food = await prisma.food.findUnique({ where: { id } });

  if (!food) {
    return NextResponse.json({ error: "Food not found" }, { status: 404 });
  }

  return NextResponse.json({ food });
}

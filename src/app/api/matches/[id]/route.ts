// src/app/api/matches/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // ← Promise<>
) {
  const { id } = await params; // ← await

  const match = await prisma.match.findUnique({
    where: { id },
  });

  if (!match) {
    return NextResponse.json(
      { error: "Partido no encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json(match);
}

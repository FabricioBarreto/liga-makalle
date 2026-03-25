import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Protección básica con secret header para el admin
function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret");
  return secret === process.env.ADMIN_SECRET;
}

// GET todos los partidos (incluyendo visitante)
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const matches = await prisma.match.findMany({
    orderBy: { date: "asc" },
    include: { _count: { select: { tickets: true } } },
  });

  return NextResponse.json(matches);
}

// POST crear nuevo partido
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();

  const match = await prisma.match.create({
    data: {
      opponent: body.opponent,
      date: new Date(body.date),
      venue: body.venue || "Estadio Municipal",
      round: body.round,
      isHome: body.isHome ?? true,
      earlyBirdPrice: Number(body.earlyBirdPrice),
      matchDayPrice: Number(body.matchDayPrice),
      earlyBirdDeadline: new Date(body.earlyBirdDeadline),
      totalCapacity: Number(body.totalCapacity) || 300,
    },
  });

  return NextResponse.json(match, { status: 201 });
}

// PATCH actualizar partido (estado, precios, etc)
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...data } = body;

  const match = await prisma.match.update({
    where: { id },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.earlyBirdPrice && { earlyBirdPrice: Number(data.earlyBirdPrice) }),
      ...(data.matchDayPrice && { matchDayPrice: Number(data.matchDayPrice) }),
      ...(data.earlyBirdDeadline && {
        earlyBirdDeadline: new Date(data.earlyBirdDeadline),
      }),
      ...(data.totalCapacity && { totalCapacity: Number(data.totalCapacity) }),
    },
  });

  return NextResponse.json(match);
}

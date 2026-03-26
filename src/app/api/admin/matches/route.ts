import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret");
  return secret === process.env.ADMIN_SECRET;
}

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

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();

  const match = await prisma.match.create({
    data: {
      opponent: body.opponent,
      date: new Date(body.date + "-03:00"),
      venue: body.venue || "Cancha del Club Social",
      round: body.round,
      isHome: body.isHome ?? true,
      earlyBirdPrice: Number(body.earlyBirdPrice),
      matchDayPrice: Number(body.matchDayPrice),
      earlyBirdDeadline: new Date(body.earlyBirdDeadline + "-03:00"),
      totalCapacity: Number(body.totalCapacity) || 300,
    },
  });

  return NextResponse.json(match, { status: 201 });
}

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
      ...(data.opponent && { opponent: data.opponent }),
      ...(data.venue && { venue: data.venue }),
      ...(data.round && { round: data.round }),
      ...(data.date && { date: new Date(data.date + "-03:00") }),
      ...(data.isHome !== undefined && { isHome: data.isHome }),
      ...(data.earlyBirdPrice && {
        earlyBirdPrice: Number(data.earlyBirdPrice),
      }),
      ...(data.matchDayPrice && { matchDayPrice: Number(data.matchDayPrice) }),
      ...(data.earlyBirdDeadline && {
        earlyBirdDeadline: new Date(data.earlyBirdDeadline + "-03:00"),
      }),
      ...(data.totalCapacity && { totalCapacity: Number(data.totalCapacity) }),
    },
  });

  return NextResponse.json(match);
}

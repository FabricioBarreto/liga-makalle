import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      where: {
        isHome: true,
        status: "UPCOMING",
        date: { gt: new Date() },
      },
      orderBy: { date: "asc" },
      select: {
        id: true,
        opponent: true,
        date: true,
        venue: true,
        round: true,
        status: true,
        earlyBirdPrice: true,
        matchDayPrice: true,
        earlyBirdDeadline: true,
        totalCapacity: true,
        soldTickets: true,
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json({ error: "Error al obtener partidos" }, { status: 500 });
  }
}

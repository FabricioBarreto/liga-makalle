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
    include: {
      tickets: {
        where: { mpStatus: "approved" },
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          totalAmount: true,
          isEarlyBird: true,
          buyerEmail: true,
          createdAt: true,
        },
      },
    },
  });

  const porPartido = matches.map((m) => {
    const earlyBird = m.tickets.filter((t) => t.isEarlyBird);
    const normal = m.tickets.filter((t) => !t.isEarlyBird);
    const ingresos = m.tickets.reduce((s, t) => s + Number(t.totalAmount), 0);
    const entradas = m.tickets.reduce((s, t) => s + t.quantity, 0);

    return {
      id: m.id,
      opponent: m.opponent,
      round: m.round,
      date: m.date,
      status: m.status,
      ingresos,
      entradas,
      earlyBirdCount: earlyBird.reduce((s, t) => s + t.quantity, 0),
      earlyBirdIngresos: earlyBird.reduce(
        (s, t) => s + Number(t.totalAmount),
        0,
      ),
      normalCount: normal.reduce((s, t) => s + t.quantity, 0),
      normalIngresos: normal.reduce((s, t) => s + Number(t.totalAmount), 0),
      tickets: m.tickets,
    };
  });

  const totalIngresos = porPartido.reduce((s, m) => s + m.ingresos, 0);
  const totalEntradas = porPartido.reduce((s, m) => s + m.entradas, 0);

  return NextResponse.json({ porPartido, totalIngresos, totalEntradas });
}

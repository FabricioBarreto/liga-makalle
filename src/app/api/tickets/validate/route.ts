import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tickets/validate?qr=CODIGO
export async function GET(req: NextRequest) {
  const qrCode = req.nextUrl.searchParams.get("qr");

  if (!qrCode) {
    return NextResponse.json({ valid: false, error: "QR requerido" }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { qrCode },
    include: { match: true },
  });

  if (!ticket) {
    return NextResponse.json({ valid: false, error: "Entrada no encontrada" });
  }

  if (ticket.mpStatus !== "approved") {
    return NextResponse.json({ valid: false, error: "Pago no confirmado" });
  }

  return NextResponse.json({
    valid: true,
    buyer: ticket.buyerName,
    dni: ticket.buyerDni,
    match: `${ticket.match.opponent} - ${ticket.match.round}`,
    matchDate: ticket.match.date,
    quantity: ticket.quantity,
    isEarlyBird: ticket.isEarlyBird,
  });
}

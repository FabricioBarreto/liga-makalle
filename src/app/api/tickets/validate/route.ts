import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const qrCode = req.nextUrl.searchParams.get("qr");
    if (!qrCode) {
      return NextResponse.json(
        { valid: false, error: "QR requerido" },
        { status: 400 },
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { qrCode },
      include: { match: true },
    });

    if (!ticket) {
      return NextResponse.json(
        { valid: false, error: "Entrada no encontrada" },
        { status: 404 },
      );
    }

    if (ticket.mpStatus !== "approved") {
      return NextResponse.json(
        { valid: false, error: "Pago no confirmado" },
        { status: 400 },
      );
    }

    // ← Bloquear si ya fue usada
    if (ticket.usedAt) {
      const usedDate = new Date(ticket.usedAt).toLocaleString("es-AR", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Argentina/Buenos_Aires",
      });
      return NextResponse.json(
        {
          valid: false,
          error: `Entrada ya utilizada el ${usedDate}`,
        },
        { status: 400 },
      );
    }

    // Marcar como usada
    await prisma.ticket.update({
      where: { qrCode },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({
      valid: true,
      email: ticket.buyerEmail,
      phone: ticket.buyerPhone,
      match: `${ticket.match.opponent} - ${ticket.match.round}`,
      matchDate: ticket.match.date,
      quantity: ticket.quantity,
      isEarlyBird: ticket.isEarlyBird,
    });
  } catch (error) {
    console.error("Error validando QR:", error);
    return NextResponse.json(
      { valid: false, error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

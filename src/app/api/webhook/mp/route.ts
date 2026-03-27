import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { sendTicketEmail } from "@/lib/email";
import QRCode from "qrcode";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Webhook MP recibido:", JSON.stringify(body, null, 2));

    if (body.type !== "payment") return NextResponse.json({ ok: true });

    const paymentId = body.data?.id;
    if (!paymentId) return NextResponse.json({ ok: true });

    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: paymentId });

    if (!payment.external_reference) return NextResponse.json({ ok: true });

    const ticketId = payment.external_reference;

    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { match: true },
    });

    if (!existingTicket) return NextResponse.json({ ok: true });
    if (existingTicket.mpStatus === "approved")
      return NextResponse.json({ ok: true });

    if (payment.status === "approved") {
      // Generar QR code — el contenido es el ticketId
      const qrCode = ticketId;
      const qrImageBase64 = await QRCode.toDataURL(qrCode, { width: 300 });

      const ticket = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          mpPaymentId: String(payment.id),
          mpStatus: "approved",
          paidAt: new Date(),
          qrCode, // ← se guarda en DB
        },
        include: { match: true },
      });

      await prisma.match.update({
        where: { id: ticket.matchId },
        data: { soldTickets: { increment: ticket.quantity } },
      });

      const updatedMatch = await prisma.match.findUnique({
        where: { id: ticket.matchId },
      });
      if (
        updatedMatch &&
        updatedMatch.soldTickets >= updatedMatch.totalCapacity
      ) {
        await prisma.match.update({
          where: { id: ticket.matchId },
          data: { status: "SOLD_OUT" },
        });
      }

      if (!ticket.pdfSent) {
        // en el webhook, al enviar el email:
        const emailResult = await sendTicketEmail({
          to: ticket.buyerEmail,
          buyerPhone: ticket.buyerPhone,
          matchOpponent: ticket.match.opponent,
          matchDate: ticket.match.date,
          matchVenue: ticket.match.venue,
          matchRound: ticket.match.round,
          ticketId: ticket.id,
          quantity: ticket.quantity,
          unitPrice: Number(ticket.unitPrice),
          totalAmount: Number(ticket.totalAmount),
          isEarlyBird: ticket.isEarlyBird,
          qrCode: ticket.qrCode, // ← viene de DB, ya existe
        });

        if (emailResult.success) {
          await prisma.ticket.update({
            where: { id: ticket.id },
            data: { pdfSent: true },
          });
        } else {
          console.error("Error enviando email:", emailResult.error);
        }
      }
    } else if (payment.status === "rejected") {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          mpPaymentId: String(payment.id),
          mpStatus: "rejected",
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error en webhook MP:", error);
    return NextResponse.json({ ok: true });
  }
}

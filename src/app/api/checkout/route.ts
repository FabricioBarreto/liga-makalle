import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { getTicketPrice, isSaleOpen } from "@/lib/pricing";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const { matchId, quantity, buyerName, buyerEmail, buyerPhone } =
      await req.json();

    if (!matchId || !quantity || !buyerName || !buyerEmail || !buyerPhone) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 },
      );
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { error: "Cantidad inválida (1-10)" },
        { status: 400 },
      );
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });

    if (!match) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 },
      );
    }

    if (!isSaleOpen(match)) {
      return NextResponse.json(
        { error: "La venta de entradas está cerrada" },
        { status: 400 },
      );
    }

    if (match.soldTickets + quantity > match.totalCapacity) {
      return NextResponse.json(
        { error: "No hay suficientes entradas disponibles" },
        { status: 400 },
      );
    }

    const { price, isEarlyBird, label } = getTicketPrice(match);
    const totalAmount = price * quantity;

    const ticket = await prisma.ticket.create({
      data: {
        matchId,
        buyerName,
        buyerEmail,
        buyerPhone,
        quantity,
        unitPrice: price,
        totalAmount,
        isEarlyBird,
        mpStatus: "pending",
      },
    });

    const preference = new Preference(client);
    const mpResponse = await preference.create({
      body: {
        items: [
          {
            id: ticket.id,
            title: `Entrada - ${match.opponent} (${match.round})`,
            description: label,
            quantity,
            unit_price: price,
            currency_id: "ARS",
          },
        ],
        payer: {
          name: buyerName,
          email: buyerEmail,
        },
        external_reference: ticket.id,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmacion?ticket=${ticket.id}`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/error-pago?ticket=${ticket.id}`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmacion?ticket=${ticket.id}&pending=true`,
        },
        auto_return: "approved",
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/mp`,
        statement_descriptor: "ENTRADAS FUTBOL",
      },
    });

    return NextResponse.json({
      init_point: mpResponse.init_point,
      ticketId: ticket.id,
    });
  } catch (error: any) {
    console.error("Error creando checkout:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 },
    );
  }
}

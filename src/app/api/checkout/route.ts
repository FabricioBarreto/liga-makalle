import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTicketPrice, isSaleOpen } from "@/lib/pricing";

function getBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_BASE_URL?.trim();

  if (!raw) {
    throw new Error("NEXT_PUBLIC_BASE_URL no está definida");
  }

  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export async function POST(req: NextRequest) {
  try {
    const { matchId, quantity, buyerEmail, buyerPhone } = await req.json();

    if (!matchId || !quantity || !buyerEmail || !buyerPhone) {
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

    const normalizedEmail = String(buyerEmail).trim().toLowerCase();
    const normalizedPhone = String(buyerPhone).trim();
    const baseUrl = getBaseUrl();

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

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

    const { price, isEarlyBird } = getTicketPrice(match);
    const totalAmount = price * quantity;

    const ticket = await prisma.ticket.create({
      data: {
        matchId,
        buyerEmail: normalizedEmail,
        buyerPhone: normalizedPhone,
        quantity,
        unitPrice: price,
        totalAmount,
        isEarlyBird,
        mpStatus: "pending",
      },
    });

    const payload = {
      items: [
        {
          title: `Entrada - ${match.opponent} (${match.round})`,
          quantity,
          unit_price: Number(price),
          currency_id: "ARS",
        },
      ],
      payer: {
        email: normalizedEmail,
      },
      external_reference: ticket.id,
      back_urls: {
        success: `${baseUrl}/confirmacion?ticket=${ticket.id}`,
        failure: `${baseUrl}/error-pago?ticket=${ticket.id}`,
        pending: `${baseUrl}/confirmacion?ticket=${ticket.id}&pending=true`,
      },
    };

    console.log("MP payload:", JSON.stringify(payload, null, 2));

    const mpRes = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    const rawText = await mpRes.text();

    console.log("MP status:", mpRes.status);
    console.log("MP raw response:", rawText);

    if (!mpRes.ok) {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { mpStatus: "error" },
      });

      return NextResponse.json(
        {
          error: "Error creando preferencia en Mercado Pago",
          mpStatus: mpRes.status,
          mpResponse: rawText,
        },
        { status: 500 },
      );
    }

    let mpResponse: any;

    try {
      mpResponse = JSON.parse(rawText);
    } catch {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { mpStatus: "error" },
      });

      return NextResponse.json(
        {
          error: "Mercado Pago devolvió una respuesta no JSON",
          mpStatus: mpRes.status,
          mpResponse: rawText,
        },
        { status: 500 },
      );
    }

    if (!mpResponse.init_point) {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { mpStatus: "error" },
      });

      return NextResponse.json(
        {
          error: "Mercado Pago no devolvió init_point",
          mpResponse,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      init_point: mpResponse.init_point,
      ticketId: ticket.id,
    });
  } catch (error: any) {
    console.error("Error creando checkout:", {
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause,
    });

    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 },
    );
  }
}

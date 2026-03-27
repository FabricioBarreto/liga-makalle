import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTicketPrice, isSaleOpen } from "@/lib/pricing";

function getBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (!raw) throw new Error("NEXT_PUBLIC_BASE_URL no está definida");
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

// Rate limiting simple en memoria
const ipRequests = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const window = 60_000; // 1 minuto
  const limit = 5; // máximo 5 checkouts por minuto por IP

  const entry = ipRequests.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + window });
    return false;
  }
  if (entry.count >= limit) return true;
  entry.count++;
  return false;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[\d\s\+\-]{7,20}$/.test(phone);
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting por IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intentá en un minuto." },
        { status: 429 },
      );
    }

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

    // Validar formato de email y teléfono
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    if (!isValidPhone(normalizedPhone)) {
      return NextResponse.json({ error: "Teléfono inválido" }, { status: 400 });
    }

    const baseUrl = getBaseUrl();

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

    // Check atómico de capacidad con transacción
    const result = await prisma.$transaction(async (tx) => {
      const freshMatch = await tx.match.findUnique({ where: { id: matchId } });
      if (!freshMatch) throw new Error("Partido no encontrado");
      if (freshMatch.soldTickets + quantity > freshMatch.totalCapacity) {
        throw new Error("Sin disponibilidad");
      }

      const { price, isEarlyBird } = getTicketPrice(freshMatch);
      const totalAmount = price * quantity;

      const ticket = await tx.ticket.create({
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

      return { ticket, price };
    });

    const { ticket, price } = result;

    const payload = {
      items: [
        {
          title: `Entrada - ${match.opponent} (${match.round})`,
          quantity,
          unit_price: Number(price),
          currency_id: "ARS",
        },
      ],
      payer: { email: normalizedEmail },
      external_reference: ticket.id,
      notification_url: `${baseUrl}/api/webhook/mp`,
      back_urls: {
        success: `${baseUrl}/confirmacion?ticket=${ticket.id}`,
        failure: `${baseUrl}/error-pago?ticket=${ticket.id}`,
        pending: `${baseUrl}/confirmacion?ticket=${ticket.id}&pending=true`,
      },
    };

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

    if (!mpRes.ok) {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { mpStatus: "error" },
      });
      console.error("MP error:", mpRes.status, rawText);
      return NextResponse.json(
        { error: "Error procesando el pago. Intentá de nuevo." },
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
        { error: "Error procesando el pago. Intentá de nuevo." },
        { status: 500 },
      );
    }

    if (!mpResponse.init_point) {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { mpStatus: "error" },
      });
      return NextResponse.json(
        { error: "Error procesando el pago. Intentá de nuevo." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      init_point: mpResponse.init_point,
      ticketId: ticket.id,
    });
  } catch (error: any) {
    if (error.message === "Sin disponibilidad") {
      return NextResponse.json(
        { error: "No hay suficientes entradas disponibles" },
        { status: 400 },
      );
    }
    console.error("Error creando checkout:", error?.message);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 },
    );
  }
}

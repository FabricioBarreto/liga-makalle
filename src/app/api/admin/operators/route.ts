import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function isAuthorized(req: NextRequest): boolean {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const operators = await prisma.operator.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      createdAt: true,
    },
  });
  return NextResponse.json(operators);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { name, email, pin } = await req.json();
  if (!name || !email || !pin)
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  if (pin.length < 6)
    return NextResponse.json(
      { error: "El PIN debe tener al menos 6 caracteres" },
      { status: 400 },
    );

  const exists = await prisma.operator.findUnique({ where: { email } });
  if (exists)
    return NextResponse.json(
      { error: "Ya existe un operador con ese email" },
      { status: 409 },
    );

  const hashed = await bcrypt.hash(pin, 10);
  const operator = await prisma.operator.create({
    data: { name, email, pin: hashed },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      createdAt: true,
    },
  });
  return NextResponse.json(operator, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id, pin, active } = await req.json();
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (typeof active === "boolean") data.active = active;
  if (pin) {
    if (pin.length < 6)
      return NextResponse.json(
        { error: "El PIN debe tener al menos 6 caracteres" },
        { status: 400 },
      );
    data.pin = await bcrypt.hash(pin, 10);
  }

  const operator = await prisma.operator.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      createdAt: true,
    },
  });
  return NextResponse.json(operator);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, pin } = await req.json();
  if (!email || !pin)
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });

  const operator = await prisma.operator.findUnique({ where: { email } });
  if (!operator || !operator.active)
    return NextResponse.json(
      { error: "Operador no encontrado o inactivo" },
      { status: 401 },
    );

  const valid = await bcrypt.compare(pin, operator.pin);
  if (!valid)
    return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });

  return NextResponse.json({ ok: true, name: operator.name });
}

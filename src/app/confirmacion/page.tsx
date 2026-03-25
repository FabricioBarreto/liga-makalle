import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  formatDate,
  formatTime,
  formatPrice,
  generateOrderNumber,
} from "@/lib/pricing";

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string; pending?: string }>; // ← Promise<>
}) {
  const { ticket: ticketId, pending } = await searchParams; // ← await y desestructurá directo
  const isPending = pending === "true";

  let ticket = null;
  if (ticketId) {
    ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { match: true },
    });
  }

  if (!ticket) {
    return (
      <main className="min-h-screen bg-club-dark bg-stripes flex flex-col items-center justify-center px-4">
        <p className="text-slate-500 font-outfit mb-4">
          No encontramos tu compra
        </p>
        <Link
          href="/"
          className="text-club-celeste underline font-outfit text-sm"
        >
          Volver al inicio
        </Link>
      </main>
    );
  }

  const isApproved = ticket.mpStatus === "approved";
  const orderNumber = generateOrderNumber(ticket.id);

  return (
    <main className="min-h-screen bg-club-dark bg-stripes">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-club-dark-3 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-club-celeste to-transparent" />
        <div className="relative max-w-lg mx-auto px-4 pt-10 pb-8 text-center">
          {/* Icono estado */}
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-2 mb-4 ${
              isApproved
                ? "border-club-celeste/50 bg-club-celeste/10 glow-celeste"
                : isPending
                  ? "border-amber-400/50 bg-amber-400/10"
                  : "border-slate-600 bg-slate-800/40"
            }`}
          >
            <span className="text-3xl">
              {isApproved ? "✓" : isPending ? "⏳" : "?"}
            </span>
          </div>

          <h1
            className={`font-bebas text-4xl tracking-wide leading-none mb-1 ${
              isApproved ? "text-club-celeste" : "text-club-white"
            }`}
          >
            {isApproved
              ? "Pago confirmado"
              : isPending
                ? "Pago en proceso"
                : "Verificando..."}
          </h1>
          <p className="text-slate-400 font-outfit text-sm">
            {isApproved
              ? `Enviamos tus entradas a ${ticket.buyerEmail}`
              : isPending
                ? "En cuanto se confirme recibirás las entradas por email"
                : "Puede demorar unos minutos"}
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pb-16 space-y-4 animate-fadeup">
        {/* Detalle */}
        <div className="card-club p-5">
          <p className="text-club-celeste/50 text-xs uppercase tracking-widest font-outfit mb-4">
            Detalle de la compra
          </p>
          <div className="space-y-3">
            {[
              { label: "Orden", value: orderNumber, highlight: true },
              { label: "Partido", value: ticket.match.opponent },
              { label: "Instancia", value: ticket.match.round },
              { label: "Fecha", value: formatDate(ticket.match.date) },
              { label: "Hora", value: formatTime(ticket.match.date) + " hs" },
              { label: "Estadio", value: ticket.match.venue },
              {
                label: "Entradas",
                value: `${ticket.quantity} entrada${ticket.quantity > 1 ? "s" : ""}`,
              },
            ].map(({ label, value, highlight }) => (
              <div
                key={label}
                className="flex justify-between text-sm border-b border-club-celeste/5 pb-3 last:border-0 last:pb-0"
              >
                <span className="text-slate-500 font-outfit">{label}</span>
                <span
                  className={`font-outfit font-semibold ${highlight ? "text-club-celeste font-mono" : "text-club-white"}`}
                >
                  {value}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t border-club-celeste/15">
              <span className="text-slate-400 font-outfit text-sm">
                Total pagado
              </span>
              <span className="font-bebas text-3xl text-club-celeste tracking-wide">
                {formatPrice(ticket.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Aviso email */}
        {isApproved && (
          <div
            className="card-club p-5 border-club-celeste/25"
            style={{ borderColor: "rgba(56,189,248,0.2)" }}
          >
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-club-celeste/15 border border-club-celeste/30 flex items-center justify-center flex-shrink-0">
                <span className="text-club-celeste text-sm">✉</span>
              </div>
              <div>
                <p className="font-outfit font-semibold text-club-white text-sm mb-1">
                  Revisá tu email
                </p>
                <p className="font-outfit text-slate-400 text-xs leading-relaxed">
                  Enviamos las entradas con tu código QR a{" "}
                  <strong className="text-slate-300">
                    {ticket.buyerEmail}
                  </strong>
                  . Revisá también la carpeta de spam.
                </p>
              </div>
            </div>
          </div>
        )}

        <Link
          href="/"
          className="block w-full text-center py-3.5 rounded-xl border border-club-celeste/20 text-club-celeste/70 font-outfit font-semibold text-sm hover:border-club-celeste/40 hover:text-club-celeste transition-colors"
        >
          Ver más partidos
        </Link>

        <div className="text-center">
          <div className="flex justify-center gap-1 mb-2">
            <div className="w-6 h-px bg-club-celeste/20" />
            <div className="w-2 h-px bg-white/10" />
            <div className="w-6 h-px bg-club-celeste/20" />
          </div>
          <p className="text-slate-700 text-xs font-outfit">CSCDM · Makallé</p>
        </div>
      </div>
    </main>
  );
}

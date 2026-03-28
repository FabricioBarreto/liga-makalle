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
  searchParams: Promise<{ ticket?: string; pending?: string }>;
}) {
  const { ticket: ticketId, pending } = await searchParams;
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
      <main
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 1rem",
        }}
      >
        <p style={{ color: "var(--t3)", marginBottom: "1rem" }}>
          No encontramos tu compra
        </p>
        <Link
          href="/"
          style={{
            color: "var(--c)",
            textDecoration: "underline",
            fontSize: "0.875rem",
          }}
        >
          Volver al inicio
        </Link>
      </main>
    );
  }

  const isApproved = ticket.mpStatus === "approved";
  const orderNumber = generateOrderNumber(ticket.id);
  const statusColor = isApproved
    ? "var(--c)"
    : isPending
      ? "var(--y)"
      : "var(--t3)";

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Línea top */}
      <div
        style={{
          height: "2px",
          background: `linear-gradient(to right, transparent, ${statusColor}, transparent)`,
        }}
      />

      {/* Header */}
      <header
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "2.5rem 1rem 1.5rem",
          textAlign: "center",
        }}
      >
        {/* Ícono */}
        <div
          className="au"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            border: `2px solid ${statusColor}40`,
            background: `${statusColor}12`,
            marginBottom: "1.25rem",
            position: "relative",
          }}
        >
          {isApproved ? (
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke={statusColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : isPending ? (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke={statusColor}
              strokeWidth="2"
              style={{ animation: "spin 1.2s linear infinite" }}
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0110 10" />
            </svg>
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke={statusColor}
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
          )}
        </div>

        <h1
          className="au1"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 8vw, 3rem)",
            letterSpacing: "0.05em",
            color: isApproved ? "var(--c)" : "var(--t1)",
            lineHeight: 1,
            marginBottom: "0.5rem",
          }}
        >
          {isApproved
            ? "¡Pago confirmado!"
            : isPending
              ? "Pago en proceso"
              : "Verificando..."}
        </h1>

        <p className="au2" style={{ color: "var(--t2)", fontSize: "0.875rem" }}>
          {isApproved
            ? `Entradas enviadas a ${ticket.buyerEmail}`
            : isPending
              ? "Recibirás las entradas por email al confirmarse"
              : "Puede demorar unos minutos"}
        </p>
      </header>

      {/* Contenido */}
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "0 1rem 4rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {/* Card ticket */}
        <div
          className="au2"
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {/* Barra de estado */}
          <div
            style={{
              height: "3px",
              background: `linear-gradient(to right, ${statusColor}, ${statusColor}40)`,
            }}
          />

          <div style={{ padding: "1.25rem" }}>
            {/* Cabecera del card */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <span
                style={{
                  color: "var(--t3)",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Detalle de la compra
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: "999px",
                  background: `${statusColor}15`,
                  color: statusColor,
                  border: `1px solid ${statusColor}30`,
                }}
              >
                {isApproved ? "Aprobado" : isPending ? "Pendiente" : "—"}
              </span>
            </div>

            {/* Filas */}
            {[
              { label: "Orden", value: orderNumber, mono: true, accent: true },
              { label: "Partido", value: ticket.match.opponent },
              { label: "Instancia", value: ticket.match.round },
              { label: "Fecha", value: formatDate(ticket.match.date) },
              { label: "Hora", value: formatTime(ticket.match.date) + " hs" },
              { label: "Estadio", value: ticket.match.venue },
              {
                label: "Entradas",
                value: `${ticket.quantity} entrada${ticket.quantity > 1 ? "s" : ""}`,
              },
            ].map(({ label, value, mono, accent }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.6rem 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ color: "var(--t3)" }}>{label}</span>
                <span
                  style={{
                    color: accent ? statusColor : "var(--t1)",
                    fontFamily: mono ? "monospace" : "inherit",
                    fontWeight: 600,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}

            {/* Separador tipo ticket */}
            <div
              style={{
                position: "relative",
                margin: "1rem -1.25rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "var(--bg)",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  flex: 1,
                  borderTop: "1px dashed rgba(255,255,255,0.08)",
                }}
              />
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "var(--bg)",
                  flexShrink: 0,
                }}
              />
            </div>

            {/* Total */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "var(--t2)", fontSize: "0.875rem" }}>
                Total pagado
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2.25rem",
                  letterSpacing: "0.04em",
                  color: statusColor,
                  lineHeight: 1,
                }}
              >
                {formatPrice(ticket.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Aviso email */}
        {isApproved && (
          <div
            className="au3"
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "1rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                flexShrink: 0,
                background: "var(--c)15",
                border: "1px solid var(--c)30",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--c)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <p
                style={{
                  color: "var(--t1)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.25rem",
                }}
              >
                Revisá tu email
              </p>
              <p
                style={{
                  color: "var(--t2)",
                  fontSize: "0.8rem",
                  lineHeight: 1.5,
                }}
              >
                Enviamos las entradas con código QR a{" "}
                <strong style={{ color: "var(--t1)" }}>
                  {ticket.buyerEmail}
                </strong>
                . Revisá también spam.
              </p>
            </div>
          </div>
        )}

        {/* Botón */}
        <Link
          className="au4"
          href="/"
          style={{
            display: "block",
            textAlign: "center",
            padding: "0.875rem",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            color: "var(--c)",
            fontSize: "0.875rem",
            fontWeight: 600,
            textDecoration: "none",
            transition: "background 0.2s, border-color 0.2s",
          }}
        >
          Ver más partidos →
        </Link>

        <p
          className="au5"
          style={{
            textAlign: "center",
            color: "var(--t3)",
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            paddingTop: "0.5rem",
          }}
        >
          CSCDM · Makallé
        </p>
      </div>
    </main>
  );
}

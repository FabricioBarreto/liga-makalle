"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  formatDate,
  formatTime,
  formatPrice,
  getTicketPrice,
  isSaleOpen,
} from "@/lib/pricing";

const F = {
  display: "'Barlow Condensed','Impact',sans-serif",
  body: "'DM Sans','Segoe UI',sans-serif",
};

const inp: React.CSSProperties = {
  width: "100%",
  background: "rgba(13,19,32,0.8)",
  border: "1px solid rgba(0,212,255,0.15)",
  borderRadius: 8,
  padding: "12px 14px",
  color: "#fff",
  fontSize: 14,
  fontFamily: "'DM Sans','Segoe UI',sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

export default function MatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    buyerName: "",
    buyerEmail: "",
    buyerEmailConfirm: "",
    buyerDni: "",
    quantity: 1,
  });

  useEffect(() => {
    fetch(`/api/matches/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setMatch(d);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar");
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async () => {
    setError("");
    if (!form.buyerName.trim()) return setError("Ingresá tu nombre completo");
    if (!form.buyerEmail.trim()) return setError("Ingresá tu email");
    if (form.buyerEmail !== form.buyerEmailConfirm)
      return setError("Los emails no coinciden");
    if (!form.buyerDni.trim()) return setError("Ingresá tu DNI");
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: id,
          quantity: form.quantity,
          buyerName: form.buyerName,
          buyerEmail: form.buyerEmail,
          buyerDni: form.buyerDni,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error");
        setSubmitting(false);
        return;
      }
      window.location.href = data.init_point;
    } catch {
      setError("Error de conexión");
      setSubmitting(false);
    }
  };

  const page: React.CSSProperties = {
    minHeight: "100vh",
    background: "#080C14",
    fontFamily: F.body,
    position: "relative",
    overflow: "hidden",
  };
  const card: React.CSSProperties = {
    background: "#0D1320",
    border: "1px solid rgba(0,212,255,0.08)",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  };
  const cardBody: React.CSSProperties = { padding: "18px 20px" };
  const lbl: React.CSSProperties = {
    display: "block",
    fontFamily: F.display,
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    color: "rgba(0,212,255,0.45)",
    marginBottom: 8,
  };

  if (loading)
    return (
      <div
        style={{
          ...page,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: "2px solid #00D4FF",
              borderTopColor: "transparent",
              borderRadius: "50%",
              margin: "0 auto 12px",
              animation: "spin .7s linear infinite",
            }}
          />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: "#4A607A", fontSize: 13 }}>Cargando...</p>
        </div>
      </div>
    );

  if (!match)
    return (
      <div
        style={{
          ...page,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <p style={{ color: "#fff" }}>{error || "Partido no encontrado"}</p>
        <button
          onClick={() => router.push("/")}
          style={{
            color: "#00D4FF",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            textDecoration: "underline",
          }}
        >
          ← Volver
        </button>
      </div>
    );

  const { price, isEarlyBird, savings } = getTicketPrice(match);
  const saleOpen = isSaleOpen(match);
  const total = price * form.quantity;

  return (
    <main style={page}>
      {/* Ambient */}
      <div
        style={{
          position: "absolute",
          top: -300,
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 400,
          background:
            "radial-gradient(ellipse,rgba(0,212,255,0.05) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <header
        style={{
          position: "relative",
          borderBottom: "1px solid rgba(0,212,255,0.08)",
          background: "rgba(8,12,20,0.95)",
        }}
      >
        <div
          style={{
            height: 2,
            background:
              "linear-gradient(90deg,transparent,#00D4FF,#00FF88,transparent)",
          }}
        />
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <button
            onClick={() => router.push("/")}
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              border: "1px solid rgba(0,212,255,0.2)",
              background: "rgba(0,212,255,0.05)",
              color: "#00D4FF",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ←
          </button>
          <div>
            <div
              style={{
                fontFamily: F.display,
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "rgba(0,212,255,0.45)",
              }}
            >
              {match.round}
            </div>
            <div
              style={{
                fontFamily: F.display,
                fontWeight: 900,
                fontSize: "clamp(22px,4vw,30px)",
                lineHeight: 1,
                textTransform: "uppercase",
                letterSpacing: "-0.5px",
              }}
            >
              {match.opponent}
            </div>
          </div>
        </div>
      </header>

      <div
        style={{ maxWidth: 680, margin: "0 auto", padding: "20px 20px 60px" }}
      >
        {/* Info del partido */}
        <div style={card}>
          <div style={{ height: 2, background: "#00D4FF" }} />
          <div style={cardBody}>
            <span style={lbl}>Detalle del partido</span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {[
                { l: "Fecha", v: formatDate(match.date) },
                { l: "Hora", v: formatTime(match.date) + " hs" },
              ].map(({ l, v }) => (
                <div
                  key={l}
                  style={{
                    background: "rgba(8,12,20,0.6)",
                    border: "1px solid rgba(0,212,255,0.06)",
                    borderRadius: 8,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: F.display,
                      fontWeight: 700,
                      fontSize: 9,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "rgba(0,212,255,0.35)",
                      marginBottom: 4,
                    }}
                  >
                    {l}
                  </div>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0" }}
                  >
                    {v}
                  </div>
                </div>
              ))}
              <div
                style={{
                  background: "rgba(8,12,20,0.6)",
                  border: "1px solid rgba(0,212,255,0.06)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  gridColumn: "span 2",
                }}
              >
                <div
                  style={{
                    fontFamily: F.display,
                    fontWeight: 700,
                    fontSize: 9,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "rgba(0,212,255,0.35)",
                    marginBottom: 4,
                  }}
                >
                  Estadio
                </div>
                <div
                  style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0" }}
                >
                  {match.venue}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Precio */}
        <div
          style={{
            ...card,
            borderColor: isEarlyBird
              ? "rgba(0,255,136,0.15)"
              : "rgba(0,212,255,0.08)",
          }}
        >
          <div
            style={{
              height: 2,
              background: isEarlyBird
                ? "linear-gradient(90deg,#00D4FF,#00FF88)"
                : "#00D4FF",
            }}
          />
          <div style={cardBody}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span style={lbl}>
                  {isEarlyBird ? "Precio Anticipado" : "Precio Día del Partido"}
                </span>
                <div
                  style={{
                    fontFamily: F.display,
                    fontWeight: 900,
                    fontSize: "clamp(48px,9vw,64px)",
                    lineHeight: 1,
                    color: "#00D4FF",
                    letterSpacing: "-1px",
                  }}
                >
                  {formatPrice(price)}
                </div>
                {isEarlyBird && savings > 0 && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#00FF88",
                      fontWeight: 600,
                      marginTop: 4,
                    }}
                  >
                    Ahorrás {formatPrice(savings)} vs precio del día
                  </div>
                )}
              </div>
              {isEarlyBird && (
                <span
                  style={{
                    background: "rgba(0,255,136,0.08)",
                    color: "#00FF88",
                    border: "1px solid rgba(0,255,136,0.25)",
                    borderRadius: 4,
                    padding: "4px 10px",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Anticipado
                </span>
              )}
            </div>
          </div>
        </div>

        {saleOpen ? (
          <>
            {/* Cantidad */}
            <div style={card}>
              <div style={cardBody}>
                <span style={lbl}>Cantidad de entradas</span>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {([-1, null, 1] as (number | null)[]).map((d, i) =>
                    d === null ? (
                      <span
                        key="q"
                        style={{
                          fontFamily: F.display,
                          fontWeight: 900,
                          fontSize: 56,
                          color: "#fff",
                          lineHeight: 1,
                          minWidth: 36,
                          textAlign: "center",
                        }}
                      >
                        {form.quantity}
                      </span>
                    ) : (
                      <button
                        key={i}
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            quantity: Math.min(10, Math.max(1, f.quantity + d)),
                          }))
                        }
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          border: "1px solid rgba(0,212,255,0.2)",
                          background: "rgba(0,212,255,0.05)",
                          color: "#00D4FF",
                          fontSize: 24,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: F.body,
                        }}
                      >
                        {d < 0 ? "−" : "+"}
                      </button>
                    ),
                  )}
                  <div style={{ color: "#9BAFC7", fontSize: 14 }}>
                    <div>
                      {form.quantity} × {formatPrice(price)}
                    </div>
                    <div
                      style={{
                        fontFamily: F.display,
                        fontWeight: 800,
                        fontSize: 22,
                        color: "#00D4FF",
                        marginTop: 2,
                      }}
                    >
                      = {formatPrice(total)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div style={card}>
              <div style={cardBody}>
                <span style={lbl}>Datos del comprador</span>
                {[
                  {
                    key: "buyerName",
                    label: "Nombre completo *",
                    placeholder: "Juan Pérez",
                    type: "text",
                  },
                  {
                    key: "buyerEmail",
                    label: "Email — recibirás las entradas acá *",
                    placeholder: "tuemail@gmail.com",
                    type: "email",
                  },
                  {
                    key: "buyerEmailConfirm",
                    label: "Confirmá tu email *",
                    placeholder: "tuemail@gmail.com",
                    type: "email",
                  },
                  {
                    key: "buyerDni",
                    label: "DNI *",
                    placeholder: "32456789",
                    type: "text",
                  },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <label
                      style={{
                        color: "#9BAFC7",
                        fontSize: 12,
                        fontWeight: 500,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      value={(form as any)[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      placeholder={placeholder}
                      style={inp}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Pago */}
            <div
              style={{
                ...card,
                borderColor: "rgba(0,212,255,0.18)",
                background: "linear-gradient(135deg,#0D1320,#0A1828)",
              }}
            >
              <div
                style={{
                  height: 2,
                  background: "linear-gradient(90deg,#00D4FF,#00FF88)",
                }}
              />
              <div style={cardBody}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <span style={lbl}>Total a pagar</span>
                    <div style={{ color: "#9BAFC7", fontSize: 13 }}>
                      {form.quantity} entrada{form.quantity > 1 ? "s" : ""} ×{" "}
                      {formatPrice(price)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: F.display,
                      fontWeight: 900,
                      fontSize: "clamp(40px,8vw,52px)",
                      color: "#00D4FF",
                      lineHeight: 1,
                    }}
                  >
                    {formatPrice(total)}
                  </div>
                </div>

                {error && (
                  <div
                    style={{
                      background: "rgba(255,59,59,0.06)",
                      border: "1px solid rgba(255,59,59,0.2)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      color: "#FF6B6B",
                      fontSize: 13,
                      marginBottom: 16,
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: 8,
                    border: "none",
                    cursor: submitting ? "not-allowed" : "pointer",
                    background: submitting
                      ? "rgba(255,255,255,0.04)"
                      : "linear-gradient(135deg, #0099CC, #00D4FF)",
                    color: submitting ? "#4A607A" : "#080C14",
                    fontFamily: F.display,
                    fontWeight: 800,
                    fontSize: 20,
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    boxShadow: submitting
                      ? "none"
                      : "0 4px 24px rgba(0,212,255,0.2)",
                    transition: "opacity .2s",
                  }}
                >
                  {submitting ? "Procesando..." : `Pagar ${formatPrice(total)}`}
                </button>

                <p
                  style={{
                    textAlign: "center",
                    marginTop: 12,
                    color: "#4A607A",
                    fontSize: 12,
                  }}
                >
                  🔒 Pago seguro con Mercado Pago · Entradas por email al
                  instante
                </p>
              </div>
            </div>
          </>
        ) : (
          <div style={{ ...card, padding: "48px 20px", textAlign: "center" }}>
            <p style={{ color: "#9BAFC7" }}>
              {match.status === "SOLD_OUT"
                ? "Las entradas están agotadas"
                : "La venta está cerrada"}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

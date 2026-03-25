import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  formatDate,
  formatTime,
  formatPrice,
  getTicketPrice,
  isSaleOpen,
} from "@/lib/pricing";

export const revalidate = 60;

async function getMatches() {
  return prisma.match.findMany({
    where: {
      isHome: true,
      status: { in: ["UPCOMING", "SOLD_OUT"] },
      date: { gt: new Date() },
    },
    orderBy: { date: "asc" },
  });
}

const noise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

export default async function HomePage() {
  const matches = await getMatches();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080C14",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow top */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 500,
          background:
            "radial-gradient(ellipse at center, rgba(0,212,255,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── HEADER ── */}
      <header
        style={{
          position: "relative",
          borderBottom: "1px solid rgba(0,212,255,0.08)",
          background: "rgba(8,12,20,0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            height: 3,
            background:
              "linear-gradient(90deg, transparent 0%, #00D4FF 40%, #00FF88 60%, transparent 100%)",
          }}
        />

        <div
          style={{ maxWidth: 700, margin: "0 auto", padding: "28px 20px 32px" }}
        >
          {/* Club tag */}
          <div
            className="au"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(0,212,255,0.06)",
              border: "1px solid rgba(0,212,255,0.18)",
              borderRadius: 4,
              padding: "5px 14px",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                display: "block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#00D4FF",
                boxShadow: "0 0 6px #00D4FF",
              }}
            />
            <span
              style={{
                fontFamily: "'Barlow Condensed',sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "3px",
                color: "#00D4FF",
                textTransform: "uppercase",
              }}
            >
              CSCDM · Makallé · Oficial
            </span>
          </div>

          {/* Título principal */}
          <h1
            className="au1"
            style={{
              fontFamily: "'Barlow Condensed','Impact',sans-serif",
              fontWeight: 900,
              fontSize: "clamp(56px,12vw,88px)",
              lineHeight: 0.9,
              letterSpacing: "-1px",
              textTransform: "uppercase",
              color: "#fff",
              marginBottom: 12,
            }}
          >
            Entradas
            <br />
            <span
              style={{
                WebkitTextStroke: "1px rgba(0,212,255,0.5)",
                color: "transparent",
              }}
            >
              Oficiales
            </span>
          </h1>

          <p
            className="au2"
            style={{
              color: "#9BAFC7",
              fontSize: 14,
              fontWeight: 400,
              letterSpacing: "0.5px",
            }}
          >
            Club Social y Cultural Deportivo Makallé — Liga Regional Chaqueña
          </p>
        </div>
      </header>

      {/* ── CONTENIDO ── */}
      <div
        style={{ maxWidth: 700, margin: "0 auto", padding: "32px 20px 80px" }}
      >
        {matches.length === 0 ? (
          <div
            className="au"
            style={{
              textAlign: "center",
              padding: "100px 20px",
              color: "#4A607A",
            }}
          >
            <div
              style={{
                fontFamily: "'Barlow Condensed',sans-serif",
                fontSize: 80,
                fontWeight: 900,
                color: "rgba(0,212,255,0.06)",
                marginBottom: 16,
              }}
            >
              ⚽
            </div>
            <p style={{ fontSize: 16 }}>
              No hay partidos en casa disponibles por el momento
            </p>
          </div>
        ) : (
          <>
            <p
              className="au3"
              style={{
                fontFamily: "'Barlow Condensed',sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#4A607A",
                marginBottom: 20,
              }}
            >
              — Próximos partidos locales
            </p>

            {matches.map((match, i) => {
              const { price, isEarlyBird, savings } = getTicketPrice(match);
              const saleOpen = isSaleOpen(match);
              const available = match.totalCapacity - match.soldTickets;
              const pct = Math.round(
                (match.soldTickets / match.totalCapacity) * 100,
              );
              const urgent = available <= 50;

              return (
                <div
                  key={match.id}
                  className={`au${Math.min(i + 3, 5)}`}
                  style={{
                    marginBottom: 16,
                    background: "#0D1320",
                    border: "1px solid rgba(0,212,255,0.08)",
                    borderRadius: 12,
                    overflow: "hidden",
                    transition: "border-color .2s",
                  }}
                >
                  {/* Línea superior de color */}
                  <div
                    style={{
                      height: 2,
                      background:
                        match.status === "SOLD_OUT"
                          ? "#FF3B3B"
                          : isEarlyBird
                            ? "linear-gradient(90deg,#00D4FF,#00FF88)"
                            : "#00D4FF",
                    }}
                  />

                  {/* Cabecera tarjeta */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 20px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Barlow Condensed',sans-serif",
                        fontWeight: 700,
                        fontSize: 12,
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: "#4A607A",
                      }}
                    >
                      {match.round}
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {match.status === "SOLD_OUT" && (
                        <span
                          style={{
                            background: "rgba(255,59,59,0.1)",
                            color: "#FF3B3B",
                            border: "1px solid rgba(255,59,59,0.25)",
                            borderRadius: 3,
                            padding: "2px 8px",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "1.5px",
                            textTransform: "uppercase",
                          }}
                        >
                          Agotado
                        </span>
                      )}
                      {isEarlyBird && saleOpen && (
                        <span
                          style={{
                            background: "rgba(0,255,136,0.08)",
                            color: "#00FF88",
                            border: "1px solid rgba(0,255,136,0.25)",
                            borderRadius: 3,
                            padding: "2px 8px",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "1.5px",
                            textTransform: "uppercase",
                          }}
                        >
                          Anticipado
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: "20px 20px 22px" }}>
                    {/* Rival */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 16,
                        marginBottom: 16,
                      }}
                    >
                      <h2
                        style={{
                          fontFamily: "'Barlow Condensed',sans-serif",
                          fontWeight: 900,
                          fontSize: "clamp(32px,6vw,44px)",
                          lineHeight: 0.95,
                          textTransform: "uppercase",
                          letterSpacing: "-0.5px",
                          color: "#fff",
                        }}
                      >
                        {match.opponent}
                      </h2>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div
                          style={{
                            fontFamily: "'Barlow Condensed',sans-serif",
                            fontWeight: 900,
                            fontSize: "clamp(30px,5vw,40px)",
                            lineHeight: 1,
                            color: "#00D4FF",
                            letterSpacing: "-0.5px",
                          }}
                        >
                          {formatPrice(price)}
                        </div>
                        {isEarlyBird && savings > 0 && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "#00FF88",
                              fontWeight: 600,
                              marginTop: 2,
                            }}
                          >
                            −{formatPrice(savings)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Datos */}
                    <div
                      style={{
                        display: "flex",
                        gap: 20,
                        marginBottom: 18,
                        flexWrap: "wrap",
                      }}
                    >
                      {[
                        { icon: "📅", v: formatDate(match.date) },
                        { icon: "🕐", v: formatTime(match.date) + " hs" },
                        { icon: "📍", v: match.venue },
                      ].map(({ icon, v }) => (
                        <div
                          key={v}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            color: "#9BAFC7",
                            fontSize: 13,
                          }}
                        >
                          <span style={{ fontSize: 12, opacity: 0.6 }}>
                            {icon}
                          </span>
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>

                    {/* Barra de disponibilidad */}
                    {saleOpen && (
                      <div style={{ marginBottom: 18 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 11,
                            color: "#4A607A",
                            marginBottom: 6,
                            fontWeight: 500,
                          }}
                        >
                          <span>{match.soldTickets} vendidas</span>
                          <span
                            style={
                              urgent
                                ? { color: "#FFD600", fontWeight: 700 }
                                : {}
                            }
                          >
                            {urgent
                              ? `⚡ Solo ${available} disponibles`
                              : `${available} disponibles`}
                          </span>
                        </div>
                        <div
                          style={{
                            height: 3,
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: 99,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 99,
                              width: `${pct}%`,
                              background:
                                pct > 80
                                  ? "linear-gradient(90deg,#FF3B3B,#FF7B3B)"
                                  : pct > 50
                                    ? "linear-gradient(90deg,#00D4FF,#FFD600)"
                                    : "linear-gradient(90deg,#00D4FF,#00FF88)",
                              transition: "width .6s ease",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    {saleOpen ? (
                      <Link
                        href={`/partido/${match.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 20px",
                          background:
                            "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,212,255,0.06))",
                          border: "1px solid rgba(0,212,255,0.25)",
                          borderRadius: 8,
                          textDecoration: "none",
                          fontFamily: "'Barlow Condensed',sans-serif",
                          fontWeight: 800,
                          fontSize: 18,
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                          color: "#00D4FF",
                          transition: "background .2s",
                        }}
                      >
                        <span>Comprar Entrada</span>
                        <span style={{ fontSize: 20 }}>→</span>
                      </Link>
                    ) : (
                      <div
                        style={{
                          padding: "14px 20px",
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.05)",
                          borderRadius: 8,
                          fontFamily: "'Barlow Condensed',sans-serif",
                          fontWeight: 700,
                          fontSize: 16,
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                          color: "#4A607A",
                          textAlign: "center",
                        }}
                      >
                        {match.status === "SOLD_OUT"
                          ? "Agotado"
                          : "Venta cerrada"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: 48,
            color: "#4A607A",
            fontSize: 12,
            letterSpacing: "1px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                height: 1,
                width: 40,
                background: "rgba(0,212,255,0.1)",
              }}
            />
            <span
              style={{
                fontFamily: "'Barlow Condensed',sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              CSCDM · Makallé
            </span>
            <div
              style={{
                height: 1,
                width: 40,
                background: "rgba(0,212,255,0.1)",
              }}
            />
          </div>
          Pago seguro con Mercado Pago · Entradas digitales al instante
        </div>
      </div>
    </main>
  );
}

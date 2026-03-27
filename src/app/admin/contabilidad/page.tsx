"use client";

import { useState, useEffect, useCallback } from "react";

const C = {
  bg: "#080C14",
  bg2: "#0D1320",
  accent: "#00D4FF",
  green: "#00FF88",
  red: "#FF3B3B",
  yellow: "#FFD600",
  t2: "#9BAFC7",
  t3: "#4A607A",
};
const F = {
  d: "'Barlow Condensed','Impact',sans-serif",
  b: "'DM Sans','Segoe UI',sans-serif",
};

type MatchData = {
  id: string;
  opponent: string;
  round: string;
  date: string;
  status: string;
  ingresos: number;
  entradas: number;
  earlyBirdCount: number;
  earlyBirdIngresos: number;
  normalCount: number;
  normalIngresos: number;
};

type Data = {
  porPartido: MatchData[];
  totalIngresos: number;
  totalEntradas: number;
};

const fmt = (n: number) =>
  n.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

const card: React.CSSProperties = {
  background: C.bg2,
  border: "1px solid rgba(0,212,255,0.08)",
  borderRadius: 12,
  overflow: "hidden",
  marginBottom: 12,
};

export default function ContabilidadPage() {
  const [secret, setSecret] = useState("");
  const [auth, setAuth] = useState(false);
  const [authErr, setAuthErr] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (s: string) => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/contabilidad", {
        headers: { "x-admin-secret": s },
      });
      if (!r.ok) throw new Error();
      setData(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async () => {
    setAuthErr("");
    const r = await fetch("/api/admin/contabilidad", {
      headers: { "x-admin-secret": secret },
    });
    if (r.ok) {
      setData(await r.json());
      setAuth(true);
    } else setAuthErr("Clave incorrecta");
  };

  const exportExcel = () => {
    if (!data) return;

    // Armar CSV con separador compatible con Excel
    const rows: string[][] = [
      [
        "Partido",
        "Fase",
        "Fecha",
        "Estado",
        "Entradas Totales",
        "Early Bird (cant)",
        "Early Bird ($)",
        "Normal (cant)",
        "Normal ($)",
        "Ingresos Totales",
      ],
    ];

    data.porPartido.forEach((m) => {
      rows.push([
        m.opponent,
        m.round,
        new Date(m.date).toLocaleDateString("es-AR"),
        m.status,
        String(m.entradas),
        String(m.earlyBirdCount),
        String(m.earlyBirdIngresos),
        String(m.normalCount),
        String(m.normalIngresos),
        String(m.ingresos),
      ]);
    });

    rows.push([]);
    rows.push([
      "TOTAL",
      "",
      "",
      "",
      String(data.totalEntradas),
      "",
      "",
      "",
      "",
      String(data.totalIngresos),
    ]);

    const csv = "\uFEFF" + rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contabilidad-liga-makalle-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── LOGIN ──
  if (!auth)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          fontFamily: F.b,
        }}
      >
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                fontFamily: F.d,
                fontWeight: 900,
                fontSize: 52,
                lineHeight: 0.9,
                textTransform: "uppercase",
                letterSpacing: "-1px",
                marginBottom: 8,
              }}
            >
              Panel
              <br />
              <span
                style={{
                  WebkitTextStroke: "1px rgba(0,212,255,0.4)",
                  color: "transparent",
                }}
              >
                Contable
              </span>
            </div>
            <div
              style={{
                color: C.t3,
                fontSize: 12,
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginTop: 8,
              }}
            >
              CSCDM · Liga Makallé
            </div>
          </div>
          <div
            style={{
              background: C.bg2,
              border: "1px solid rgba(0,212,255,0.08)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <label
              style={{
                display: "block",
                fontFamily: F.d,
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "rgba(0,212,255,0.45)",
                marginBottom: 8,
              }}
            >
              Clave de acceso
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="••••••••••••"
              style={{
                width: "100%",
                background: "rgba(8,12,20,0.8)",
                border: "1px solid rgba(0,212,255,0.15)",
                borderRadius: 8,
                padding: "11px 14px",
                color: "#fff",
                fontSize: 14,
                fontFamily: F.b,
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 8,
              }}
            />
            {authErr && (
              <p style={{ color: C.red, fontSize: 13, margin: "0 0 10px" }}>
                {authErr}
              </p>
            )}
            <button
              onClick={login}
              style={{
                width: "100%",
                background: "linear-gradient(135deg,#0099CC,#00D4FF)",
                color: C.bg,
                fontFamily: F.d,
                fontWeight: 800,
                fontSize: 18,
                letterSpacing: "2px",
                textTransform: "uppercase",
                borderRadius: 8,
                padding: "12px 24px",
                border: "none",
                cursor: "pointer",
                marginTop: 8,
              }}
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    );

  // ── DASHBOARD ──
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F.b }}>
      {/* Header */}
      <header
        style={{
          background: "rgba(8,12,20,0.97)",
          borderBottom: "1px solid rgba(0,212,255,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 40,
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
            maxWidth: 800,
            margin: "0 auto",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: F.d,
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "rgba(0,212,255,0.4)",
              }}
            >
              CSCDM · Contabilidad
            </div>
            <div
              style={{
                fontFamily: F.d,
                fontWeight: 900,
                fontSize: 28,
                lineHeight: 1.1,
                textTransform: "uppercase",
              }}
            >
              Ingresos
            </div>
          </div>
          <button
            onClick={exportExcel}
            style={{
              background: "linear-gradient(135deg,#16a34a,#22c55e)",
              color: "#fff",
              fontFamily: F.d,
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              borderRadius: 8,
              padding: "10px 18px",
              border: "none",
              cursor: "pointer",
            }}
          >
            ↓ Excel
          </button>
        </div>
      </header>

      <div
        style={{ maxWidth: 800, margin: "0 auto", padding: "20px 20px 80px" }}
      >
        {loading && (
          <p style={{ textAlign: "center", color: C.t3, padding: 40 }}>
            Cargando...
          </p>
        )}

        {data && (
          <>
            {/* Totales globales */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 28,
              }}
            >
              {[
                {
                  l: "Ingresos totales",
                  v: fmt(data.totalIngresos),
                  c: C.green,
                },
                {
                  l: "Entradas vendidas",
                  v: String(data.totalEntradas),
                  c: C.accent,
                },
              ].map(({ l, v, c }) => (
                <div
                  key={l}
                  style={{
                    ...card,
                    padding: "20px 16px",
                    textAlign: "center",
                    marginBottom: 0,
                  }}
                >
                  <div
                    style={{
                      fontFamily: F.d,
                      fontWeight: 900,
                      fontSize: 36,
                      color: c,
                      lineHeight: 1,
                    }}
                  >
                    {v}
                  </div>
                  <div
                    style={{
                      color: C.t3,
                      fontFamily: F.d,
                      fontWeight: 700,
                      fontSize: 10,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      marginTop: 6,
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>

            {/* Por partido */}
            <div
              style={{
                fontFamily: F.d,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "rgba(0,212,255,0.4)",
                marginBottom: 14,
              }}
            >
              — Por partido
            </div>

            {data.porPartido.map((m) => (
              <div key={m.id} style={card}>
                <div
                  style={{
                    height: 2,
                    background:
                      m.ingresos > 0
                        ? "linear-gradient(90deg,#00D4FF,#00FF88)"
                        : "rgba(74,96,122,0.3)",
                  }}
                />
                <div style={{ padding: "16px 20px" }}>
                  {/* Título */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: F.d,
                          fontWeight: 900,
                          fontSize: 22,
                          textTransform: "uppercase",
                          letterSpacing: "-0.3px",
                        }}
                      >
                        {m.opponent}
                      </div>
                      <div style={{ color: C.t3, fontSize: 12 }}>
                        {m.round} ·{" "}
                        {new Date(m.date).toLocaleDateString("es-AR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          timeZone: "America/Argentina/Buenos_Aires",
                        })}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: F.d,
                        fontWeight: 900,
                        fontSize: 28,
                        color: C.green,
                        textAlign: "right",
                      }}
                    >
                      {fmt(m.ingresos)}
                    </div>
                  </div>

                  {/* Métricas */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: 8,
                    }}
                  >
                    {[
                      { l: "Entradas", v: String(m.entradas), c: "#fff" },
                      {
                        l: "Early Bird",
                        v: `${m.earlyBirdCount} · ${fmt(m.earlyBirdIngresos)}`,
                        c: C.yellow,
                      },
                      {
                        l: "Normal",
                        v: `${m.normalCount} · ${fmt(m.normalIngresos)}`,
                        c: C.accent,
                      },
                    ].map(({ l, v, c }) => (
                      <div
                        key={l}
                        style={{
                          background: "rgba(8,12,20,0.5)",
                          border: "1px solid rgba(0,212,255,0.06)",
                          borderRadius: 8,
                          padding: "10px 10px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: F.d,
                            fontWeight: 700,
                            fontSize: 9,
                            letterSpacing: "1.5px",
                            textTransform: "uppercase",
                            color: "rgba(0,212,255,0.3)",
                            marginBottom: 4,
                          }}
                        >
                          {l}
                        </div>
                        <div
                          style={{
                            fontFamily: F.d,
                            fontWeight: 800,
                            fontSize: 15,
                            color: c,
                            lineHeight: 1.2,
                          }}
                        >
                          {v}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {data.porPartido.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: C.t3,
                }}
              >
                No hay ventas registradas aún
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

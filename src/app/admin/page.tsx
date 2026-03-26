"use client";

import { useState, useEffect, useCallback } from "react";
import { formatPrice } from "@/lib/pricing";

type MatchStatus = "UPCOMING" | "SOLD_OUT" | "FINISHED" | "CANCELLED";
type Match = {
  id: string;
  opponent: string;
  date: string;
  venue: string;
  round: string;
  isHome: boolean;
  status: MatchStatus;
  earlyBirdPrice: number;
  matchDayPrice: number;
  earlyBirdDeadline: string;
  totalCapacity: number;
  soldTickets: number;
};

const F = {
  d: "'Barlow Condensed','Impact',sans-serif",
  b: "'DM Sans','Segoe UI',sans-serif",
};
const C = {
  accent: "#00D4FF",
  green: "#00FF88",
  red: "#FF3B3B",
  yellow: "#FFD600",
  bg: "#080C14",
  bg2: "#0D1320",
  t2: "#9BAFC7",
  t3: "#4A607A",
};
const ROUNDS = [
  "Fase de Grupos",
  "Octavos de Final",
  "Cuartos de Final",
  "Semifinal",
  "Final",
];
const emptyForm = {
  opponent: "",
  date: "",
  time: "17:00",
  venue: "Cancha del Club Social",
  round: "",
  isHome: true,
  earlyBirdPrice: "",
  matchDayPrice: "",
  earlyBirdDeadline: "",
  earlyBirdDeadlineTime: "23:59",
  totalCapacity: "300",
};

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: C.bg,
  fontFamily: F.b,
  position: "relative",
};
const card: React.CSSProperties = {
  background: C.bg2,
  border: "1px solid rgba(0,212,255,0.08)",
  borderRadius: 12,
  overflow: "hidden",
  marginBottom: 12,
};
const cb: React.CSSProperties = { padding: "18px 20px" };
const inp: React.CSSProperties = {
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
};
const lbl: React.CSSProperties = {
  display: "block",
  fontFamily: F.d,
  fontWeight: 700,
  fontSize: 10,
  letterSpacing: "2.5px",
  textTransform: "uppercase",
  color: "rgba(0,212,255,0.45)",
  marginBottom: 8,
};
const btnPrim: React.CSSProperties = {
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
  boxShadow: "0 4px 20px rgba(0,212,255,0.15)",
};

const ST: Record<MatchStatus, { bg: string; color: string; label: string }> = {
  UPCOMING: { bg: "rgba(0,212,255,0.08)", color: C.accent, label: "En venta" },
  SOLD_OUT: { bg: "rgba(255,59,59,0.08)", color: C.red, label: "Agotado" },
  FINISHED: { bg: "rgba(74,96,122,0.12)", color: C.t3, label: "Finalizado" },
  CANCELLED: {
    bg: "rgba(255,214,0,0.08)",
    color: C.yellow,
    label: "Cancelado",
  },
};

function Badge({ status }: { status: MatchStatus }) {
  const s = ST[status];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}30`,
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "1.5px",
        textTransform: "uppercase" as const,
      }}
    >
      {s.label}
    </span>
  );
}

function Header({
  title,
  back,
  onNew,
}: {
  title: string;
  back?: () => void;
  onNew?: () => void;
}) {
  return (
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
          maxWidth: 720,
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {back && (
            <button
              onClick={back}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid rgba(0,212,255,0.2)",
                background: "rgba(0,212,255,0.05)",
                color: C.accent,
                fontSize: 18,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ←
            </button>
          )}
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
              CSCDM · Panel Admin
            </div>
            <div
              style={{
                fontFamily: F.d,
                fontWeight: 900,
                fontSize: 28,
                lineHeight: 1.1,
                textTransform: "uppercase",
                letterSpacing: "-0.5px",
              }}
            >
              {title}
            </div>
          </div>
        </div>
        {onNew && (
          <button
            onClick={onNew}
            style={{ ...btnPrim, fontSize: 14, padding: "10px 18px" }}
          >
            + Nuevo Partido
          </button>
        )}
      </div>
    </header>
  );
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [auth, setAuth] = useState(false);
  const [authErr, setAuthErr] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "new" | "edit">("list");
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirm, setConfirm] = useState<{
    id: string;
    status: MatchStatus;
    msg: string;
  } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/matches", {
        headers: { "x-admin-secret": secret },
      });
      if (!r.ok) throw new Error();
      setMatches(await r.json());
    } catch {
      showToast("Error cargando partidos", false);
    } finally {
      setLoading(false);
    }
  }, [secret]);

  const login = async () => {
    setAuthErr("");
    const r = await fetch("/api/admin/matches", {
      headers: { "x-admin-secret": secret },
    });
    if (r.ok) {
      setMatches(await r.json());
      setAuth(true);
    } else setAuthErr("Clave incorrecta");
  };

  const save = async () => {
    if (
      !form.opponent ||
      !form.date ||
      !form.round ||
      !form.earlyBirdPrice ||
      !form.matchDayPrice ||
      !form.earlyBirdDeadline
    ) {
      showToast("Completá todos los campos", false);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...(editId && { id: editId }),
        opponent: form.opponent,
        date: `${form.date}T${form.time}:00`,
        venue: form.venue,
        round: form.round,
        isHome: form.isHome,
        earlyBirdPrice: Number(form.earlyBirdPrice),
        matchDayPrice: Number(form.matchDayPrice),
        earlyBirdDeadline: `${form.earlyBirdDeadline}T${form.earlyBirdDeadlineTime}:00`,
        totalCapacity: Number(form.totalCapacity),
      };
      const r = await fetch("/api/admin/matches", {
        method: editId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error();
      showToast(editId ? "Partido actualizado ✓" : "Partido creado ✓");
      setView("list");
      setEditId(null);
      setForm({ ...emptyForm });
      fetchMatches();
    } catch {
      showToast("Error al guardar", false);
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (id: string, status: MatchStatus) => {
    try {
      const r = await fetch("/api/admin/matches", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ id, status }),
      });
      if (!r.ok) throw new Error();
      showToast("Estado actualizado ✓");
      fetchMatches();
    } catch {
      showToast("Error", false);
    } finally {
      setConfirm(null);
    }
  };

  const openEdit = (m: Match) => {
    const d = new Date(m.date);
    const dl = new Date(m.earlyBirdDeadline);

    // Helper: obtener fecha YYYY-MM-DD en timezone Argentina
    const toARDate = (date: Date) =>
      date
        .toLocaleDateString("es-AR", {
          timeZone: "America/Argentina/Buenos_Aires",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .split("/")
        .reverse()
        .join("-"); // dd/mm/yyyy → yyyy-mm-dd

    // Helper: obtener hora HH:MM en timezone Argentina
    const toARTime = (date: Date) =>
      date.toLocaleTimeString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

    setForm({
      opponent: m.opponent,
      date: toARDate(d),
      time: toARTime(d),
      venue: m.venue,
      round: m.round,
      isHome: m.isHome,
      earlyBirdPrice: String(m.earlyBirdPrice),
      matchDayPrice: String(m.matchDayPrice),
      earlyBirdDeadline: toARDate(dl),
      earlyBirdDeadlineTime: toARTime(dl),
      totalCapacity: String(m.totalCapacity),
    });
    setEditId(m.id);
    setView("edit");
  };

  const f = (k: string, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  // ── LOGIN ──
  if (!auth)
    return (
      <div
        style={{
          ...page,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
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
                Admin
              </span>
            </div>
            <div
              style={{
                color: C.t3,
                fontSize: 12,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              CSCDM · Makallé · Liga
            </div>
          </div>
          <div style={{ ...card, padding: 24 }}>
            <label style={lbl}>Clave de acceso</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="••••••••••••"
              style={{ ...inp, marginBottom: 8 }}
            />
            {authErr && (
              <p style={{ color: C.red, fontSize: 13, margin: "0 0 10px" }}>
                {authErr}
              </p>
            )}
            <button
              onClick={login}
              style={{ ...btnPrim, width: "100%", marginTop: 8 }}
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    );

  // ── FORM ──
  if (view === "new" || view === "edit") {
    const back = () => {
      setView("list");
      setEditId(null);
      setForm({ ...emptyForm });
    };
    return (
      <div style={page}>
        <Header
          title={view === "edit" ? "Editar Partido" : "Nuevo Partido"}
          back={back}
        />
        <div
          style={{ maxWidth: 680, margin: "0 auto", padding: "20px 20px 60px" }}
        >
          {[
            {
              title: "Rival",
              content: (
                <input
                  value={form.opponent}
                  onChange={(e) => f("opponent", e.target.value)}
                  placeholder="Ej: vs. Atlético Charata"
                  style={inp}
                />
              ),
            },
          ].map((s) => (
            <div key={s.title} style={{ ...card, padding: 20 }}>
              <span style={lbl}>{s.title}</span>
              {s.content}
            </div>
          ))}

          {/* Ronda */}
          <div style={{ ...card, padding: 20 }}>
            <span style={lbl}>Instancia *</span>
            <input
              value={form.round}
              onChange={(e) => f("round", e.target.value)}
              placeholder="Ej: Cuartos de Final"
              style={{ ...inp, marginBottom: 12 }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ROUNDS.map((r) => (
                <button
                  key={r}
                  onClick={() => f("round", r)}
                  style={{
                    fontSize: 11,
                    padding: "6px 12px",
                    borderRadius: 20,
                    border: `1px solid ${form.round === r ? C.accent : "rgba(0,212,255,0.15)"}`,
                    background:
                      form.round === r ? "rgba(0,212,255,0.1)" : "transparent",
                    color: form.round === r ? C.accent : C.t2,
                    cursor: "pointer",
                    fontFamily: F.b,
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha */}
          <div style={{ ...card, padding: 20 }}>
            <span style={lbl}>Fecha y hora *</span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div>
                <div style={{ color: C.t2, fontSize: 12, marginBottom: 5 }}>
                  Fecha
                </div>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => f("date", e.target.value)}
                  style={inp}
                />
              </div>
              <div>
                <div style={{ color: C.t2, fontSize: 12, marginBottom: 5 }}>
                  Hora
                </div>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => f("time", e.target.value)}
                  style={inp}
                />
              </div>
            </div>
          </div>

          {/* Estadio */}
          <div style={{ ...card, padding: 20 }}>
            <span style={lbl}>Estadio</span>
            <input
              value={form.venue}
              onChange={(e) => f("venue", e.target.value)}
              style={{ ...inp, marginBottom: 18 }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#CBD5E1", fontSize: 14 }}>
                ¿Partido local?
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    color: form.isHome ? C.accent : C.t3,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {form.isHome ? "Local" : "Visitante"}
                </span>
                <button
                  onClick={() => f("isHome", !form.isHome)}
                  style={{
                    width: 48,
                    height: 26,
                    borderRadius: 99,
                    background: form.isHome ? "#0099CC" : "#1E293B",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background .2s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 3,
                      left: form.isHome ? 24 : 3,
                      width: 20,
                      height: 20,
                      background: "#fff",
                      borderRadius: "50%",
                      transition: "left .2s",
                      boxShadow: "0 1px 4px rgba(0,0,0,.4)",
                    }}
                  />
                </button>
              </div>
            </div>
            {!form.isHome && (
              <div
                style={{
                  marginTop: 10,
                  background: "rgba(255,214,0,0.05)",
                  border: "1px solid rgba(255,214,0,0.2)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: C.yellow,
                  fontSize: 12,
                }}
              >
                Los partidos de visitante no aparecen en la venta pública
              </div>
            )}
          </div>

          {/* Precios */}
          <div style={{ ...card, padding: 20 }}>
            <span style={lbl}>Precios (ARS) *</span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div>
                <div style={{ color: C.t2, fontSize: 12, marginBottom: 5 }}>
                  Precio anticipado
                </div>
                <input
                  type="number"
                  value={form.earlyBirdPrice}
                  onChange={(e) => f("earlyBirdPrice", e.target.value)}
                  placeholder="2500"
                  style={inp}
                />
              </div>
              <div>
                <div style={{ color: C.t2, fontSize: 12, marginBottom: 5 }}>
                  Día del partido
                </div>
                <input
                  type="number"
                  value={form.matchDayPrice}
                  onChange={(e) => f("matchDayPrice", e.target.value)}
                  placeholder="3500"
                  style={inp}
                />
              </div>
            </div>
            {form.earlyBirdPrice && form.matchDayPrice && (
              <div
                style={{
                  background: "rgba(8,12,20,0.5)",
                  border: "1px solid rgba(0,212,255,0.06)",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                {[
                  [
                    "Anticipado",
                    formatPrice(Number(form.earlyBirdPrice)),
                    C.accent,
                  ],
                  [
                    "Día partido",
                    formatPrice(Number(form.matchDayPrice)),
                    "#E2E8F0",
                  ],
                  [
                    "Descuento",
                    formatPrice(
                      Number(form.matchDayPrice) - Number(form.earlyBirdPrice),
                    ),
                    C.green,
                  ],
                ].map(([l, v, c]) => (
                  <div
                    key={String(l)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      padding: "5px 0",
                      borderBottom: "1px solid rgba(0,212,255,0.04)",
                    }}
                  >
                    <span style={{ color: C.t3 }}>{l}</span>
                    <span style={{ color: String(c), fontWeight: 600 }}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deadline */}
          <div style={{ ...card, padding: 20 }}>
            <span style={lbl}>Precio anticipado válido hasta *</span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div>
                <div style={{ color: C.t2, fontSize: 12, marginBottom: 5 }}>
                  Fecha
                </div>
                <input
                  type="date"
                  value={form.earlyBirdDeadline}
                  onChange={(e) => f("earlyBirdDeadline", e.target.value)}
                  style={inp}
                />
              </div>
              <div>
                <div style={{ color: C.t2, fontSize: 12, marginBottom: 5 }}>
                  Hora
                </div>
                <input
                  type="time"
                  value={form.earlyBirdDeadlineTime}
                  onChange={(e) => f("earlyBirdDeadlineTime", e.target.value)}
                  style={inp}
                />
              </div>
            </div>
          </div>

          {/* Capacidad */}
          <div style={{ ...card, padding: 20, marginBottom: 20 }}>
            <span style={lbl}>Capacidad total</span>
            <input
              type="number"
              value={form.totalCapacity}
              onChange={(e) => f("totalCapacity", e.target.value)}
              style={inp}
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            style={{ ...btnPrim, width: "100%", opacity: saving ? 0.5 : 1 }}
          >
            {saving
              ? "Guardando..."
              : view === "edit"
                ? "Guardar Cambios"
                : "Crear Partido"}
          </button>
        </div>
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              background: toast.ok ? "#00D4FF" : C.red,
              color: toast.ok ? C.bg : "#fff",
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              zIndex: 999,
              whiteSpace: "nowrap",
            }}
          >
            {toast.msg}
          </div>
        )}
      </div>
    );
  }

  // ── LISTADO ──
  const upcoming = matches.filter((m) => m.status === "UPCOMING");
  const others = matches.filter((m) => m.status !== "UPCOMING");
  const totalSold = matches.reduce((a, m) => a + m.soldTickets, 0);

  return (
    <div style={page}>
      <Header
        title="Partidos"
        onNew={() => {
          setForm({ ...emptyForm });
          setView("new");
        }}
      />

      <div
        style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 80px" }}
      >
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 10,
            marginBottom: 28,
          }}
        >
          {[
            { l: "En venta", v: upcoming.length, c: C.accent },
            { l: "Vendidas", v: totalSold, c: "#fff" },
            { l: "Partidos", v: matches.length, c: C.t2 },
          ].map(({ l, v, c }) => (
            <div
              key={l}
              style={{
                ...card,
                padding: "16px 12px",
                textAlign: "center",
                margin: 0,
              }}
            >
              <div
                style={{
                  fontFamily: F.d,
                  fontWeight: 900,
                  fontSize: 40,
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
                  marginTop: 4,
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: C.t3 }}>
            Cargando...
          </div>
        )}

        {upcoming.length > 0 && (
          <>
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
              — En venta · {upcoming.length}
            </div>
            {upcoming.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                onEdit={() => openEdit(m)}
                onStatus={(s, msg) => setConfirm({ id: m.id, status: s, msg })}
              />
            ))}
          </>
        )}

        {others.length > 0 && (
          <>
            <div
              style={{
                fontFamily: F.d,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "rgba(74,96,122,0.5)",
                marginBottom: 14,
                marginTop: 28,
              }}
            >
              — Historial · {others.length}
            </div>
            {others.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                onEdit={() => openEdit(m)}
                onStatus={(s, msg) => setConfirm({ id: m.id, status: s, msg })}
              />
            ))}
          </>
        )}

        {matches.length === 0 && !loading && (
          <div
            style={{ textAlign: "center", padding: "80px 20px", color: C.t3 }}
          >
            <div
              style={{
                fontFamily: F.d,
                fontWeight: 900,
                fontSize: 80,
                color: "rgba(0,212,255,0.05)",
                marginBottom: 12,
              }}
            >
              ⚽
            </div>
            <p>No hay partidos cargados aún</p>
          </div>
        )}
      </div>

      {/* Modal confirm */}
      {confirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 50,
            padding: "0 20px 28px",
          }}
        >
          <div
            style={{
              ...card,
              padding: 24,
              width: "100%",
              maxWidth: 420,
              margin: 0,
            }}
          >
            <div
              style={{
                fontFamily: F.d,
                fontWeight: 900,
                fontSize: 26,
                letterSpacing: "-0.5px",
                marginBottom: 8,
                textTransform: "uppercase",
              }}
            >
              Confirmar acción
            </div>
            <p style={{ color: C.t2, fontSize: 13, marginBottom: 24 }}>
              {confirm.msg}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirm(null)}
                style={{
                  flex: 1,
                  padding: 13,
                  borderRadius: 8,
                  border: "1px solid rgba(74,96,122,0.3)",
                  background: "transparent",
                  color: C.t2,
                  fontFamily: F.b,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => changeStatus(confirm.id, confirm.status)}
                style={{
                  flex: 1,
                  padding: 13,
                  borderRadius: 8,
                  border: "none",
                  background: "#DC2626",
                  color: "#fff",
                  fontFamily: F.b,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.ok ? "#00D4FF" : C.red,
            color: toast.ok ? C.bg : "#fff",
            padding: "10px 20px",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            zIndex: 999,
            whiteSpace: "nowrap",
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  onEdit,
  onStatus,
}: {
  match: Match;
  onEdit: () => void;
  onStatus: (s: MatchStatus, m: string) => void;
}) {
  const pct = Math.round((match.soldTickets / match.totalCapacity) * 100);
  const barColor =
    pct > 80
      ? "linear-gradient(90deg,#FF3B3B,#FF7B3B)"
      : pct > 50
        ? "linear-gradient(90deg,#00D4FF,#FFD600)"
        : "linear-gradient(90deg,#00D4FF,#00FF88)";
  const F2 = {
    d: "'Barlow Condensed','Impact',sans-serif",
    b: "'DM Sans','Segoe UI',sans-serif",
  };
  const ba: React.CSSProperties = {
    fontSize: 11,
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid rgba(0,212,255,0.2)",
    background: "rgba(0,212,255,0.06)",
    color: "#00D4FF",
    cursor: "pointer",
    fontFamily: F2.b,
    fontWeight: 600,
  };

  return (
    <div
      style={{
        background: "#0D1320",
        border: "1px solid rgba(0,212,255,0.07)",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          height: 2,
          background:
            match.status === "SOLD_OUT"
              ? "#FF3B3B"
              : match.status === "UPCOMING"
                ? "linear-gradient(90deg,#00D4FF,#00FF88)"
                : "rgba(74,96,122,0.3)",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.03)",
        }}
      >
        <span
          style={{
            fontFamily: F2.d,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "rgba(0,212,255,0.4)",
          }}
        >
          {match.round}
        </span>
        <Badge status={match.status} />
      </div>
      <div style={{ padding: "16px 18px" }}>
        <div
          style={{
            fontFamily: F2.d,
            fontWeight: 900,
            fontSize: "clamp(22px,4vw,28px)",
            textTransform: "uppercase",
            letterSpacing: "-0.5px",
            marginBottom: 4,
          }}
        >
          {match.opponent}
        </div>
        <div
          style={{
            color: "rgba(74,96,122,0.7)",
            fontSize: 12,
            marginBottom: 14,
          }}
        >
          {(() => {
            const d = new Date(match.date);
            return (
              d.toLocaleDateString("es-AR", {
                weekday: "short",
                day: "numeric",
                month: "short",
                timeZone: "America/Argentina/Buenos_Aires",
              }) +
              " · " +
              d.toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/Argentina/Buenos_Aires",
              }) +
              " hs"
            );
          })()}{" "}
          · {match.venue}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {[
            {
              l: "Anticipado",
              v: formatPrice(match.earlyBirdPrice),
              c: "#00D4FF",
            },
            {
              l: "Día partido",
              v: formatPrice(match.matchDayPrice),
              c: "#E2E8F0",
            },
            {
              l: "Vendidas",
              v: `${match.soldTickets}/${match.totalCapacity}`,
              c: "#E2E8F0",
            },
          ].map(({ l, v, c }) => (
            <div
              key={l}
              style={{
                background: "rgba(8,12,20,0.5)",
                border: "1px solid rgba(0,212,255,0.06)",
                borderRadius: 8,
                padding: "8px 10px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: F2.d,
                  fontWeight: 700,
                  fontSize: 9,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "rgba(0,212,255,0.3)",
                  marginBottom: 3,
                }}
              >
                {l}
              </div>
              <div
                style={{
                  fontFamily: F2.d,
                  fontWeight: 800,
                  fontSize: 18,
                  color: c,
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "rgba(74,96,122,0.6)",
              marginBottom: 5,
            }}
          >
            <span>{pct}% vendido</span>
            <span>{match.totalCapacity - match.soldTickets} disponibles</span>
          </div>
          <div
            style={{
              height: 3,
              background: "rgba(255,255,255,0.04)",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: barColor,
                borderRadius: 99,
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button onClick={onEdit} style={ba}>
            Editar
          </button>
          {match.status === "UPCOMING" && (
            <>
              <button
                onClick={() =>
                  onStatus(
                    "FINISHED",
                    `Marcar "${match.opponent}" como finalizado.`,
                  )
                }
                style={{
                  ...ba,
                  border: "1px solid rgba(74,96,122,0.2)",
                  background: "transparent",
                  color: "#4A607A",
                }}
              >
                Finalizado
              </button>
              <button
                onClick={() =>
                  onStatus(
                    "CANCELLED",
                    `Cancelar "${match.opponent}". Deberás contactar compradores.`,
                  )
                }
                style={{
                  ...ba,
                  border: "1px solid rgba(255,214,0,0.2)",
                  background: "rgba(255,214,0,0.05)",
                  color: "#FFD600",
                }}
              >
                Cancelar
              </button>
            </>
          )}
          {(match.status === "FINISHED" || match.status === "CANCELLED") && (
            <button
              onClick={() =>
                onStatus("UPCOMING", `Reactivar venta de "${match.opponent}".`)
              }
              style={ba}
            >
              Reactivar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

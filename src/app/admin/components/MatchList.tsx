import { C, F, btnPrim } from "./constants";
import { MatchCard } from "./MatchCard";
import { Match, MatchStatus } from "../hooks/useMatches";

export function MatchList({
  matches,
  loading,
  onEdit,
  onStatus,
  onNew,
  onOperators,
}: {
  matches: Match[];
  loading: boolean;
  onEdit: (m: Match) => void;
  onStatus: (id: string, s: MatchStatus, msg: string) => void;
  onNew: () => void;
  onOperators: () => void;
}) {
  const upcoming = matches.filter((m) => m.status === "UPCOMING");
  const others = matches.filter((m) => m.status !== "UPCOMING");
  const totalSold = matches.reduce((a, m) => a + m.soldTickets, 0);

  return (
    <>
      {/* Actions para el Header — se pasan desde page.tsx */}
      <div
        style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 80px" }}
      >
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
                background: C.bg2,
                border: "1px solid rgba(0,212,255,0.08)",
                borderRadius: 12,
                overflow: "hidden",
                padding: "16px 12px",
                textAlign: "center",
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
                onEdit={() => onEdit(m)}
                onStatus={(s, msg) => onStatus(m.id, s, msg)}
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
                onEdit={() => onEdit(m)}
                onStatus={(s, msg) => onStatus(m.id, s, msg)}
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
    </>
  );
}

import { formatPrice } from "@/lib/pricing";
import { Badge } from "./Badge";
import { C, F } from "./constants";
import { Match, MatchStatus } from "../hooks/useMatches";

export function MatchCard({
  match,
  onEdit,
  onStatus,
}: {
  match: Match;
  onEdit: () => void;
  onStatus: (s: MatchStatus, msg: string) => void;
}) {
  const pct = Math.round((match.soldTickets / match.totalCapacity) * 100);
  const barColor =
    pct > 80
      ? "linear-gradient(90deg,#FF3B3B,#FF7B3B)"
      : pct > 50
        ? "linear-gradient(90deg,#00D4FF,#FFD600)"
        : "linear-gradient(90deg,#00D4FF,#00FF88)";

  const ba: React.CSSProperties = {
    fontSize: 11,
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid rgba(0,212,255,0.2)",
    background: "rgba(0,212,255,0.06)",
    color: "#00D4FF",
    cursor: "pointer",
    fontFamily: F.b,
    fontWeight: 600,
  };

  const dateStr = (() => {
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
  })();

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
            fontFamily: F.d,
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
            fontFamily: F.d,
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
          {dateStr} · {match.venue}
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
                  fontFamily: F.d,
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
                  fontFamily: F.d,
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

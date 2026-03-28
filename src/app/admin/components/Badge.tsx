import { C } from "./constants";
import { MatchStatus } from "../hooks/useMatches";

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

export function Badge({ status }: { status: MatchStatus }) {
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
        textTransform: "uppercase",
      }}
    >
      {s.label}
    </span>
  );
}

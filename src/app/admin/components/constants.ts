export const F = {
  d: "'Barlow Condensed','Impact',sans-serif",
  b: "'DM Sans','Segoe UI',sans-serif",
};

export const C = {
  accent: "#00D4FF",
  green: "#00FF88",
  red: "#FF3B3B",
  yellow: "#FFD600",
  bg: "#080C14",
  bg2: "#0D1320",
  t2: "#9BAFC7",
  t3: "#4A607A",
};

export const btnPrim: React.CSSProperties = {
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

export const inp: React.CSSProperties = {
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

export const lbl: React.CSSProperties = {
  display: "block",
  fontFamily: F.d,
  fontWeight: 700,
  fontSize: 10,
  letterSpacing: "2.5px",
  textTransform: "uppercase",
  color: "rgba(0,212,255,0.45)",
  marginBottom: 8,
};

export const card: React.CSSProperties = {
  background: C.bg2,
  border: "1px solid rgba(0,212,255,0.08)",
  borderRadius: 12,
  overflow: "hidden",
  marginBottom: 12,
};

export const ROUNDS = [
  "Fase de Grupos",
  "Octavos de Final",
  "Cuartos de Final",
  "Semifinal",
  "Final",
];

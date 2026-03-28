import { C, F } from "./constants";

export function Header({
  title,
  back,
  actions,
}: {
  title: string;
  back?: () => void;
  actions?: React.ReactNode;
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
        {actions}
      </div>
    </header>
  );
}

import { formatPrice } from "@/lib/pricing";
import { C, F, ROUNDS, btnPrim, card, inp, lbl } from "./constants";
import { MatchForm as MatchFormType } from "../hooks/useMatches";

export function MatchForm({
  form,
  editId,
  saving,
  toast,
  onChange,
  onSave,
  onBack,
}: {
  form: MatchFormType;
  editId: string | null;
  saving: boolean;
  toast: { msg: string; ok: boolean } | null;
  onChange: (k: string, v: any) => void;
  onSave: () => void;
  onBack: () => void;
}) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 20px 60px" }}>
      <div style={{ ...card, padding: 20 }}>
        <span style={lbl}>Rival *</span>
        <input
          value={form.opponent}
          onChange={(e) => onChange("opponent", e.target.value)}
          placeholder="Ej: vs. Atlético Charata"
          style={inp}
        />
      </div>

      <div style={{ ...card, padding: 20 }}>
        <span style={lbl}>Instancia *</span>
        <input
          value={form.round}
          onChange={(e) => onChange("round", e.target.value)}
          placeholder="Ej: Cuartos de Final"
          style={{ ...inp, marginBottom: 12 }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ROUNDS.map((r) => (
            <button
              key={r}
              onClick={() => onChange("round", r)}
              style={{
                fontSize: 11,
                padding: "6px 12px",
                borderRadius: 20,
                border: `1px solid ${form.round === r ? "#00D4FF" : "rgba(0,212,255,0.15)"}`,
                background:
                  form.round === r ? "rgba(0,212,255,0.1)" : "transparent",
                color: form.round === r ? "#00D4FF" : C.t2,
                cursor: "pointer",
                fontFamily: F.b,
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...card, padding: 20 }}>
        <span style={lbl}>Fecha y hora *</span>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <div>
            <div style={{ color: C.t2, fontSize: 12, marginBottom: 5 }}>
              Fecha
            </div>
            <input
              type="date"
              value={form.date}
              onChange={(e) => onChange("date", e.target.value)}
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
              onChange={(e) => onChange("time", e.target.value)}
              style={inp}
            />
          </div>
        </div>
      </div>

      <div style={{ ...card, padding: 20 }}>
        <span style={lbl}>Estadio</span>
        <input
          value={form.venue}
          onChange={(e) => onChange("venue", e.target.value)}
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
                color: form.isHome ? "#00D4FF" : C.t3,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {form.isHome ? "Local" : "Visitante"}
            </span>
            <button
              onClick={() => onChange("isHome", !form.isHome)}
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
              onChange={(e) => onChange("earlyBirdPrice", e.target.value)}
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
              onChange={(e) => onChange("matchDayPrice", e.target.value)}
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
                "#00D4FF",
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
                <span style={{ color: String(c), fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ ...card, padding: 20 }}>
        <span style={lbl}>Precio anticipado válido hasta *</span>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <div>
            <div style={{ color: C.t2, fontSize: 12, marginBottom: 5 }}>
              Fecha
            </div>
            <input
              type="date"
              value={form.earlyBirdDeadline}
              onChange={(e) => onChange("earlyBirdDeadline", e.target.value)}
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
              onChange={(e) =>
                onChange("earlyBirdDeadlineTime", e.target.value)
              }
              style={inp}
            />
          </div>
        </div>
      </div>

      <div style={{ ...card, padding: 20, marginBottom: 20 }}>
        <span style={lbl}>Capacidad total</span>
        <input
          type="number"
          value={form.totalCapacity}
          onChange={(e) => onChange("totalCapacity", e.target.value)}
          style={inp}
        />
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        style={{ ...btnPrim, width: "100%", opacity: saving ? 0.5 : 1 }}
      >
        {saving ? "Guardando..." : editId ? "Guardar Cambios" : "Crear Partido"}
      </button>

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

"use client";

import { useEffect, useState } from "react";
import { Header } from "./Header";
import { C, F, btnPrim, card, inp, lbl } from "./constants";

type Operator = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
};

export function OperatorsView({
  secret,
  onBack,
}: {
  secret: string;
  onBack: () => void;
}) {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", pin: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editPin, setEditPin] = useState<{ id: string; pin: string } | null>(
    null,
  );

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/operators", {
        headers: { "x-admin-secret": secret },
      });
      setOperators(await r.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!form.name || !form.email || !form.pin) {
      showToast("Completá todos los campos", false);
      return;
    }
    if (form.pin.length < 6) {
      showToast("El PIN debe tener al menos 6 caracteres", false);
      return;
    }
    setSaving(true);
    try {
      const r = await fetch("/api/admin/operators", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) {
        showToast(data.error ?? "Error", false);
        return;
      }
      showToast("Operador creado ✓");
      setForm({ name: "", email: "", pin: "" });
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch("/api/admin/operators", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ id, active: !active }),
    });
    showToast(!active ? "Operador activado ✓" : "Operador desactivado");
    load();
  };

  const changePin = async () => {
    if (!editPin || editPin.pin.length < 6) {
      showToast("PIN debe tener al menos 6 caracteres", false);
      return;
    }
    await fetch("/api/admin/operators", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ id: editPin.id, pin: editPin.pin }),
    });
    showToast("PIN actualizado ✓");
    setEditPin(null);
    load();
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F.b }}>
      <Header title="Operadores" back={onBack} />
      <div
        style={{ maxWidth: 680, margin: "0 auto", padding: "20px 20px 80px" }}
      >
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            ...btnPrim,
            fontSize: 14,
            padding: "10px 20px",
            marginBottom: 20,
          }}
        >
          {showForm ? "Cancelar" : "+ Nuevo Operador"}
        </button>

        {showForm && (
          <div style={{ ...card, padding: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <label style={lbl}>Nombre</label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Juan Pérez"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Correo</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="juan@cscdm.com"
                  style={inp}
                />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>PIN (mín. 6 caracteres)</label>
              <input
                type="password"
                value={form.pin}
                onChange={(e) =>
                  setForm((p) => ({ ...p, pin: e.target.value }))
                }
                placeholder="••••••••"
                style={inp}
              />
            </div>
            <button
              onClick={create}
              disabled={saving}
              style={{ ...btnPrim, width: "100%", opacity: saving ? 0.6 : 1 }}
            >
              {saving ? "Creando..." : "Crear Operador"}
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: C.t3 }}>
            Cargando...
          </div>
        ) : operators.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: C.t3 }}>
            <div
              style={{
                fontFamily: F.d,
                fontWeight: 900,
                fontSize: 60,
                color: "rgba(0,212,255,0.05)",
                marginBottom: 12,
              }}
            >
              👤
            </div>
            <p>No hay operadores creados</p>
          </div>
        ) : (
          operators.map((op) => (
            <div
              key={op.id}
              style={{
                background: C.bg2,
                border: `1px solid ${op.active ? "rgba(0,212,255,0.08)" : "rgba(74,96,122,0.15)"}`,
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  height: 2,
                  background: op.active
                    ? "linear-gradient(90deg,#00D4FF,#00FF88)"
                    : "rgba(74,96,122,0.3)",
                }}
              />
              <div style={{ padding: "14px 18px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: F.d,
                        fontWeight: 900,
                        fontSize: 22,
                        textTransform: "uppercase",
                        letterSpacing: "-0.5px",
                        color: op.active ? "#fff" : C.t3,
                      }}
                    >
                      {op.name}
                    </div>
                    <div style={{ color: C.t3, fontSize: 13, marginTop: 2 }}>
                      {op.email}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 4,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      background: op.active
                        ? "rgba(0,255,136,0.08)"
                        : "rgba(74,96,122,0.12)",
                      color: op.active ? C.green : C.t3,
                      border: `1px solid ${op.active ? "rgba(0,255,136,0.2)" : "rgba(74,96,122,0.2)"}`,
                    }}
                  >
                    {op.active ? "Activo" : "Inactivo"}
                  </span>
                </div>

                {editPin?.id === op.id && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <input
                      type="password"
                      value={editPin.pin}
                      onChange={(e) =>
                        setEditPin((p) =>
                          p ? { ...p, pin: e.target.value } : p,
                        )
                      }
                      placeholder="Nuevo PIN..."
                      style={{ ...inp }}
                    />
                    <button
                      onClick={changePin}
                      style={{
                        padding: "9px 14px",
                        borderRadius: 8,
                        background: C.accent,
                        color: C.bg,
                        fontFamily: F.d,
                        fontWeight: 800,
                        fontSize: 14,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditPin(null)}
                      style={{
                        padding: "9px 14px",
                        borderRadius: 8,
                        border: "1px solid rgba(74,96,122,0.3)",
                        background: "transparent",
                        color: C.t2,
                        fontSize: 13,
                        fontFamily: F.b,
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setEditPin({ id: op.id, pin: "" })}
                    style={{
                      fontSize: 11,
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid rgba(0,212,255,0.2)",
                      background: "rgba(0,212,255,0.06)",
                      color: C.accent,
                      cursor: "pointer",
                      fontFamily: F.b,
                      fontWeight: 600,
                    }}
                  >
                    Cambiar PIN
                  </button>
                  <button
                    onClick={() => toggleActive(op.id, op.active)}
                    style={{
                      fontSize: 11,
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: `1px solid ${op.active ? "rgba(255,59,59,0.25)" : "rgba(0,255,136,0.25)"}`,
                      background: op.active
                        ? "rgba(255,59,59,0.06)"
                        : "rgba(0,255,136,0.06)",
                      color: op.active ? C.red : C.green,
                      cursor: "pointer",
                      fontFamily: F.b,
                      fontWeight: 600,
                    }}
                  >
                    {op.active ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            </div>
          ))
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
    </div>
  );
}

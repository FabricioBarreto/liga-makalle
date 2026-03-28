"use client";

import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { MatchForm } from "./components/MatchForm";
import { MatchList } from "./components/MatchList";
import { OperatorsView } from "./components/OperatorsView";
import {
  useMatches,
  emptyForm,
  MatchForm as MatchFormType,
  Match,
  MatchStatus,
} from "./hooks/useMatches";
import { C, F, btnPrim, card, inp, lbl } from "./components/constants";

type View = "list" | "new" | "edit" | "operators";

export default function AdminPage() {
  const [secret, setSecret] = useState(() =>
    typeof window !== "undefined"
      ? (sessionStorage.getItem("admin_secret") ?? "")
      : "",
  );
  const [auth, setAuth] = useState(() =>
    typeof window !== "undefined"
      ? !!sessionStorage.getItem("admin_secret")
      : false,
  );
  const [authErr, setAuthErr] = useState("");
  const [view, setView] = useState<View>("list");
  const [form, setForm] = useState<MatchFormType>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirm, setConfirm] = useState<{
    id: string;
    status: MatchStatus;
    msg: string;
  } | null>(null);

  const { matches, loading, fetchMatches, saveMatch, changeStatus } =
    useMatches(secret);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const login = async () => {
    setAuthErr("");
    const r = await fetch("/api/admin/matches", {
      headers: { "x-admin-secret": secret },
    });
    if (r.ok) {
      sessionStorage.setItem("admin_secret", secret);
      setAuth(true);
    } else setAuthErr("Clave incorrecta");
  };

  useEffect(() => {
    if (auth && view === "list") fetchMatches();
  }, [auth]);

  const handleSave = async () => {
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
      await saveMatch(form, editId);
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

  const handleStatus = async (id: string, status: MatchStatus, msg: string) => {
    setConfirm({ id, status, msg });
  };

  const confirmStatus = async () => {
    if (!confirm) return;
    try {
      await changeStatus(confirm.id, confirm.status);
      showToast("Estado actualizado ✓");
    } catch {
      showToast("Error", false);
    } finally {
      setConfirm(null);
    }
  };

  const openEdit = (m: Match) => {
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
        .join("-");
    const toARTime = (date: Date) =>
      date.toLocaleTimeString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    const d = new Date(m.date),
      dl = new Date(m.earlyBirdDeadline);
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

  // ── LOGIN ──
  if (!auth)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          fontFamily: F.b,
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

  // ── OPERADORES ──
  if (view === "operators")
    return <OperatorsView secret={secret} onBack={() => setView("list")} />;

  // ── FORM ──
  if (view === "new" || view === "edit")
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F.b }}>
        <Header
          title={view === "edit" ? "Editar Partido" : "Nuevo Partido"}
          back={() => {
            setView("list");
            setEditId(null);
            setForm({ ...emptyForm });
          }}
        />
        <MatchForm
          form={form}
          editId={editId}
          saving={saving}
          toast={toast}
          onChange={(k, v) => setForm((p) => ({ ...p, [k]: v }))}
          onSave={handleSave}
          onBack={() => {
            setView("list");
            setEditId(null);
            setForm({ ...emptyForm });
          }}
        />
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: F.b,
        position: "relative",
      }}
    >
      <Header
        title="Partidos"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => (window.location.href = "/admin/contabilidad")}
              style={{
                ...btnPrim,
                fontSize: 13,
                padding: "10px 16px",
                background: "transparent",
                color: C.t2,
                border: "1px solid rgba(74,96,122,0.3)",
                boxShadow: "none",
              }}
            >
              Contabilidad
            </button>
            <button
              onClick={() => setView("operators")}
              style={{
                ...btnPrim,
                fontSize: 13,
                padding: "10px 16px",
                background: "transparent",
                color: C.accent,
                border: "1px solid rgba(0,212,255,0.3)",
                boxShadow: "none",
              }}
            >
              Operadores
            </button>
            <button
              onClick={() => {
                setForm({ ...emptyForm });
                setView("new");
              }}
              style={{ ...btnPrim, fontSize: 14, padding: "10px 18px" }}
            >
              + Partido
            </button>

            <button
              onClick={() => {
                sessionStorage.removeItem("admin_secret");
                setAuth(false);
                setSecret("");
              }}
              style={{
                ...btnPrim,
                fontSize: 12,
                padding: "8px 14px",
                background: "transparent",
                color: C.t3,
                border: "1px solid rgba(74,96,122,0.2)",
                boxShadow: "none",
              }}
            >
              Salir
            </button>
          </div>
        }
      />

      <MatchList
        matches={matches}
        loading={loading}
        onEdit={openEdit}
        onStatus={handleStatus}
        onNew={() => {
          setForm({ ...emptyForm });
          setView("new");
        }}
        onOperators={() => setView("operators")}
      />

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
              background: C.bg2,
              border: "1px solid rgba(0,212,255,0.08)",
              borderRadius: 12,
              overflow: "hidden",
              padding: 24,
              width: "100%",
              maxWidth: 420,
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
                onClick={confirmStatus}
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

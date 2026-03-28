"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

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

type ScanResult =
  | {
      valid: true;
      email: string;
      phone: string;
      match: string;
      matchDate: string;
      quantity: number;
      isEarlyBird: boolean;
    }
  | { valid: false; error: string };

type Screen = "login" | "scan" | "result";

export default function OperadorPage() {
  const [screen, setScreen] = useState<Screen>("login");
  const [operatorName, setOperatorName] = useState("");

  // login
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // scanner
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualQR, setManualQR] = useState("");
  const [showManual, setShowManual] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const login = async () => {
    if (!email || !pin) {
      setLoginErr("Completá todos los campos");
      return;
    }
    setLoggingIn(true);
    setLoginErr("");
    try {
      const r = await fetch("/api/operators/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });
      const data = await r.json();
      if (!r.ok) {
        setLoginErr(data.error ?? "Error al ingresar");
        return;
      }
      setOperatorName(data.name);
      setScreen("scan");
    } catch {
      setLoginErr("Error de conexión");
    } finally {
      setLoggingIn(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        tick();
      }
    } catch {
      setShowManual(true);
    }
  };

  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const tick = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(img.data, img.width, img.height, {
      inversionAttempts: "dontInvert",
    });
    if (code?.data) {
      stopCamera();
      validate(code.data);
    } else rafRef.current = requestAnimationFrame(tick);
  };

  const validate = async (qr: string) => {
    const res = await fetch(
      `/api/tickets/validate?qr=${encodeURIComponent(qr)}`,
    );
    const data = await res.json();
    setResult(data);
    setScreen("result");
  };

  useEffect(() => {
    if (screen === "scan") startCamera();
    return () => stopCamera();
  }, [screen]);

  // ── LOGIN ──
  if (screen === "login") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: F.b,
          padding: 20,
        }}
      >
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
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
              Acceso
              <br />
              <span
                style={{
                  WebkitTextStroke: "1px rgba(0,212,255,0.4)",
                  color: "transparent",
                }}
              >
                Operador
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
              CSCDM · Control de ingresos
            </div>
          </div>

          <div
            style={{
              background: C.bg2,
              border: "1px solid rgba(0,212,255,0.08)",
              borderRadius: 14,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  color: C.t3,
                  fontSize: 10,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  fontFamily: F.d,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operador@cscdm.com"
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
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  color: C.t3,
                  fontSize: 10,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  fontFamily: F.d,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                placeholder="Tu PIN de acceso"
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
                }}
              />
            </div>

            {loginErr && (
              <p
                style={{
                  color: C.red,
                  fontSize: 13,
                  fontWeight: 600,
                  margin: 0,
                  textAlign: "center",
                }}
              >
                {loginErr}
              </p>
            )}

            <button
              onClick={login}
              disabled={loggingIn}
              style={{
                background: "linear-gradient(135deg,#0099CC,#00D4FF)",
                color: C.bg,
                fontFamily: F.d,
                fontWeight: 800,
                fontSize: 20,
                letterSpacing: "2px",
                textTransform: "uppercase",
                borderRadius: 8,
                padding: "13px 24px",
                border: "none",
                cursor: "pointer",
                opacity: loggingIn ? 0.6 : 1,
                marginTop: 4,
              }}
            >
              {loggingIn ? "Verificando..." : "Ingresar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SCANNER ──
  if (screen === "scan") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F.b }}>
        <header
          style={{
            background: "rgba(8,12,20,0.97)",
            borderBottom: "1px solid rgba(0,212,255,0.08)",
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
              {operatorName} · Escáner
            </div>
            <div
              style={{
                fontFamily: F.d,
                fontWeight: 900,
                fontSize: 26,
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              Escanear QR
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              setScreen("login");
              setEmail("");
              setPin("");
            }}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid rgba(0,212,255,0.2)",
              background: "rgba(0,212,255,0.05)",
              color: C.accent,
              fontFamily: F.b,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Salir
          </button>
        </header>

        <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px" }}>
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              background: "#000",
              aspectRatio: "1",
              marginBottom: 20,
              border: "2px solid rgba(0,212,255,0.2)",
            }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: scanning ? "block" : "none",
              }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {scanning && (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: "10%",
                    right: "10%",
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
                    animation: "scan 2s ease-in-out infinite",
                    top: "50%",
                  }}
                />
                {[
                  ["0%", "0%"],
                  ["100%", "0%"],
                  ["0%", "100%"],
                  ["100%", "100%"],
                ].map(([l, t], i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: l,
                      top: t,
                      width: 28,
                      height: 28,
                      borderTop: i < 2 ? `3px solid ${C.accent}` : "none",
                      borderBottom: i >= 2 ? `3px solid ${C.accent}` : "none",
                      borderLeft:
                        i % 2 === 0 ? `3px solid ${C.accent}` : "none",
                      borderRight:
                        i % 2 === 1 ? `3px solid ${C.accent}` : "none",
                      transform: `translate(${i % 2 === 0 ? "8px" : "-8px"},${i < 2 ? "8px" : "-8px"})`,
                    }}
                  />
                ))}
              </>
            )}
            {!scanning && !showManual && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <p
                  style={{
                    color: C.t2,
                    fontSize: 14,
                    textAlign: "center",
                    margin: 0,
                  }}
                >
                  Iniciando cámara...
                </p>
              </div>
            )}
          </div>
          <style>{`@keyframes scan { 0%,100%{top:15%} 50%{top:85%} }`}</style>
          <p
            style={{
              textAlign: "center",
              color: C.t3,
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            Apuntá la cámara al QR del comprador
          </p>
          <button
            onClick={() => setShowManual(!showManual)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(0,212,255,0.15)",
              background: "rgba(0,212,255,0.04)",
              color: C.t2,
              fontFamily: F.b,
              fontSize: 14,
              cursor: "pointer",
              marginBottom: 10,
            }}
          >
            Ingresar código manual
          </button>
          {showManual && (
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={manualQR}
                onChange={(e) => setManualQR(e.target.value)}
                placeholder="Pegá el código del QR..."
                style={{
                  flex: 1,
                  background: "rgba(8,12,20,0.8)",
                  border: "1px solid rgba(0,212,255,0.15)",
                  borderRadius: 8,
                  padding: "11px 14px",
                  color: "#fff",
                  fontSize: 14,
                  fontFamily: F.b,
                  outline: "none",
                }}
              />
              <button
                onClick={() => {
                  stopCamera();
                  validate(manualQR);
                }}
                style={{
                  padding: "11px 18px",
                  borderRadius: 8,
                  background: C.accent,
                  color: C.bg,
                  fontFamily: F.d,
                  fontWeight: 800,
                  fontSize: 16,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                OK
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTADO ──
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: F.b,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          background: "rgba(8,12,20,0.97)",
          borderBottom: "1px solid rgba(0,212,255,0.08)",
          padding: "12px 20px",
        }}
      >
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
          {operatorName} · Resultado
        </div>
        <div
          style={{
            fontFamily: F.d,
            fontWeight: 900,
            fontSize: 26,
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          Verificación
        </div>
      </header>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          {result?.valid ? (
            <div
              style={{
                background: "rgba(0,255,136,0.05)",
                border: `2px solid ${C.green}`,
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg,rgba(0,255,136,0.15),rgba(0,255,136,0.05))",
                  padding: "28px 24px",
                  textAlign: "center",
                  borderBottom: "1px solid rgba(0,255,136,0.15)",
                }}
              >
                <div style={{ fontSize: 64, marginBottom: 8 }}>✅</div>
                <div
                  style={{
                    fontFamily: F.d,
                    fontWeight: 900,
                    fontSize: 40,
                    color: C.green,
                    textTransform: "uppercase",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Entrada Válida
                </div>
              </div>
              <div style={{ padding: "20px 24px" }}>
                {[
                  ["Partido", result.match],
                  ["Email", result.email],
                  ["Teléfono", result.phone],
                  ["Entradas", `${result.quantity}`],
                  ["Tipo", result.isEarlyBird ? "Preventa" : "Precio normal"],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span style={{ color: C.t3, fontSize: 13 }}>{l}</span>
                    <span
                      style={{
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 600,
                        maxWidth: "60%",
                        textAlign: "right",
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "rgba(255,59,59,0.05)",
                border: `2px solid ${C.red}`,
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg,rgba(255,59,59,0.15),rgba(255,59,59,0.05))",
                  padding: "28px 24px",
                  textAlign: "center",
                  borderBottom: "1px solid rgba(255,59,59,0.15)",
                }}
              >
                <div style={{ fontSize: 64, marginBottom: 8 }}>❌</div>
                <div
                  style={{
                    fontFamily: F.d,
                    fontWeight: 900,
                    fontSize: 40,
                    color: C.red,
                    textTransform: "uppercase",
                    letterSpacing: "-0.5px",
                  }}
                >
                  No Válida
                </div>
                <p style={{ color: C.t2, fontSize: 14, margin: "12px 0 0" }}>
                  {result?.error ?? "Error desconocido"}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              setResult(null);
              setScreen("scan");
            }}
            style={{
              width: "100%",
              marginTop: 20,
              padding: 16,
              borderRadius: 12,
              background: "linear-gradient(135deg,#0099CC,#00D4FF)",
              color: C.bg,
              fontFamily: F.d,
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: "1px",
              textTransform: "uppercase",
              border: "none",
              cursor: "pointer",
            }}
          >
            Escanear otro
          </button>
        </div>
      </div>
    </div>
  );
}

// src/app/operador/page.tsx
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

type Screen = "pin" | "scan" | "result";

const PIN = "1234"; // cambiá esto o usá una env var

export default function OperadorPage() {
  const [screen, setScreen] = useState<Screen>("pin");
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualQR, setManualQR] = useState("");
  const [showManual, setShowManual] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  // ── Cámara ──
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
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
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

  // ── PIN ──
  if (screen === "pin") {
    const handlePin = (d: string) => {
      const next = pin + d;
      setPin(next);
      setPinErr(false);
      if (next.length === 4) {
        if (next === PIN) {
          setScreen("scan");
          setPin("");
        } else {
          setPinErr(true);
          setTimeout(() => setPin(""), 600);
        }
      }
    };

    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: F.b,
        }}
      >
        <div style={{ width: "100%", maxWidth: 320, padding: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div
              style={{
                fontFamily: F.d,
                fontWeight: 900,
                fontSize: 56,
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

          {/* Puntos PIN */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              marginBottom: 36,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background:
                    pin.length > i
                      ? pinErr
                        ? C.red
                        : C.accent
                      : "transparent",
                  border: `2px solid ${pin.length > i ? (pinErr ? C.red : C.accent) : C.t3}`,
                  transition: "all .15s",
                  boxShadow:
                    pin.length > i && !pinErr
                      ? `0 0 10px ${C.accent}60`
                      : "none",
                }}
              />
            ))}
          </div>

          {/* Teclado */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 10,
            }}
          >
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(
              (d, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (d === "⌫") {
                      setPin((p) => p.slice(0, -1));
                      setPinErr(false);
                    } else if (d !== "") handlePin(d);
                  }}
                  style={{
                    height: 64,
                    borderRadius: 12,
                    background:
                      d === "" ? "transparent" : "rgba(0,212,255,0.05)",
                    border: d === "" ? "none" : `1px solid rgba(0,212,255,0.1)`,
                    color: d === "⌫" ? C.t3 : "#fff",
                    fontFamily: F.d,
                    fontWeight: 800,
                    fontSize: 28,
                    cursor: d === "" ? "default" : "pointer",
                    transition: "all .1s",
                  }}
                >
                  {d}
                </button>
              ),
            )}
          </div>

          {pinErr && (
            <p
              style={{
                textAlign: "center",
                color: C.red,
                fontSize: 13,
                marginTop: 16,
                fontWeight: 600,
              }}
            >
              PIN incorrecto
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── SCANNER ──
  if (screen === "scan") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F.b }}>
        {/* Header */}
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
              Operador · Escáner
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
              setScreen("pin");
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
          {/* Visor cámara */}
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              background: "#000",
              aspectRatio: "1",
              marginBottom: 20,
              border: `2px solid rgba(0,212,255,0.2)`,
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

            {/* Marco de escaneo */}
            {scanning && (
              <>
                {/* línea de scan animada */}
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
                {/* esquinas */}
                {[
                  ["0%", "0%", "right", "bottom"],
                  ["100%", "0%", "left", "bottom"],
                  ["0%", "100%", "right", "top"],
                  ["100%", "100%", "left", "top"],
                ].map(([l, t, br, bb], i) => (
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
                      transform: `translate(${i % 2 === 0 ? "8px" : "-8px"}, ${i < 2 ? "8px" : "-8px"})`,
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
                <div style={{ fontSize: 48 }}>📷</div>
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

          {/* Ingreso manual */}
          <button
            onClick={() => setShowManual(!showManual)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: `1px solid rgba(0,212,255,0.15)`,
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
          Operador · Resultado
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
                  background: `linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.05))`,
                  padding: "28px 24px",
                  textAlign: "center",
                  borderBottom: `1px solid rgba(0,255,136,0.15)`,
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
                  ["Tipo", result.isEarlyBird ? "Early Bird" : "Precio normal"],
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
                  background: `linear-gradient(135deg, rgba(255,59,59,0.15), rgba(255,59,59,0.05))`,
                  padding: "28px 24px",
                  textAlign: "center",
                  borderBottom: `1px solid rgba(255,59,59,0.15)`,
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
              padding: "16px",
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
              boxShadow: `0 4px 20px rgba(0,212,255,0.2)`,
            }}
          >
            Escanear otro
          </button>
        </div>
      </div>
    </div>
  );
}

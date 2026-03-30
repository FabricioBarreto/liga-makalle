import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CSCDM — Entradas Oficiales",
  description:
    "Comprá tus entradas para los partidos del Club Social y Cultural Deportivo Makallé",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <footer style={{ textAlign: "center", padding: "12px", fontSize: "11px", color: "#666", borderTop: "1px solid #eee", marginTop: "auto" }}>
          Desarrollado por{" "}
          <a href="mailto:fabriciobarreto2610@gmail.com" style={{ color: "#888", textDecoration: "underline" }}>
            Fabricio Barreto
          </a>
        </footer>
      </body>
    </html>
  );
}

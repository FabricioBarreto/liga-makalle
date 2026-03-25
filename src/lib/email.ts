import nodemailer from "nodemailer";
import { formatDate, formatTime, formatPrice, generateOrderNumber } from "./pricing";

// Mismo transporter que Makalle Carnavales
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface SendTicketEmailParams {
  to: string;
  buyerName: string;
  matchOpponent: string;
  matchDate: Date | string;
  matchVenue: string;
  matchRound: string;
  ticketId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  isEarlyBird: boolean;
  qrCode: string;
  pdfBuffer?: Buffer; // PDF adjunto si se genera
}

export async function sendTicketEmail(params: SendTicketEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const {
    to,
    buyerName,
    matchOpponent,
    matchDate,
    matchVenue,
    matchRound,
    ticketId,
    quantity,
    unitPrice,
    totalAmount,
    isEarlyBird,
    qrCode,
    pdfBuffer,
  } = params;

  const orderNumber = generateOrderNumber(ticketId);
  const dateStr = formatDate(matchDate);
  const timeStr = formatTime(matchDate);

  try {
    const htmlContent = generateEmailHTML({
      buyerName,
      matchOpponent,
      matchDate: dateStr,
      matchTime: timeStr,
      matchVenue,
      matchRound,
      orderNumber,
      quantity,
      unitPrice,
      totalAmount,
      isEarlyBird,
      qrCode,
    });

    const textContent = generateEmailText({
      buyerName,
      matchOpponent,
      matchDate: dateStr,
      matchTime: timeStr,
      matchVenue,
      orderNumber,
      quantity,
      totalAmount,
      qrCode,
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || "Entradas Futbol",
        address: process.env.GMAIL_USER || "",
      },
      to,
      subject: `Tus entradas: ${matchOpponent} - ${matchRound}`,
      text: textContent,
      html: htmlContent,
      ...(pdfBuffer && {
        attachments: [
          {
            filename: `entrada-${orderNumber}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      }),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado:", info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error enviando email:", error);
    return { success: false, error: error.message };
  }
}

// --- HTML template ---
function generateEmailHTML(p: {
  buyerName: string;
  matchOpponent: string;
  matchDate: string;
  matchTime: string;
  matchVenue: string;
  matchRound: string;
  orderNumber: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  isEarlyBird: boolean;
  qrCode: string;
}) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tus entradas</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f0f0f0; color: #111; }
    .wrapper { max-width: 580px; margin: 0 auto; padding: 20px; }
    .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #16a34a; padding: 32px 24px; text-align: center; }
    .header h1 { color: #fff; font-size: 22px; font-weight: 700; margin-bottom: 6px; }
    .header p { color: #bbf7d0; font-size: 14px; }
    .badge { display: inline-block; background: #fbbf24; color: #78350f; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-top: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .body { padding: 28px 24px; }
    .greeting { font-size: 17px; color: #111; margin-bottom: 20px; }
    .info-block { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
    .info-block .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    .info-block .row:last-child { border-bottom: none; }
    .info-block .row .label { color: #6b7280; }
    .info-block .row .value { color: #111; font-weight: 600; text-align: right; max-width: 60%; }
    .price-block { background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px; }
    .price-block .total { font-size: 28px; font-weight: 800; color: #16a34a; }
    .price-block .sublabel { font-size: 13px; color: #4b5563; margin-top: 4px; }
    .earlybird { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #92400e; margin-bottom: 20px; text-align: center; }
    .qr-block { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px; }
    .qr-block h3 { font-size: 15px; color: #111; margin-bottom: 8px; }
    .qr-code { font-family: 'Courier New', monospace; font-size: 13px; color: #374151; background: #fff; border: 1px dashed #d1d5db; border-radius: 8px; padding: 12px; display: inline-block; word-break: break-all; }
    .instructions { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
    .instructions h4 { font-size: 14px; color: #1d4ed8; margin-bottom: 10px; }
    .instructions ul { padding-left: 18px; }
    .instructions li { font-size: 13px; color: #1e40af; margin-bottom: 6px; line-height: 1.5; }
    .footer { padding: 20px 24px; background: #f9fafb; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .footer a { color: #16a34a; text-decoration: none; }
    @media (max-width: 480px) {
      .info-block .row { flex-direction: column; gap: 2px; }
      .info-block .row .value { text-align: left; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>Tus entradas estan listas</h1>
        <p>${p.matchOpponent}</p>
        ${p.isEarlyBird ? '<span class="badge">Precio Anticipado</span>' : ""}
      </div>

      <div class="body">
        <p class="greeting">Hola <strong>${p.buyerName}</strong>, tu pago fue confirmado.</p>

        <div class="info-block">
          <div class="row">
            <span class="label">Partido</span>
            <span class="value">${p.matchOpponent}</span>
          </div>
          <div class="row">
            <span class="label">Instancia</span>
            <span class="value">${p.matchRound}</span>
          </div>
          <div class="row">
            <span class="label">Fecha</span>
            <span class="value">${p.matchDate}</span>
          </div>
          <div class="row">
            <span class="label">Hora</span>
            <span class="value">${p.matchTime}</span>
          </div>
          <div class="row">
            <span class="label">Estadio</span>
            <span class="value">${p.matchVenue}</span>
          </div>
          <div class="row">
            <span class="label">Orden</span>
            <span class="value">${p.orderNumber}</span>
          </div>
          <div class="row">
            <span class="label">Cantidad</span>
            <span class="value">${p.quantity} entrada${p.quantity > 1 ? "s" : ""}</span>
          </div>
        </div>

        <div class="price-block">
          <div class="total">${formatPrice(p.totalAmount)}</div>
          <div class="sublabel">${p.quantity} x ${formatPrice(p.unitPrice)}</div>
        </div>

        ${
          p.isEarlyBird
            ? `<div class="earlybird">Compraste con descuento anticipado</div>`
            : ""
        }

        <div class="qr-block">
          <h3>Tu codigo QR de acceso</h3>
          <p style="font-size:13px; color:#6b7280; margin-bottom: 12px;">Presenta este codigo en la entrada del estadio</p>
          <div class="qr-code">${p.qrCode}</div>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 8px;">Orden: ${p.orderNumber}</p>
        </div>

        <div class="instructions">
          <h4>Instrucciones importantes</h4>
          <ul>
            <li>Guarda este email, lo vas a necesitar en la entrada</li>
            <li>Podes mostrar el codigo QR desde el celular o impreso</li>
            <li>Cada entrada tiene un QR unico e intransferible</li>
            <li>Llega con tiempo suficiente al estadio</li>
          </ul>
        </div>
      </div>

      <div class="footer">
        <p>Consultas: <a href="mailto:${process.env.GMAIL_USER}">${process.env.GMAIL_USER}</a></p>
        <p style="margin-top: 8px;">Este es un email automatico, por favor no respondas directamente.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// --- Texto plano ---
function generateEmailText(p: {
  buyerName: string;
  matchOpponent: string;
  matchDate: string;
  matchTime: string;
  matchVenue: string;
  orderNumber: string;
  quantity: number;
  totalAmount: number;
  qrCode: string;
}) {
  return `
Hola ${p.buyerName}!

Tu pago fue confirmado. Aqui estan los detalles de tus entradas:

PARTIDO: ${p.matchOpponent}
FECHA: ${p.matchDate}
HORA: ${p.matchTime}
ESTADIO: ${p.matchVenue}
ORDEN: ${p.orderNumber}
CANTIDAD: ${p.quantity} entrada(s)
TOTAL: ${formatPrice(p.totalAmount)}

CODIGO QR DE ACCESO:
${p.qrCode}

Presenta este codigo en la entrada del estadio (desde el celular o impreso).

Instrucciones:
- Guarda este email
- El QR es unico e intransferible
- Llega con tiempo al estadio

Consultas: ${process.env.GMAIL_USER}

---
Email automatico, no respondas directamente.
  `.trim();
}

export async function verifyEmailConfig(): Promise<boolean> {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("Gmail credenciales no configuradas");
      return false;
    }
    await transporter.verify();
    console.log("Gmail SMTP OK:", process.env.GMAIL_USER);
    return true;
  } catch (error) {
    console.error("Error verificando Gmail:", error);
    return false;
  }
}

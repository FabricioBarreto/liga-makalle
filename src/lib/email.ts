// src/lib/email.ts
import nodemailer from "nodemailer";
import QRCode from "qrcode";

export interface SendTicketEmailParams {
  to: string;
  buyerPhone: string;
  matchOpponent: string;
  matchDate: Date | string;
  matchVenue: string;
  matchRound: string;
  ticketId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  isEarlyBird: boolean;
  qrCode: string; // el cuid guardado en DB
}

export async function sendTicketEmail(
  p: SendTicketEmailParams,
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Generar imagen QR a partir del qrCode guardado en DB
    const qrImageBase64 = await QRCode.toDataURL(p.qrCode, { width: 280 });

    const formattedDate = new Date(p.matchDate).toLocaleString("es-AR", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="text-align: center; padding-bottom: 20px; border-bottom: 3px solid #16a34a;">
      <h1 style="color: #16a34a; margin: 0; font-size: 28px;">⚽ Entrada Confirmada</h1>
      <p style="color: #6b7280; margin: 6px 0 0;">Tu pago fue aprobado</p>
    </div>

    <!-- Detalles del partido -->
    <div style="background: linear-gradient(135deg, #15803d, #166534); border-radius: 10px; padding: 20px; margin: 24px 0; color: white;">
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
        <span>Partido</span>
        <strong>${p.matchOpponent}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
        <span>Fecha</span>
        <strong>${formattedDate}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
        <span>Lugar</span>
        <strong>${p.matchVenue}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
        <span>Fase</span>
        <strong>${p.matchRound}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
        <span>Cantidad</span>
        <strong>${p.quantity} entrada${p.quantity > 1 ? "s" : ""}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
        <span>Precio unitario</span>
        <strong>$${p.unitPrice.toLocaleString("es-AR")}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0;">
        <span>Total pagado</span>
        <strong style="font-size: 18px;">$${p.totalAmount.toLocaleString("es-AR")}</strong>
      </div>
    </div>

    ${
      p.isEarlyBird
        ? `
    <div style="background: #fef9c3; border-left: 4px solid #ca8a04; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
      ✅ <strong>Precio Early Bird aplicado</strong>
    </div>
    `
        : ""
    }

    <!-- QR -->
    <div style="text-align: center; margin: 24px 0; padding: 24px; background: #f9fafb; border-radius: 10px; border: 2px dashed #16a34a;">
      <p style="margin: 0 0 12px; font-weight: bold; color: #111827;">Mostrá este QR en el ingreso</p>
      <img src="${qrImageBase64}" alt="QR de entrada" width="220" height="220" style="display: block; margin: 0 auto;" />
      <p style="margin: 12px 0 0; font-size: 11px; color: #9ca3af; word-break: break-all;">${p.qrCode}</p>
    </div>

    <!-- Instrucciones -->
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 6px; margin-bottom: 24px;">
      <strong>Instrucciones importantes:</strong>
      <ul style="margin: 8px 0 0; padding-left: 20px; color: #374151;">
        <li>Guardá este email antes del partido</li>
        <li>Podés mostrar el QR desde el celular o impreso</li>
        <li>Cada QR es único e intransferible</li>
        <li>Llegá con tiempo al estadio</li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
      <p style="margin: 0;">ID de ticket: ${p.ticketId}</p>
      <p style="margin: 4px 0 0;">Este es un email automático, no respondas directamente.</p>
    </div>

  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: {
        name: "Entradas Fútbol Makallé",
        address: process.env.GMAIL_USER || "",
      },
      to: p.to,
      subject: `⚽ Tu entrada para ${p.matchOpponent} está confirmada`,
      html,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error enviando email:", error);
    return { success: false, error: error.message };
  }
}

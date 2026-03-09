import type { DbClient } from "@/db/client";
import { tokensContrasenaTemporal } from "@/db/schemas";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { generarTokenTemporal } from "../libs/utils/jwt.tokenTemoral";

/**
 * Envía un email usando Resend (producción) o Nodemailer/Mailhog (desarrollo).
 */
async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ messageId?: string }> {
  const from = process.env.SMTP_FROM || "no-reply@sistema-municipal.cl";

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data } = await resend.emails.send({
      from: `Sistema Municipal <${from}>`,
      to,
      subject,
      html,
      text,
    });
    return { messageId: data?.id };
  }

  // Fallback: Nodemailer (Mailhog en dev)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: Number.parseInt(process.env.SMTP_PORT || "1025"),
    secure: false,
  });

  const info = await transporter.sendMail({ from: `"Sistema Municipal" <${from}>`, to, subject, html, text });
  return { messageId: info.messageId };
}

// Función para enviar email de bienvenida
export const sendWelcomeEmail = async (
  db: DbClient,
  email: string,
  nombre: string,
  usuarioId: number,
  passwordTemporal?: string,
) => {
  try {
    const token = generarTokenTemporal(email);

    const expiraEn = new Date(Date.now() + 15 * 60 * 1000);
    await db.insert(tokensContrasenaTemporal).values({
      token,
      usuarioId: usuarioId,
      expiraEn,
    });

    const appUrl = process.env.APP_URL || "http://localhost:5030";
    const link = `${appUrl}/contrasena-temporal?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Bienvenido, ${nombre}!</h2>
        <p style="font-size: 16px;">Tu cuenta ha sido creada exitosamente.</p>
        ${
          passwordTemporal
            ? `<p style="font-size: 16px;">Tu contraseña temporal es: <strong>${passwordTemporal}</strong></p>
           <p style="font-size: 16px;"><b>Se te pedirá que la cambies al iniciar sesión.</b></p>`
            : ""
        }
        <p><a href="${link}" style="color: #1a73e8;">${link}</a></p>
        <p style="font-size: 16px;">Este enlace estará activo por 15 minutos.</p>
        <hr />
        <p style="font-size: 16px;">Ya puedes comenzar a usar nuestra plataforma.</p>
        <p style="font-size: 16px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Este es un email automático, por favor no respondas a este mensaje.
        </p>
      </div>
    `;

    const result = await sendEmail({
      to: email,
      subject: "¡Bienvenido! Tu cuenta ha sido creada exitosamente",
      html,
      text: `¡Bienvenido, ${nombre}! Tu cuenta ha sido creada exitosamente. Ya puedes comenzar a usar nuestra plataforma.`,
    });

    console.log("Email enviado:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error al enviar email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
};

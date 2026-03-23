import { createLogger } from "@municipal/core/logger";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const logger = createLogger("email.service");

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Envía un email usando Resend (producción) o Nodemailer/Mailhog (desarrollo).
 * Patrón idéntico al de api-identidad para mantener consistencia.
 */
async function sendEmail(
  params: SendEmailParams,
): Promise<{ messageId?: string }> {
  const { to, subject, html, text } = params;
  const from = process.env.SMTP_FROM ?? "no-reply@sistema-municipal.cl";

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
    host: process.env.SMTP_HOST ?? "localhost",
    port: Number.parseInt(process.env.SMTP_PORT ?? "1025"),
    secure: false,
  });

  const info = await transporter.sendMail({
    from: `"Sistema Municipal" <${from}>`,
    to,
    subject,
    html,
    text,
  });
  return { messageId: info.messageId };
}

export interface WelcomeAdminEmailParams {
  /** Email del administrador recién creado */
  adminEmail: string;
  /** Nombre completo del administrador */
  adminNombre: string;
  /** Nombre de la municipalidad */
  nombreMunicipalidad: string;
}

/**
 * Envía el email de bienvenida al administrador inicial de un tenant recién creado.
 * La contraseña temporal NO se incluye en el email: el usuario la establece
 * al iniciar sesión por primera vez mediante el flujo de contraseña temporal.
 */
export async function sendTenantWelcomeEmail(
  params: WelcomeAdminEmailParams,
): Promise<void> {
  const { adminEmail, adminNombre, nombreMunicipalidad } = params;

  const appUrl = process.env.APP_URL ?? "http://localhost:5030";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Bienvenido al Sistema Municipal</h2>
      <p style="font-size: 16px;">
        Hola <strong>${adminNombre}</strong>, tu cuenta de administrador para la municipalidad
        <strong>${nombreMunicipalidad}</strong> ha sido creada exitosamente.
      </p>
      <p style="font-size: 16px;">
        Tu cuenta ha sido creada. Se te pedirá establecer tu contraseña al iniciar sesión por primera vez.
      </p>
      <p style="font-size: 16px;">
        Puedes acceder al sistema en:
        <a href="${appUrl}" style="color: #1a73e8;">${appUrl}</a>
      </p>
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        Este es un email automático, por favor no respondas a este mensaje.
      </p>
    </div>
  `;

  const text = [
    `Bienvenido al Sistema Municipal, ${adminNombre}.`,
    `Tu cuenta de administrador para la municipalidad "${nombreMunicipalidad}" ha sido creada.`,
    "Tu cuenta ha sido creada. Se te pedirá establecer tu contraseña al iniciar sesión por primera vez.",
    `Accede en: ${appUrl}`,
  ].join("\n");

  try {
    const result = await sendEmail({
      to: adminEmail,
      subject: `Bienvenido a Sistema Municipal — ${nombreMunicipalidad}`,
      html,
      text,
    });
    logger.info(
      { messageId: result.messageId, to: adminEmail },
      "Email de bienvenida enviado",
    );
  } catch (err) {
    // El fallo de email no debe abortar el provisioning — se loguea y se continúa
    logger.error(
      { err, to: adminEmail },
      "Error al enviar email de bienvenida (no crítico)",
    );
  }
}

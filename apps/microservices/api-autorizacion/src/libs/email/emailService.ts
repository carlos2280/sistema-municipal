import nodemailer from "nodemailer";
import { Resend } from "resend";
import { loadEnv } from "@/config/env";

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
}): Promise<void> {
  const env = loadEnv();

  if (env.RESEND_API_KEY) {
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from: `Sistema Municipal <${env.SMTP_FROM}>`,
      to,
      subject,
      html,
      text,
    });
    return;
  }

  // Fallback: Nodemailer (Mailhog en dev)
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
  });

  await transporter.sendMail({
    from: `"Sistema Municipal" <${env.SMTP_FROM}>`,
    to,
    subject,
    html,
    text,
  });
}

export async function enviarEmailEnrollmentMfa({
  email,
  nombreCompleto,
  setupToken,
}: {
  email: string;
  nombreCompleto: string;
  setupToken: string;
}): Promise<void> {
  const env = loadEnv();
  const enlace = `${env.APP_URL}/mfa-setup?token=${setupToken}`;

  await sendEmail({
    to: email,
    subject: "Configura tu autenticación de dos factores (MFA)",
    html: buildEnrollmentTemplate({ nombreCompleto, enlace }),
    text: `Hola ${nombreCompleto},\n\nDebes configurar la autenticación de dos factores para continuar usando el sistema.\n\nHaz clic en el siguiente enlace (válido por 10 minutos):\n${enlace}\n\nSi no solicitaste esto, ignora este mensaje.`,
  });
}

export async function enviarEmailMfaActivado({
  email,
  nombreCompleto,
}: {
  email: string;
  nombreCompleto: string;
}): Promise<void> {
  await sendEmail({
    to: email,
    subject: "Autenticación de dos factores activada",
    html: buildActivacionTemplate({ nombreCompleto }),
    text: `Hola ${nombreCompleto},\n\nLa autenticación de dos factores (MFA) ha sido activada correctamente en tu cuenta.\n\nSi no realizaste este cambio, contacta al administrador de inmediato.`,
  });
}

// ─── Templates HTML ─────────────────────────────────────────────────────────

function buildEnrollmentTemplate({
  nombreCompleto,
  enlace,
}: {
  nombreCompleto: string;
  enlace: string;
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1565c0;padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
              Sistema Municipal
            </p>
            <p style="margin:6px 0 0;font-size:13px;color:#90caf9;letter-spacing:1px;text-transform:uppercase;">
              Seguridad de la cuenta
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 12px;font-size:18px;font-weight:600;color:#1a1a2e;">
              Hola, ${nombreCompleto}
            </p>
            <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6;">
              Tu municipalidad ha habilitado la <strong>autenticación de dos factores (MFA)</strong>
              como medida de seguridad obligatoria.
            </p>
            <p style="margin:0 0 28px;font-size:14px;color:#555;line-height:1.6;">
              Para continuar usando el sistema, debes vincular una aplicación autenticadora
              (Google Authenticator, Authy u otra compatible con TOTP) a tu cuenta.
            </p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="center" style="padding:0 0 28px;">
                  <a href="${enlace}"
                     style="display:inline-block;background:#1565c0;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.3px;">
                    Configurar autenticador
                  </a>
                </td>
              </tr>
            </table>

            <!-- Warning box -->
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="background:#fff8e1;border-left:4px solid #f9a825;border-radius:4px;padding:14px 16px;">
                  <p style="margin:0;font-size:13px;color:#795548;line-height:1.5;">
                    <strong>Importante:</strong> Este enlace es <strong>válido por 10 minutos</strong>
                    y es de uso único. Si expira, intenta iniciar sesión nuevamente y recibirás
                    un nuevo enlace.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:24px 0 0;font-size:12px;color:#aaa;line-height:1.6;">
              Si no intentaste ingresar al sistema, puedes ignorar este mensaje con seguridad.
              Nadie accedió a tu cuenta.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#999;">
              Este es un mensaje automático. No respondas a este correo.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildActivacionTemplate({
  nombreCompleto,
}: {
  nombreCompleto: string;
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#2e7d32;padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">Sistema Municipal</p>
            <p style="margin:6px 0 0;font-size:13px;color:#a5d6a7;letter-spacing:1px;text-transform:uppercase;">MFA Activado</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 12px;font-size:18px;font-weight:600;color:#1a1a2e;">Hola, ${nombreCompleto}</p>
            <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6;">
              La autenticación de dos factores (MFA) ha sido <strong>activada correctamente</strong> en tu cuenta.
              A partir de ahora, cada vez que inicies sesión deberás ingresar el código de tu aplicación autenticadora.
            </p>
            <table cellpadding="0" cellspacing="0" width="100%"><tr>
              <td style="background:#fce4ec;border-left:4px solid #c62828;border-radius:4px;padding:14px 16px;">
                <p style="margin:0;font-size:13px;color:#b71c1c;line-height:1.5;">
                  <strong>¿No fuiste tú?</strong> Si no realizaste esta configuración, contacta al administrador del sistema de inmediato.
                </p>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#999;">Este es un mensaje automático. No respondas a este correo.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

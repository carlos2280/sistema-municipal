import { db } from "@/app";
import { tokensContrasenaTemporal } from "@/db/schemas";
import nodemailer from "nodemailer";
import { generarTokenTemporal } from "../libs/utils/jwt.tokenTemoral";
// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: "cfuentesfuentes@gmail.com", // Tu dirección de correo electrónico
    pass: "dbdq ehfj ywfn viuw", // Tu contraseña o token de aplicación
  },
});

// Función para enviar email de bienvenida
export const sendWelcomeEmail = async (
  email: string,
  nombre: string,
  usuarioId: number,
  passwordTemporal?: string,
) => {
  try {
    const token = generarTokenTemporal(email);

    // Calcular expiración exacta
    const expiraEn = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    // Guardar el token en DB
    await db.insert(tokensContrasenaTemporal).values({
      token,
      usuarioId: usuarioId,
      expiraEn,
    });

    const link = `http://localhost:5173/contrasena-temporal?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "¡Bienvenido! Tu cuenta ha sido creada exitosamente",
      html: `
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
      `,
      text: `¡Bienvenido, ${nombre}! Tu cuenta ha sido creada exitosamente. Ya puedes comenzar a usar nuestra plataforma.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error al enviar email:", error);
    // No lanzamos el error para que no falle la creación del usuario
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
};

import nodemailer from 'nodemailer';

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verificar configuración del transporter (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  transporter.verify((error, success) => {
    if (error) {
      console.error('Error en configuración de email:', error);
    } else {
      console.log('Servidor de email listo para enviar mensajes');
    }
  });
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envía un email usando Nodemailer
 */
export async function enviarEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@tsjchihuahua.gob.mx',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback a texto plano
    });

    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar email:', error);
    return { success: false, error };
  }
}

/**
 * Envía email de invitación al Cónyuge 2
 */
export async function enviarInvitacionEmail(
  emailDestino: string,
  nombreSolicitante: string,
  token: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const invitacionUrl = `${appUrl}/invitacion/aceptar?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitación a Trámite de Divorcio</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
          <td style="padding: 40px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background-color: #B91C1C; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                    Portal Ciudadano
                  </h1>
                  <p style="margin: 10px 0 0; color: #FEE2E2; font-size: 14px;">
                    Tribunal Superior de Justicia del Estado de Chihuahua
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; color: #1F2937; font-size: 20px;">
                    Has sido invitado a un trámite de divorcio
                  </h2>

                  <p style="margin: 0 0 20px; color: #4B5563; font-size: 16px; line-height: 1.5;">
                    <strong>${nombreSolicitante}</strong> te ha invitado a participar en un trámite de divorcio voluntario.
                  </p>

                  <p style="margin: 0 0 20px; color: #4B5563; font-size: 16px; line-height: 1.5;">
                    Para continuar con el proceso, necesitas:
                  </p>

                  <ol style="margin: 0 0 30px; color: #4B5563; font-size: 16px; line-height: 1.8; padding-left: 20px;">
                    <li>Aceptar esta invitación</li>
                    <li>Crear una cuenta o iniciar sesión en el Portal Ciudadano</li>
                    <li>Completar tus datos personales en el formulario</li>
                  </ol>

                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center; padding: 20px 0;">
                        <a href="${invitacionUrl}" style="display: inline-block; padding: 14px 32px; background-color: #B91C1C; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                          Aceptar Invitación
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 20px 0 0; color: #6B7280; font-size: 14px; line-height: 1.5;">
                    O copia y pega este enlace en tu navegador:
                  </p>
                  <p style="margin: 5px 0 0; color: #3B82F6; font-size: 14px; word-break: break-all;">
                    ${invitacionUrl}
                  </p>

                  <div style="margin-top: 30px; padding: 20px; background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 4px;">
                    <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.5;">
                      <strong>Importante:</strong> Esta invitación expirará en 7 días. Si no puedes acceder al enlace, contacta a ${nombreSolicitante}.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #F9FAFB; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; color: #6B7280; font-size: 12px; line-height: 1.5; text-align: center;">
                    Este es un correo automático del Portal Ciudadano del Tribunal Superior de Justicia del Estado de Chihuahua.
                    <br>
                    Por favor, no respondas a este correo.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return enviarEmail({
    to: emailDestino,
    subject: `${nombreSolicitante} te ha invitado a un trámite de divorcio`,
    html,
  });
}

/**
 * Envía email de confirmación al completar datos personales
 */
export async function enviarConfirmacionDatosEmail(
  emailDestino: string,
  nombreConyuge: string,
  tramiteId: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const tramiteUrl = `${appUrl}/tramites/divorcio/${tramiteId}`;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Datos Personales Completados</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
          <td style="padding: 40px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px;">
              <tr>
                <td style="padding: 40px; text-align: center;">
                  <h1 style="color: #B91C1C; margin-bottom: 20px;">Portal Ciudadano</h1>
                  <h2 style="color: #1F2937; margin-bottom: 20px;">Datos Personales Completados</h2>
                  <p style="color: #4B5563; font-size: 16px; line-height: 1.5;">
                    <strong>${nombreConyuge}</strong> ha completado sus datos personales en el trámite de divorcio.
                  </p>
                  <p style="color: #4B5563; font-size: 16px; margin-top: 20px;">
                    Ahora pueden continuar juntos con el resto del formulario.
                  </p>
                  <a href="${tramiteUrl}" style="display: inline-block; margin-top: 30px; padding: 14px 32px; background-color: #B91C1C; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Continuar con el Trámite
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return enviarEmail({
    to: emailDestino,
    subject: 'Datos personales completados - Trámite de divorcio',
    html,
  });
}

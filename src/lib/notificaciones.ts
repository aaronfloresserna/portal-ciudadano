import { prisma } from './db';

export type TipoNotificacion = 'INVITACION' | 'PROGRESO' | 'COMPLETADO' | 'SISTEMA';

/**
 * Crea una notificación genérica
 */
export async function crearNotificacion(
  usuarioId: string,
  tipo: TipoNotificacion,
  titulo: string,
  mensaje: string,
  tramiteId?: string
) {
  try {
    const notificacion = await prisma.notificacion.create({
      data: {
        usuarioId,
        tipo,
        titulo,
        mensaje,
        tramiteId,
      },
    });

    return notificacion;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
}

/**
 * Notifica al usuario que ha recibido una invitación
 */
export async function notificarInvitacionRecibida(
  usuarioIdInvitado: string,
  nombreSolicitante: string,
  tramiteId: string
) {
  return crearNotificacion(
    usuarioIdInvitado,
    'INVITACION',
    'Nueva invitación a trámite',
    `${nombreSolicitante} te ha invitado a participar en un trámite de divorcio voluntario.`,
    tramiteId
  );
}

/**
 * Notifica al solicitante que su invitación fue aceptada
 */
export async function notificarInvitacionAceptada(
  usuarioIdSolicitante: string,
  nombreInvitado: string,
  tramiteId: string
) {
  return crearNotificacion(
    usuarioIdSolicitante,
    'PROGRESO',
    'Invitación aceptada',
    `${nombreInvitado} ha aceptado tu invitación y puede comenzar a completar sus datos personales.`,
    tramiteId
  );
}

/**
 * Notifica que el cónyuge completó sus datos personales
 */
export async function notificarConyugeCompletoSusDatos(
  usuarioIdReceptor: string,
  nombreConyuge: string,
  tramiteId: string
) {
  return crearNotificacion(
    usuarioIdReceptor,
    'PROGRESO',
    'Datos personales completados',
    `${nombreConyuge} ha completado sus datos personales. Ahora pueden continuar juntos con el resto del trámite.`,
    tramiteId
  );
}

/**
 * Notifica que el trámite está completado
 */
export async function notificarTramiteCompletado(
  usuarioId: string,
  tramiteId: string
) {
  return crearNotificacion(
    usuarioId,
    'COMPLETADO',
    'Trámite completado',
    'El trámite de divorcio ha sido completado. Ya puedes generar el convenio y descargarlo.',
    tramiteId
  );
}

/**
 * Notifica sobre un cambio en el trámite
 */
export async function notificarCambioEnTramite(
  usuarioId: string,
  mensaje: string,
  tramiteId: string
) {
  return crearNotificacion(
    usuarioId,
    'PROGRESO',
    'Actualización en tu trámite',
    mensaje,
    tramiteId
  );
}

/**
 * Marca todas las notificaciones de un usuario como leídas
 */
export async function marcarTodasComoLeidas(usuarioId: string) {
  try {
    await prisma.notificacion.updateMany({
      where: {
        usuarioId,
        leida: false,
      },
      data: {
        leida: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error al marcar notificaciones como leídas:', error);
    throw error;
  }
}

/**
 * Obtiene el conteo de notificaciones no leídas
 */
export async function contarNoLeidas(usuarioId: string) {
  try {
    const count = await prisma.notificacion.count({
      where: {
        usuarioId,
        leida: false,
      },
    });

    return count;
  } catch (error) {
    console.error('Error al contar notificaciones no leídas:', error);
    throw error;
  }
}

/**
 * Obtiene las notificaciones recientes de un usuario
 */
export async function obtenerNotificaciones(
  usuarioId: string,
  limit: number = 20,
  offset: number = 0
) {
  try {
    const notificaciones = await prisma.notificacion.findMany({
      where: {
        usuarioId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        tramite: {
          select: {
            id: true,
            tipo: true,
            estado: true,
          },
        },
      },
    });

    return notificaciones;
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    throw error;
  }
}

/**
 * Elimina notificaciones antiguas (más de 30 días)
 */
export async function limpiarNotificacionesAntiguas() {
  try {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);

    const result = await prisma.notificacion.deleteMany({
      where: {
        createdAt: {
          lt: fechaLimite,
        },
        leida: true,
      },
    });

    console.log(`Notificaciones eliminadas: ${result.count}`);
    return result;
  } catch (error) {
    console.error('Error al limpiar notificaciones antiguas:', error);
    throw error;
  }
}

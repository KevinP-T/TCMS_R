export const ESTADOS_CASO = {
  PENDIENTE: 'pendiente',
  PASADO: 'pasado',
  FALLIDO: 'fallido',
  BLOQUEADO: 'bloqueado',
  NO_EJECUTADO: 'no_ejecutado',
};

export const ESTADOS_BUG = {
  ABIERTO: 'abierto',
  EN_PROGRESO: 'en_progreso',
  PENDIENTE_REVISION: 'pendiente_revision',
  RESUELTO: 'resuelto',
  CERRADO: 'cerrado',
  RECHAZADO: 'rechazado',
};

export const PRIORIDADES = ['alta', 'media', 'baja'];

export const SEVERIDADES = ['critica', 'alta', 'media', 'baja'];

export const TIPOS_CASO = ['positivo', 'negativo', 'borde'];

export const ROLES = { TESTER: 'tester', DESARROLLADOR: 'desarrollador' };

export const PERMISOS = {
  tester: ['crear', 'editar', 'eliminar', 'cambiar_estado'],
  desarrollador: ['ver', 'cambiar_estado_pendiente'],
};

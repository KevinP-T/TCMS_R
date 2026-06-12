const { z } = require('zod');

const bugSchema = z.object({
  ciclo_id: z.string().uuid().nullable().optional(),
  test_case_id: z.string().uuid().nullable().optional(),
  id_sistema: z.string().optional().nullable(),
  id_cu: z.string().optional().nullable(),
  id_cp: z.string().optional().nullable(),
  id_paso: z.string().optional().nullable(),
  titulo: z.string().min(1, "El título es requerido"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  estado: z.enum(['abierto', 'en_progreso', 'pendiente_revision', 'resuelto', 'cerrado', 'rechazado']).default('abierto'),
  prioridad: z.enum(['alta', 'media', 'baja']),
  severidad: z.enum(['critica', 'alta', 'media', 'baja']),
  desarrollador_id: z.string().uuid().nullable().optional(),
  area_asignada: z.string().optional().nullable(),
  descripcion_resolucion: z.string().optional().nullable(),
  fecha_est_entrega: z.string().optional().nullable(),
  fecha_real_entrega: z.string().optional().nullable(),
  fecha_cierre: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
});

const estadoBugSchema = z.object({
  estado: z.enum(['abierto', 'en_progreso', 'pendiente_revision', 'resuelto', 'cerrado', 'rechazado'])
});

module.exports = {
  bugSchema,
  estadoBugSchema
};

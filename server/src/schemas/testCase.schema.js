const { z } = require('zod');

const testCaseSchema = z.object({
  ciclo_id: z.string().uuid().nullable().optional(),
  id_cu: z.string().optional().nullable(),
  descripcion: z.string().min(1, "La descripción es requerida"),
  datos: z.string().optional().nullable(),
  precondiciones: z.array(z.string()).optional().nullable(),
  prioridad: z.enum(['alta', 'media', 'baja']),
  tipo_caso: z.enum(['positivo', 'negativo', 'borde']),
  pasos: z.array(z.string()).optional().nullable(),
  resultados_esperados: z.array(z.string()).optional().nullable(),
  resultados_obtenidos: z.array(z.string()).optional().nullable(),
  post_condicion: z.string().optional().nullable(),
  estado: z.enum(['pendiente', 'pasado', 'fallido', 'bloqueado', 'no_ejecutado']).default('pendiente'),
  fecha_ejecucion: z.string().optional().nullable(),
});

const estadoTestCaseSchema = z.object({
  estado: z.enum(['pendiente', 'pasado', 'fallido', 'bloqueado', 'no_ejecutado'])
});

module.exports = {
  testCaseSchema,
  estadoTestCaseSchema
};

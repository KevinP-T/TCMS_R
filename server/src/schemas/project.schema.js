const { z } = require('zod');

const projectSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  sistema: z.string().min(1, "El sistema es requerido"),
  version: z.string().min(1, "La versión es requerida"),
  descripcion: z.string().optional(),
  estado: z.enum(['activo', 'pausado', 'cerrado']).default('activo'),
});

const cicloSchema = z.object({
  nombre: z.string().min(1, "El nombre del ciclo es requerido"),
});

module.exports = {
  projectSchema,
  cicloSchema
};

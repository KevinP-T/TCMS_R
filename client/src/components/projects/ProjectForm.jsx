import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '../../store';

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  sistema: z.string().min(1, 'El sistema es requerido'),
  version: z.string().min(1, 'La versión es requerida'),
  descripcion: z.string().optional(),
  estado: z.enum(['activo', 'pausado', 'cerrado']).default('activo'),
});

const ProjectForm = ({ open, onClose, projectToEdit }) => {
  const createProject = useStore(state => state.createProject);
  const updateProject = useStore(state => state.updateProject);
  const usuario = useStore(state => state.usuario);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '', sistema: '', version: '', descripcion: '', estado: 'activo'
    }
  });

  useEffect(() => {
    if (projectToEdit) {
      reset(projectToEdit);
    } else {
      reset({ nombre: '', sistema: '', version: '', descripcion: '', estado: 'activo' });
    }
  }, [projectToEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (projectToEdit) {
        await updateProject(projectToEdit.id, data);
      } else {
        await createProject({ ...data, creado_por: usuario.id });
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{projectToEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            fullWidth
            {...register('nombre')}
            error={!!errors.nombre}
            helperText={errors.nombre?.message}
          />
          <TextField
            margin="dense"
            label="Sistema API"
            fullWidth
            {...register('sistema')}
            error={!!errors.sistema}
            helperText={errors.sistema?.message}
          />
          <TextField
            margin="dense"
            label="Versión"
            fullWidth
            {...register('version')}
            error={!!errors.version}
            helperText={errors.version?.message}
          />
          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            {...register('descripcion')}
          />
          <TextField
            select
            margin="dense"
            label="Estado"
            fullWidth
            defaultValue={projectToEdit ? projectToEdit.estado : 'activo'}
            {...register('estado')}
          >
            <MenuItem value="activo">Activo</MenuItem>
            <MenuItem value="pausado">Pausado</MenuItem>
            <MenuItem value="cerrado">Cerrado</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">Guardar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProjectForm;

import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '../../store';

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  rol: z.enum(['tester', 'desarrollador']),
});

const UserForm = ({ open, onClose, userToEdit }) => {
  const { createUser, updateUser } = useStore();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '', rol: 'desarrollador'
    }
  });

  useEffect(() => {
    if (userToEdit) {
      reset({ nombre: userToEdit.nombre, rol: userToEdit.rol });
    } else {
      reset({ nombre: '', rol: 'desarrollador' });
    }
  }, [userToEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (userToEdit) {
        await updateUser(userToEdit.id, data);
      } else {
        await createUser(data);
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre Completo"
            fullWidth
            {...register('nombre')}
            error={!!errors.nombre}
            helperText={errors.nombre?.message}
          />
          <TextField
            select
            margin="dense"
            label="Rol"
            fullWidth
            defaultValue={userToEdit ? userToEdit.rol : 'desarrollador'}
            {...register('rol')}
            error={!!errors.rol}
            helperText={errors.rol?.message}
          >
            <MenuItem value="tester">Tester</MenuItem>
            <MenuItem value="desarrollador">Desarrollador</MenuItem>
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

export default UserForm;

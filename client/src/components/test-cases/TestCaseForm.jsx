import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid, IconButton, Box, Typography } from '@mui/material';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '../../store';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const schema = z.object({
  id_cu: z.string().optional(),
  ciclo_id: z.string().optional(),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  datos: z.string().optional(),
  prioridad: z.enum(['alta', 'media', 'baja']),
  tipo_caso: z.enum(['positivo', 'negativo', 'borde']),
  post_condicion: z.string().optional(),
  
  precondiciones: z.array(z.object({ value: z.string() })).optional(),
  pasos: z.array(z.object({ value: z.string() })).optional(),
  resultados_esperados: z.array(z.object({ value: z.string() })).optional(),
});

const ArrayField = ({ control, register, name, label }) => {
  const { fields, append, remove } = useFieldArray({ control, name });
  
  return (
    <Box mb={2} mt={2}>
      <Typography variant="subtitle2" gutterBottom>{label}</Typography>
      {fields.map((field, index) => (
        <Box display="flex" gap={1} mb={1} key={field.id}>
          <TextField
            size="small"
            fullWidth
            {...register(`${name}.${index}.value`)}
          />
          <IconButton color="error" onClick={() => remove(index)} size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      <Button startIcon={<AddCircleIcon />} size="small" onClick={() => append({ value: '' })}>
        Agregar {label}
      </Button>
    </Box>
  );
};

const TestCaseForm = ({ open, onClose, projectId, tcToEdit }) => {
  const { createTestCase, updateTestCase, usuario, ciclos, fetchCiclos } = useStore();

  const { register, control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id_cu: '', ciclo_id: '', descripcion: '', datos: '',
      prioridad: 'media', tipo_caso: 'positivo', post_condicion: '',
      precondiciones: [], pasos: [], resultados_esperados: []
    }
  });

  useEffect(() => {
    fetchCiclos(projectId);
    if (tcToEdit) {
      reset({
        ...tcToEdit,
        ciclo_id: tcToEdit.ciclo_id || '',
        precondiciones: tcToEdit.precondiciones?.map(p => ({ value: p })) || [],
        pasos: tcToEdit.pasos?.map(p => ({ value: p })) || [],
        resultados_esperados: tcToEdit.resultados_esperados?.map(p => ({ value: p })) || [],
      });
    }
  }, [tcToEdit, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        ciclo_id: data.ciclo_id === '' ? null : data.ciclo_id,
        id_cu: data.id_cu === '' ? null : data.id_cu,
        precondiciones: data.precondiciones?.map(p => p.value).filter(Boolean),
        pasos: data.pasos?.map(p => p.value).filter(Boolean),
        resultados_esperados: data.resultados_esperados?.map(p => p.value).filter(Boolean),
        tester_id: usuario.id
      };

      if (tcToEdit) {
        await updateTestCase(projectId, tcToEdit.id, payload);
      } else {
        await createTestCase(projectId, payload);
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{tcToEdit ? 'Editar Caso de Prueba' : 'Nuevo Caso de Prueba'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="ID CU (Opcional)" {...register('id_cu')} size="small" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth label="Ciclo" defaultValue="" {...register('ciclo_id')} size="small">
                <MenuItem value="">Ninguno</MenuItem>
                {ciclos.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth label="Prioridad" defaultValue="media" {...register('prioridad')} size="small">
                <MenuItem value="alta">Alta</MenuItem>
                <MenuItem value="media">Media</MenuItem>
                <MenuItem value="baja">Baja</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="Descripción" {...register('descripcion')} 
                error={!!errors.descripcion} helperText={errors.descripcion?.message} size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Tipo" defaultValue="positivo" {...register('tipo_caso')} size="small">
                <MenuItem value="positivo">Positivo</MenuItem>
                <MenuItem value="negativo">Negativo</MenuItem>
                <MenuItem value="borde">Borde</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Datos (Variables/Mocks)" {...register('datos')} size="small" />
            </Grid>
          </Grid>
          
          <ArrayField control={control} register={register} name="precondiciones" label="Precondiciones" />
          <ArrayField control={control} register={register} name="pasos" label="Pasos" />
          <ArrayField control={control} register={register} name="resultados_esperados" label="Resultados Esperados" />
          
          <Box mt={2}>
            <TextField fullWidth label="Post condición" {...register('post_condicion')} size="small" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">Guardar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TestCaseForm;

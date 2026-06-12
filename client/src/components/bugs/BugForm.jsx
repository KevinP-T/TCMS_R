import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid, Typography, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '../../store';

const schema = z.object({
  titulo: z.string().min(1, 'El título es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  ciclo_id: z.string().optional(),
  id_sistema: z.string().optional(),
  id_cu: z.string().optional(),
  id_cp: z.string().optional(),
  id_paso: z.string().optional(),
  prioridad: z.enum(['alta', 'media', 'baja']),
  severidad: z.enum(['critica', 'alta', 'media', 'baja']),
});

const BugForm = ({ open, onClose, projectId, bugToEdit, initialTestCaseData = null }) => {
  const { createBug, updateBug, usuario, ciclos, fetchCiclos } = useStore();
  const [files, setFiles] = useState([]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: initialTestCaseData ? `Fallo en: ${initialTestCaseData.descripcion}` : '', 
      descripcion: initialTestCaseData ? 'Pasos para reproducir:\n1. \n\nResultado esperado:\n\nResultado obtenido:\n' : '', 
      ciclo_id: initialTestCaseData?.ciclo_id || '', 
      id_sistema: '', 
      id_cu: initialTestCaseData?.id_cu || '', 
      id_cp: initialTestCaseData?.id_cp || initialTestCaseData?.id || '', 
      id_paso: '',
      prioridad: 'media', severidad: 'media'
    }
  });

  useEffect(() => {
    fetchCiclos(projectId);
    if (bugToEdit) {
      reset({
        ...bugToEdit,
        ciclo_id: bugToEdit.ciclo_id || ''
      });
    }
  }, [bugToEdit, reset, projectId, fetchCiclos]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const onSubmit = async (data) => {
    try {
      if (bugToEdit) {
        // En edición completa (v1) no adjuntamos archivos por el mismo form, se hace aparte
        const payload = { ...data };
        if (payload.ciclo_id === '') payload.ciclo_id = null;
        await updateBug(projectId, bugToEdit.id, payload);
      } else {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
          if (data[key] !== '' && data[key] !== null) formData.append(key, data[key]);
        });
        formData.append('tester_id', usuario.id);
        if (initialTestCaseData) {
          formData.append('test_case_id', initialTestCaseData.id);
        }
        
        files.forEach(file => {
          formData.append('evidencias', file);
        });

        await createBug(projectId, formData);
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{bugToEdit ? 'Editar Bug' : 'Reportar Nuevo Bug'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="Título" {...register('titulo')} 
                error={!!errors.titulo} helperText={errors.titulo?.message} size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth label="Severidad" defaultValue="media" {...register('severidad')} size="small">
                <MenuItem value="critica">Crítica</MenuItem>
                <MenuItem value="alta">Alta</MenuItem>
                <MenuItem value="media">Media</MenuItem>
                <MenuItem value="baja">Baja</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth label="Prioridad" defaultValue="media" {...register('prioridad')} size="small">
                <MenuItem value="alta">Alta</MenuItem>
                <MenuItem value="media">Media</MenuItem>
                <MenuItem value="baja">Baja</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth label="Ciclo" defaultValue="" {...register('ciclo_id')} size="small">
                <MenuItem value="">Ninguno</MenuItem>
                {ciclos.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="Descripción (Pasos para reproducir, etc)" {...register('descripcion')} 
                multiline rows={4}
                error={!!errors.descripcion} helperText={errors.descripcion?.message}
              />
            </Grid>
            
            <Grid item xs={12}><Typography variant="subtitle2">Referencias Externas</Typography></Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="ID Sistema" {...register('id_sistema')} size="small" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="ID CU" {...register('id_cu')} size="small" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="ID CP (Texto)" {...register('id_cp')} size="small" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="ID Paso" {...register('id_paso')} size="small" />
            </Grid>

            {!bugToEdit && (
              <Grid item xs={12}>
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>Evidencias (Imágenes/Archivos)</Typography>
                  <input type="file" multiple onChange={handleFileChange} />
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">Guardar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BugForm;

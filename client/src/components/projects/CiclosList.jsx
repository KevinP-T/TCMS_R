import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, List, ListItem, ListItemText, IconButton, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useStore } from '../../store';
import { formatDate } from '../../utils/formatters';

const CiclosList = ({ projectId }) => {
  const { ciclos, fetchCiclos, createCiclo, deleteCiclo, usuario } = useStore();
  const [nuevoCiclo, setNuevoCiclo] = useState('');

  useEffect(() => {
    fetchCiclos(projectId);
  }, [projectId, fetchCiclos]);

  const handleCreate = async () => {
    if (!nuevoCiclo.trim()) return;
    await createCiclo(projectId, nuevoCiclo);
    setNuevoCiclo('');
  };

  const handleDelete = async (cicloId) => {
    if (window.confirm('¿Eliminar este ciclo? No se borrarán los casos ni bugs, pero perderán esta asociación.')) {
      await deleteCiclo(projectId, cicloId);
    }
  };

  return (
    <Box>
      {usuario?.rol === 'tester' && (
        <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField 
            size="small" 
            label="Nombre del nuevo ciclo" 
            value={nuevoCiclo} 
            onChange={e => setNuevoCiclo(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button variant="contained" onClick={handleCreate} disabled={!nuevoCiclo.trim()}>
            Crear Ciclo
          </Button>
        </Paper>
      )}

      <List>
        {ciclos.map(c => (
          <ListItem 
            key={c.id} 
            sx={{ border: '1px solid #e0e0e0', mb: 1, borderRadius: 1 }}
            secondaryAction={
              usuario?.rol === 'tester' && (
                <IconButton edge="end" color="error" onClick={() => handleDelete(c.id)}>
                  <DeleteIcon />
                </IconButton>
              )
            }
          >
            <ListItemText primary={c.nombre} secondary={`Creado: ${formatDate(c.creado_en)}`} />
          </ListItem>
        ))}
        {ciclos.length === 0 && (
          <Typography color="textSecondary">No hay ciclos registrados.</Typography>
        )}
      </List>
    </Box>
  );
};

export default CiclosList;

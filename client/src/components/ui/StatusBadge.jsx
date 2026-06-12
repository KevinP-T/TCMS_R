import React from 'react';
import { Chip } from '@mui/material';
import { ESTADOS_CASO, ESTADOS_BUG } from '../../utils/constants';

const statusConfig = {
  // Casos
  [ESTADOS_CASO.PENDIENTE]: { color: 'default', label: 'Pendiente' },
  [ESTADOS_CASO.PASADO]: { color: 'success', label: 'Pasado' },
  [ESTADOS_CASO.FALLIDO]: { color: 'error', label: 'Fallido' },
  [ESTADOS_CASO.BLOQUEADO]: { color: 'warning', label: 'Bloqueado' },
  [ESTADOS_CASO.NO_EJECUTADO]: { color: 'default', label: 'No Ejecutado' },
  // Bugs
  [ESTADOS_BUG.ABIERTO]: { color: 'error', label: 'Abierto' },
  [ESTADOS_BUG.EN_PROGRESO]: { color: 'info', label: 'En Progreso' },
  [ESTADOS_BUG.PENDIENTE_REVISION]: { color: 'warning', label: 'A Revisar' },
  [ESTADOS_BUG.RESUELTO]: { color: 'success', label: 'Resuelto' },
  [ESTADOS_BUG.CERRADO]: { color: 'default', label: 'Cerrado' },
  [ESTADOS_BUG.RECHAZADO]: { color: 'default', label: 'Rechazado' },
};

const StatusBadge = ({ status, size = 'small' }) => {
  const config = statusConfig[status] || { color: 'default', label: status };
  
  return (
    <Chip 
      label={config.label} 
      color={config.color} 
      size={size} 
      variant="outlined" 
      sx={{ fontWeight: 'bold' }}
    />
  );
};

export default StatusBadge;

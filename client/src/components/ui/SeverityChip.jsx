import React from 'react';
import { Chip } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const config = {
  critica: { color: 'error', icon: <ErrorOutlineIcon fontSize="small" /> },
  alta: { color: 'warning', icon: <WarningAmberIcon fontSize="small" /> },
  media: { color: 'info', icon: null },
  baja: { color: 'default', icon: null },
};

const SeverityChip = ({ severity }) => {
  const conf = config[severity] || { color: 'default', icon: null };
  return (
    <Chip
      icon={conf.icon}
      label={severity?.toUpperCase()}
      color={conf.color}
      size="small"
      variant="filled"
      sx={{ textTransform: 'capitalize' }}
    />
  );
};

export default SeverityChip;

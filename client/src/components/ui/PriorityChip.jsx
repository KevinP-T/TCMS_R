import React from 'react';
import { Chip } from '@mui/material';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const config = {
  alta: { color: 'error', icon: <KeyboardDoubleArrowUpIcon fontSize="small" /> },
  media: { color: 'warning', icon: <KeyboardArrowUpIcon fontSize="small" /> },
  baja: { color: 'info', icon: <KeyboardArrowDownIcon fontSize="small" /> },
};

const PriorityChip = ({ priority }) => {
  const conf = config[priority] || { color: 'default', icon: null };
  return (
    <Chip
      icon={conf.icon}
      label={priority?.toUpperCase()}
      color={conf.color}
      size="small"
      variant="filled"
      sx={{ textTransform: 'capitalize' }}
    />
  );
};

export default PriorityChip;

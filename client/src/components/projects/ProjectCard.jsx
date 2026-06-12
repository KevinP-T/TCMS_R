import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ minWidth: 275, cursor: 'pointer' }} onClick={() => navigate(`/proyectos/${project.id}`)}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="div" fontWeight="bold">
            {project.nombre}
          </Typography>
          <Chip label={project?.estado?.toUpperCase()} color={project?.estado === 'activo' ? 'success' : 'default'} size="small" />
        </Box>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          Sistema: {project.sistema} | Versión: {project.version}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {project.descripcion || 'Sin descripción'}
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          Creado por: {project.creador_nombre} el {formatDate(project.creado_en)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;

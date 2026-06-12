import React, { useEffect } from 'react';
import { Box, Typography, Button, Grid, CircularProgress } from '@mui/material';
import { useStore } from '../store';
import ProjectCard from '../components/projects/ProjectCard';
import AddIcon from '@mui/icons-material/Add';
import ProjectForm from '../components/projects/ProjectForm';

const ProjectsPage = () => {
  const { projects, loadingProjects, fetchProjects, usuario } = useStore();
  const [openForm, setOpenForm] = React.useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Proyectos</Typography>
        {usuario?.rol === 'tester' && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenForm(true)}>
            Nuevo Proyecto
          </Button>
        )}
      </Box>

      {loadingProjects ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {projects.map(project => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <ProjectCard project={project} />
            </Grid>
          ))}
          {projects.length === 0 && (
            <Grid item xs={12}>
              <Typography>No hay proyectos registrados.</Typography>
            </Grid>
          )}
        </Grid>
      )}

      {openForm && (
        <ProjectForm open={openForm} onClose={() => setOpenForm(false)} />
      )}
    </Box>
  );
};

export default ProjectsPage;

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Tabs, Tab, CircularProgress, Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import TestCaseTable from '../components/test-cases/TestCaseTable';
import TestCaseForm from '../components/test-cases/TestCaseForm';
import BugTable from '../components/bugs/BugTable';
import BugForm from '../components/bugs/BugForm';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ProjectForm from '../components/projects/ProjectForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import CiclosList from '../components/projects/CiclosList';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other} style={{ marginTop: 24 }}>
      {value === index && children}
    </div>
  );
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedProject, fetchProjectById, deleteProject, loadingProjects, usuario } = useStore();
  const [tabValue, setTabValue] = useState(0);
  const [openTcForm, setOpenTcForm] = useState(false);
  const [openBugForm, setOpenBugForm] = useState(false);
  const [openEditProject, setOpenEditProject] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const handleDeleteProject = async () => {
    await deleteProject(id);
    navigate('/proyectos');
  };

  useEffect(() => {
    fetchProjectById(id);
  }, [id, fetchProjectById]);

  if (loadingProjects || !selectedProject) return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/proyectos')} sx={{ mb: 2 }}>
        Volver
      </Button>
      
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h4" fontWeight="bold">{selectedProject.nombre}</Typography>
            <Chip label={selectedProject.estado?.toUpperCase()} color={selectedProject.estado === 'activo' ? 'success' : 'default'} />
          </Box>
        </Box>
        {usuario?.rol === 'tester' && (
          <Box display="flex" gap={1}>
            <Button variant="outlined" startIcon={<EditIcon />} size="small" onClick={() => setOpenEditProject(true)}>Editar</Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} size="small" onClick={() => setOpenDeleteConfirm(true)}>Eliminar</Button>
          </Box>
        )}
      </Box>
      <Typography variant="subtitle1" color="textSecondary" mb={4}>
        Sistema: {selectedProject.sistema} | Versión: {selectedProject.version}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`Casos de Prueba (${selectedProject?.summary?.casos?.total || 0})`} />
          <Tab label={`Bugs (${selectedProject?.summary?.bugs?.total || 0})`} />
          <Tab label="Ciclos" />
        </Tabs>
        {usuario?.rol === 'tester' && tabValue === 0 && (
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpenTcForm(true)}>
            Nuevo Caso
          </Button>
        )}
        {usuario?.rol === 'tester' && tabValue === 1 && (
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpenBugForm(true)}>
            Nuevo Bug
          </Button>
        )}
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TestCaseTable projectId={id} />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <BugTable projectId={id} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <CiclosList projectId={id} />
      </TabPanel>
      
      {openTcForm && <TestCaseForm open={openTcForm} onClose={() => { setOpenTcForm(false); fetchProjectById(id); }} projectId={id} />}
      {openBugForm && <BugForm open={openBugForm} onClose={() => { setOpenBugForm(false); fetchProjectById(id); }} projectId={id} />}
      {openEditProject && <ProjectForm open={openEditProject} onClose={() => { setOpenEditProject(false); fetchProjectById(id); }} projectToEdit={selectedProject} />}
      <ConfirmDialog 
        open={openDeleteConfirm} 
        title="Eliminar Proyecto" 
        content="¿Estás seguro de que deseas eliminar este proyecto? Se borrarán en cascada TODOS sus ciclos, casos de prueba y reportes de bug. Esta acción no se puede deshacer."
        onConfirm={handleDeleteProject}
        onCancel={() => setOpenDeleteConfirm(false)}
        confirmText="Eliminar permanentemente"
      />
    </Box>
  );
};

export default ProjectDetailPage;

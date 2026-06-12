import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Grid, Divider, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityChip from '../components/ui/PriorityChip';
import BugForm from '../components/bugs/BugForm';
import TestCaseForm from '../components/test-cases/TestCaseForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const TestCaseDetailPage = () => {
  const { id, caseId } = useParams();
  const navigate = useNavigate();
  const { selectedTestCase, fetchTestCaseById, deleteTestCase, loadingTestCases, usuario } = useStore();
  const [openBugForm, setOpenBugForm] = useState(false);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    await deleteTestCase(id, caseId);
    navigate(`/proyectos/${id}`);
  };

  useEffect(() => {
    fetchTestCaseById(id, caseId);
  }, [id, caseId, fetchTestCaseById]);

  if (loadingTestCases || !selectedTestCase) return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/proyectos/${id}`)} sx={{ mb: 2 }}>
        Volver al Proyecto
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              [{selectedTestCase.id_cp || selectedTestCase.id_cu || 'SIN ID'}] {selectedTestCase.descripcion}
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              <PriorityChip priority={selectedTestCase.prioridad} />
              <StatusBadge status={selectedTestCase.estado} />
            </Box>
          </Box>
          {usuario?.rol === 'tester' && (
            <Box display="flex" gap={1}>
              <Button variant="outlined" startIcon={<EditIcon />} size="small" onClick={() => setOpenEditForm(true)}>Editar</Button>
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} size="small" onClick={() => setOpenDeleteConfirm(true)}>Eliminar</Button>
            </Box>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="textSecondary">ID CU</Typography>
            <Typography variant="body1">{selectedTestCase.id_cu || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="textSecondary">Tipo</Typography>
            <Typography variant="body1">{selectedTestCase.tipo_caso.toUpperCase()}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="textSecondary">Tester</Typography>
            <Typography variant="body1">{selectedTestCase.tester_nombre}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">Datos (Variables/Mocks)</Typography>
            <Typography variant="body1">{selectedTestCase.datos || '-'}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Precondiciones</Typography>
            <List dense>
              {selectedTestCase.precondiciones?.map((p, i) => (
                <ListItem key={i}><ListItemText primary={`${i + 1}. ${p}`} /></ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Pasos</Typography>
            <List dense>
              {selectedTestCase.pasos?.map((p, i) => (
                <ListItem key={i}><ListItemText primary={`${i + 1}. ${p}`} /></ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Resultados Esperados</Typography>
            <List dense>
              {selectedTestCase.resultados_esperados?.map((p, i) => (
                <ListItem key={i}><ListItemText primary={`${i + 1}. ${p}`} /></ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Bugs Vinculados ({selectedTestCase.bugs_vinculados?.length || 0})</Typography>
          {usuario?.rol === 'tester' && (
            <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setOpenBugForm(true)}>
              Reportar Bug desde este caso
            </Button>
          )}
        </Box>
        
        <List>
          {selectedTestCase.bugs_vinculados?.map(bug => (
            <ListItem 
              key={bug.id} 
              button 
              onClick={() => navigate(`/proyectos/${id}/bugs/${bug.id}`)}
              sx={{ border: '1px solid #eee', mb: 1, borderRadius: 1 }}
            >
              <ListItemText 
                primary={bug.titulo} 
                secondary={`Estado: ${bug.estado} | Severidad: ${bug.severidad}`} 
              />
            </ListItem>
          ))}
          {(!selectedTestCase.bugs_vinculados || selectedTestCase.bugs_vinculados.length === 0) && (
            <Typography color="textSecondary">No hay bugs vinculados a este caso.</Typography>
          )}
        </List>
      </Paper>

      {openBugForm && (
        <BugForm 
          open={openBugForm} 
          onClose={() => { setOpenBugForm(false); fetchTestCaseById(id, caseId); }} 
          projectId={id} 
          initialTestCaseData={selectedTestCase}
        />
      )}
      {openEditForm && (
        <TestCaseForm 
          open={openEditForm} 
          onClose={() => { setOpenEditForm(false); fetchTestCaseById(id, caseId); }} 
          projectId={id} 
          tcToEdit={selectedTestCase} 
        />
      )}
      <ConfirmDialog 
        open={openDeleteConfirm} 
        title="Eliminar Caso de Prueba" 
        content="¿Estás seguro de que deseas eliminar este caso de prueba? Se desenlazarán los bugs asociados. Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setOpenDeleteConfirm(false)}
        confirmText="Eliminar permanentemente"
      />
    </Box>
  );
};

export default TestCaseDetailPage;

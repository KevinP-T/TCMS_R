import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Grid, Divider, List, ListItem, ListItemText, CircularProgress, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HistoryIcon from '@mui/icons-material/History';
import SendIcon from '@mui/icons-material/Send';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityChip from '../components/ui/PriorityChip';
import BugForm from '../components/bugs/BugForm';
import TestCaseForm from '../components/test-cases/TestCaseForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { formatDate } from '../utils/formatters';

const TestCaseDetailPage = () => {
  const { id, caseId } = useParams();
  const navigate = useNavigate();
  const { selectedTestCase, fetchTestCaseById, deleteTestCase, loadingTestCases, usuario, executions, fetchExecutions, updateEstadoTestCase } = useStore();
  const [openBugForm, setOpenBugForm] = useState(false);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [execEstado, setExecEstado] = useState('pasado');
  const [execObservaciones, setExecObservaciones] = useState('');
  const [submittingExec, setSubmittingExec] = useState(false);

  const handleDelete = async () => {
    await deleteTestCase(id, caseId);
    navigate(`/proyectos/${id}`);
  };

  const handleRecordExecution = async (e) => {
    e.preventDefault();
    if (!execEstado) return;
    setSubmittingExec(true);
    try {
      await updateEstadoTestCase(id, caseId, execEstado, usuario?.id, null, execObservaciones);
      setExecObservaciones('');
      await fetchTestCaseById(id, caseId);
    } catch (error) {
      alert('Error registrando ejecución.');
    } finally {
      setSubmittingExec(false);
    }
  };

  useEffect(() => {
    fetchTestCaseById(id, caseId);
    fetchExecutions(id, caseId);
  }, [id, caseId, fetchTestCaseById, fetchExecutions]);

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

      {/* FORMULARIO PARA REGISTRAR EJECUCIÓN (Solo Testers) */}
      {usuario?.rol === 'tester' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Registrar Ejecución Rápida
          </Typography>
          <form onSubmit={handleRecordExecution}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={execEstado}
                    label="Estado"
                    onChange={(e) => setExecEstado(e.target.value)}
                    required
                  >
                    <MenuItem value="pendiente">Pendiente</MenuItem>
                    <MenuItem value="pasado">Pasado</MenuItem>
                    <MenuItem value="fallido">Fallido</MenuItem>
                    <MenuItem value="bloqueado">Bloqueado</MenuItem>
                    <MenuItem value="no_ejecutado">No Ejecutado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={7}>
                <TextField
                  fullWidth
                  size="small"
                  label="Observaciones / Comentarios"
                  value={execObservaciones}
                  onChange={(e) => setExecObservaciones(e.target.value)}
                  placeholder="Describe detalladamente qué ocurrió o los pasos de la falla..."
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submittingExec}
                  startIcon={submittingExec ? <CircularProgress size={16} /> : <SendIcon />}
                >
                  Grabar
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      {/* LÍNEA DE TIEMPO DEL HISTORIAL DE EJECUCIONES */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <HistoryIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">Historial de Ejecuciones ({executions?.length || 0})</Typography>
        </Box>

        {executions && executions.length > 0 ? (
          <Box sx={{ position: 'relative', pl: 3, '&::before': { content: '""', position: 'absolute', left: 8, top: 12, bottom: 12, width: 2, bgcolor: 'rgba(255,255,255,0.08)' } }}>
            {executions.map((exec, index) => {
              let icon = <HelpOutlineIcon fontSize="small" />;
              let iconColor = '#94a3b8'; // Slate 400
              if (exec.estado === 'pasado') { icon = <CheckCircleIcon fontSize="small" />; iconColor = '#34d399'; } // Emerald 400
              else if (exec.estado === 'fallido') { icon = <CancelIcon fontSize="small" />; iconColor = '#f87171'; } // Red 400
              else if (exec.estado === 'bloqueado') { icon = <BlockIcon fontSize="small" />; iconColor = '#94a3b8'; } // Slate 400
              else if (exec.estado === 'no_ejecutado') { icon = <PlayArrowIcon fontSize="small" />; iconColor = '#38bdf8'; } // Sky 400
              else if (exec.estado === 'pendiente') { icon = <PlayArrowIcon fontSize="small" />; iconColor = '#fbbf24'; } // Amber 400

              return (
                <Box key={exec.id || index} sx={{ position: 'relative', mb: 3, '&:last-child': { mb: 0 } }}>
                  {/* Círculo con el ícono */}
                  <Box sx={{ position: 'absolute', left: -24, top: 4, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', zIndex: 1, color: iconColor }}>
                    {icon}
                  </Box>
                  
                  <Box sx={{ ml: 1 }}>
                    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyItems="center" justifyContent="space-between" mb={0.5}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: iconColor, textTransform: 'capitalize' }}>
                        {exec.estado === 'no_ejecutado' ? 'no ejecutado' : exec.estado}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(exec.fecha_ejecucion)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.primary', mb: 0.5 }}>
                      Tester: <strong>{exec.tester_nombre || 'Desconocido'}</strong>
                    </Typography>
                    {exec.observaciones && (
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', pl: 1.5, borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                        "{exec.observaciones}"
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography color="textSecondary">No hay historial de ejecución registrado.</Typography>
        )}
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

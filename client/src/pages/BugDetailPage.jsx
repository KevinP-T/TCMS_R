import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Grid, Divider, CircularProgress, ImageList, ImageListItem, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityChip from '../components/ui/PriorityChip';
import SeverityChip from '../components/ui/SeverityChip';
import BugForm from '../components/bugs/BugForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { formatDate } from '../utils/formatters';

const BugDetailPage = () => {
  const { id, bugId } = useParams();
  const navigate = useNavigate();
  const { selectedBug, fetchBugById, deleteBug, deleteEvidencia, loadingBugs, usuario } = useStore();
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    await deleteBug(id, bugId);
    navigate(`/proyectos/${id}`);
  };

  const handleRemoveEvidencia = async (path) => {
    if (window.confirm('¿Eliminar esta evidencia?')) {
      await deleteEvidencia(id, bugId, path);
    }
  };

  useEffect(() => {
    fetchBugById(id, bugId);
  }, [id, bugId, fetchBugById]);

  if (loadingBugs || !selectedBug) return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/proyectos/${id}`)} sx={{ mb: 2 }}>
        Volver al Proyecto
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>{selectedBug.titulo}</Typography>
            <Typography variant="body2" color="textSecondary">Reportado por: {selectedBug.tester_nombre} el {formatDate(selectedBug.creado_en)}</Typography>
            <Box display="flex" gap={1} mt={1}>
              <SeverityChip severity={selectedBug.severidad} />
              <PriorityChip priority={selectedBug.prioridad} />
              <StatusBadge status={selectedBug.estado} size="medium" />
            </Box>
          </Box>
          {usuario?.rol === 'tester' && (
            <Box display="flex" gap={1}>
              <Button variant="outlined" startIcon={<EditIcon />} size="small" onClick={() => setOpenEditForm(true)}>Editar</Button>
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} size="small" onClick={() => setOpenDeleteConfirm(true)}>Eliminar</Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>Descripción</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{selectedBug.descripcion}</Typography>
            
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>Evidencias</Typography>
              {selectedBug.evidencia_paths?.length > 0 ? (
                <ImageList sx={{ width: '100%', height: 'auto' }} cols={3} rowHeight={164}>
                  {selectedBug.evidencia_paths.map((path) => (
                    <ImageListItem key={path}>
                      <img
                        src={`http://localhost:3500/uploads/${path}`}
                        alt="Evidencia"
                        loading="lazy"
                        style={{ cursor: 'pointer', objectFit: 'contain' }}
                        onClick={() => window.open(`http://localhost:3500/uploads/${path}`, '_blank')}
                      />
                      {usuario?.rol === 'tester' && (
                        <IconButton 
                          size="small" 
                          color="error" 
                          sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)' }}
                          onClick={() => handleRemoveEvidencia(path)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </ImageListItem>
                  ))}
                </ImageList>
              ) : (
                <Typography color="textSecondary">No hay evidencias adjuntas.</Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa' }}>
              <Typography variant="subtitle2" color="textSecondary">Asignado a</Typography>
              <Typography variant="body1" gutterBottom>{selectedBug.desarrollador_nombre || 'Sin asignar'}</Typography>

              <Typography variant="subtitle2" color="textSecondary">ID Sistema</Typography>
              <Typography variant="body1" gutterBottom>{selectedBug.id_sistema || '-'}</Typography>

              <Typography variant="subtitle2" color="textSecondary">ID CU</Typography>
              <Typography variant="body1" gutterBottom>{selectedBug.id_cu || '-'}</Typography>

              <Typography variant="subtitle2" color="textSecondary">Caso de Prueba Vinculado</Typography>
              {selectedBug.test_case_id ? (
                <Button size="small" onClick={() => navigate(`/proyectos/${id}/casos/${selectedBug.test_case_id}`)}>
                  Ver Caso de Prueba
                </Button>
              ) : (
                <Typography variant="body1" gutterBottom>-</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      {openEditForm && (
        <BugForm 
          open={openEditForm} 
          onClose={() => { setOpenEditForm(false); fetchBugById(id, bugId); }} 
          projectId={id} 
          bugToEdit={selectedBug} 
        />
      )}
      <ConfirmDialog 
        open={openDeleteConfirm} 
        title="Eliminar Reporte de Bug" 
        content="¿Estás seguro de que deseas eliminar este bug? Sus evidencias también serán descartadas. Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setOpenDeleteConfirm(false)}
        confirmText="Eliminar permanentemente"
      />
    </Box>
  );
};

export default BugDetailPage;

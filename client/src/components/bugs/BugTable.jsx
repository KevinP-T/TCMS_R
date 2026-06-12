import React, { useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Button, Box, Select, MenuItem, FormControl, InputLabel, Grid
} from '@mui/material';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import PriorityChip from '../ui/PriorityChip';
import SeverityChip from '../ui/SeverityChip';
import { formatDate } from '../../utils/formatters';
import { PERMISOS } from '../../utils/constants';
import ImportExportButtons from '../ui/ImportExportButtons';

const BugTable = ({ projectId }) => {
  const navigate = useNavigate();
  const { 
    bugs, fetchBugs, updateEstadoBug, bugsFilters, setBugFilters, 
    usuario, importBugs, exportBugs, loadingBugs 
  } = useStore();

  useEffect(() => {
    fetchBugs(projectId, bugsFilters);
  }, [projectId, bugsFilters, fetchBugs]);

  const handleEstadoChange = async (id, estado) => {
    await updateEstadoBug(projectId, id, estado);
  };

  const handleFilterChange = (field, value) => {
    setBugFilters({ ...bugsFilters, [field]: value });
  };

  const getAvailableStatuses = (estadoActual) => {
    return Object.keys(PERMISOS.transiciones_bug).filter(s => 
      PERMISOS.transiciones_bug[estadoActual].includes(s)
    );
  };

  const handleImport = async (json) => {
    try {
      await importBugs(projectId, json);
      fetchBugs(projectId, bugsFilters); // refrescar
    } catch (error) {
      alert('Error importando bugs.');
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportBugs(projectId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bugs_${projectId}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error exportando bugs.');
    }
  };

  const canChangeStatus = (estadoActual) => {
    if (usuario?.rol === 'tester') return true;
    if (usuario?.rol === 'desarrollador') {
      // Desarrolladores típicamente solo pueden mover a pendiente_revision o similar
      // Simplificado: habilitado, pero la lista de opciones la filtramos
      return true;
    }
    return false;
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select value={bugsFilters?.estado || ''} label="Estado" onChange={(e) => handleFilterChange('estado', e.target.value)}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="abierto">Abierto</MenuItem>
                <MenuItem value="en_progreso">En Progreso</MenuItem>
                <MenuItem value="pendiente_revision">Pendiente Revisión</MenuItem>
                <MenuItem value="resuelto">Resuelto</MenuItem>
                <MenuItem value="cerrado">Cerrado</MenuItem>
                <MenuItem value="rechazado">Rechazado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel>Severidad</InputLabel>
              <Select value={bugsFilters?.severidad || ''} label="Severidad" onChange={(e) => handleFilterChange('severidad', e.target.value)}>
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="critica">Crítica</MenuItem>
                <MenuItem value="alta">Alta</MenuItem>
                <MenuItem value="media">Media</MenuItem>
                <MenuItem value="baja">Baja</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="text" onClick={() => setBugFilters({ estado: null, severidad: null, desarrollador_id: null })}>
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell><strong>Título</strong></TableCell>
              <TableCell><strong>Severidad</strong></TableCell>
              <TableCell><strong>Prioridad</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Reportado por</strong></TableCell>
              <TableCell><strong>Desarrollador</strong></TableCell>
              <TableCell><strong>Creado</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bugs.map((b) => (
              <TableRow 
                key={b.id}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                onClick={() => navigate(`/proyectos/${projectId}/bugs/${b.id}`)}
              >
                <TableCell>{b.titulo}</TableCell>
                <TableCell><SeverityChip severity={b.severidad} /></TableCell>
                <TableCell><PriorityChip priority={b.prioridad} /></TableCell>
                <TableCell>
                  {canChangeStatus(b.estado) ? (
                    <FormControl size="small" variant="standard" fullWidth>
                      <Select
                        value={b.estado}
                        onChange={(e) => handleEstadoChange(b.id, e.target.value)}
                        disableUnderline
                        sx={{ fontSize: '0.875rem' }}
                      >
                        {usuario?.rol === 'tester' ? [
                          <MenuItem key="abierto" value="abierto">Abierto</MenuItem>,
                          <MenuItem key="en_progreso" value="en_progreso">En Progreso</MenuItem>,
                          <MenuItem key="pendiente_revision" value="pendiente_revision">A Revisar</MenuItem>,
                          <MenuItem key="resuelto" value="resuelto">Resuelto</MenuItem>,
                          <MenuItem key="cerrado" value="cerrado">Cerrado</MenuItem>,
                          <MenuItem key="rechazado" value="rechazado">Rechazado</MenuItem>,
                        ] : [
                          <MenuItem key={b.estado} value={b.estado}>{b.estado.toUpperCase()}</MenuItem>,
                          <MenuItem key="pendiente_revision" value="pendiente_revision">A Revisar</MenuItem>,
                        ]}
                      </Select>
                    </FormControl>
                  ) : (
                    <StatusBadge status={b.estado} />
                  )}
                </TableCell>
                <TableCell>{b.tester_nombre}</TableCell>
                <TableCell>{b.desarrollador_nombre || 'Sin asignar'}</TableCell>
                <TableCell>{formatDate(b.creado_en)}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => navigate(`/proyectos/${projectId}/bugs/${b.id}`)}>
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {bugs.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">No hay bugs reportados.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BugTable;

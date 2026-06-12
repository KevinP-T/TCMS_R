import React, { useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Button, Box, IconButton, Select, MenuItem, FormControl, InputLabel, Grid
} from '@mui/material';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import PriorityChip from '../ui/PriorityChip';
import AddIcon from '@mui/icons-material/Add';
import { formatDate } from '../../utils/formatters';
import ImportExportButtons from '../ui/ImportExportButtons';

const TestCaseTable = ({ projectId }) => {
  const navigate = useNavigate();
  const { 
    testCases, fetchTestCases, updateEstadoTestCase, testCasesFilters, setTestCaseFilters, 
    usuario, ciclos, fetchCiclos, importTestCases, exportTestCases, loadingTestCases 
  } = useStore();

  useEffect(() => {
    fetchTestCases(projectId, testCasesFilters);
    fetchCiclos(projectId);
  }, [projectId, testCasesFilters, fetchTestCases, fetchCiclos]);

  const handleEstadoChange = async (id, estado) => {
    await updateEstadoTestCase(projectId, id, estado);
  };

  const handleFilterChange = (field, value) => {
    setTestCaseFilters({ ...testCasesFilters, [field]: value });
  };

  const handleImport = async (json) => {
    try {
      await importTestCases(projectId, json);
      fetchTestCases(projectId, testCasesFilters); // refrescar
    } catch (error) {
      alert('Error importando casos de prueba.');
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportTestCases(projectId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `test_cases_${projectId}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error exportando casos de prueba.');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        {usuario?.rol === 'tester' && (
          <ImportExportButtons 
            onImport={handleImport} 
            onExport={handleExport} 
            isLoading={loadingTestCases} 
          />
        )}
      </Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select value={testCasesFilters?.estado || ''} label="Estado" onChange={(e) => handleFilterChange('estado', e.target.value)}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="pasado">Pasado</MenuItem>
                <MenuItem value="fallido">Fallido</MenuItem>
                <MenuItem value="bloqueado">Bloqueado</MenuItem>
                <MenuItem value="no_ejecutado">No Ejecutado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select value={testCasesFilters?.tipo || ''} label="Tipo" onChange={(e) => handleFilterChange('tipo', e.target.value)}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="positivo">Positivo</MenuItem>
                <MenuItem value="negativo">Negativo</MenuItem>
                <MenuItem value="borde">Borde</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>Ciclo</InputLabel>
              <Select value={testCasesFilters?.ciclo_id || ''} label="Ciclo" onChange={(e) => handleFilterChange('ciclo_id', e.target.value)}>
                <MenuItem value="">Todos</MenuItem>
                {ciclos?.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="text" onClick={() => setTestCaseFilters({ estado: null, tipo: null, ciclo_id: null })}>
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID CP</strong></TableCell>
              <TableCell><strong>Descripción</strong></TableCell>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Prioridad</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Tester</strong></TableCell>
              <TableCell><strong>Creado</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {testCases.map((tc) => (
              <TableRow 
                key={tc.id}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                onClick={() => navigate(`/proyectos/${projectId}/casos/${tc.id}`)}
              >
                <TableCell>{tc.id_cp || tc.id_cu || '-'}</TableCell>
                <TableCell>{tc.descripcion}</TableCell>
                <TableCell>{tc.tipo_caso.toUpperCase()}</TableCell>
                <TableCell><PriorityChip priority={tc.prioridad} /></TableCell>
                <TableCell>
                  {usuario?.rol === 'tester' ? (
                    <FormControl size="small" variant="standard" fullWidth>
                      <Select
                        value={tc.estado}
                        onChange={(e) => handleEstadoChange(tc.id, e.target.value)}
                        disableUnderline
                        sx={{ fontSize: '0.875rem' }}
                      >
                        <MenuItem value="pendiente">Pendiente</MenuItem>
                        <MenuItem value="pasado">Pasado</MenuItem>
                        <MenuItem value="fallido">Fallido</MenuItem>
                        <MenuItem value="bloqueado">Bloqueado</MenuItem>
                        <MenuItem value="no_ejecutado">No Ejecutado</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <StatusBadge status={tc.estado} />
                  )}
                </TableCell>
                <TableCell>{tc.tester_nombre}</TableCell>
                <TableCell>{formatDate(tc.creado_en)}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => navigate(`/proyectos/${projectId}/casos/${tc.id}`)}>
                    Ver Detalle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {testCases.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">No hay casos de prueba registrados.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TestCaseTable;

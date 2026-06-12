import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, CircularProgress } from '@mui/material';
import { useStore } from '../store';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UserForm from '../components/users/UserForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { formatDate } from '../utils/formatters';

const UsersPage = () => {
  const { users, loadingUsers, fetchUsers, deleteUser } = useStore();
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenEdit = (user) => {
    setUserToEdit(user);
    setOpenForm(true);
  };

  const handleOpenDelete = (user) => {
    setUserToDelete(user);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      setOpenConfirm(false);
      setUserToDelete(null);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Administración de Usuarios</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => { setUserToEdit(null); setOpenForm(true); }}>
          Nuevo Usuario
        </Button>
      </Box>

      {loadingUsers ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>Rol</strong></TableCell>
                <TableCell><strong>PIN de Acceso</strong></TableCell>
                <TableCell><strong>Fecha de Alta</strong></TableCell>
                <TableCell align="right"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{u.nombre}</TableCell>
                  <TableCell>
                    <Chip label={u.rol.toUpperCase()} color={u.rol === 'tester' ? 'secondary' : 'primary'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ letterSpacing: 2, fontWeight: 'bold' }}>
                      {u.pin || '----'}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(u.creado_en)}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenEdit(u)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDelete(u)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">No hay usuarios registrados.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {openForm && (
        <UserForm 
          open={openForm} 
          onClose={() => { setOpenForm(false); setUserToEdit(null); }} 
          userToEdit={userToEdit} 
        />
      )}

      <ConfirmDialog
        open={openConfirm}
        title="Desactivar Usuario"
        content={`¿Estás seguro de que deseas dar de baja al usuario "${userToDelete?.nombre}"? Esta acción no eliminará sus registros históricos pero ya no podrá iniciar sesión.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setOpenConfirm(false); setUserToDelete(null); }}
        confirmText="Desactivar"
      />
    </Box>
  );
};

export default UsersPage;

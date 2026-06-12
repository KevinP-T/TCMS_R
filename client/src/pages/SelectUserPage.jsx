import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import api from '../services/api';

const SelectUserPage = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUsuario = useStore(state => state.setUsuario);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('El PIN debe tener 4 dígitos');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/users/login', { pin });
      setUsuario(res.data);
      navigate('/proyectos');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
        TCMS
      </Typography>
      <Typography variant="h6" color="textSecondary" gutterBottom mb={4}>
        Ingrese su PIN de acceso
      </Typography>
      
      <Card sx={{ width: 350, p: 2, boxShadow: 3 }}>
        <CardContent>
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="PIN de 4 dígitos"
              variant="outlined"
              type="password"
              inputProps={{ maxLength: 4, style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem' } }}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              autoFocus
              sx={{ mb: 3 }}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              type="submit" 
              disabled={loading || pin.length !== 4}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SelectUserPage;

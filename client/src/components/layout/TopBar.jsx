import React from 'react';
import { AppBar, Toolbar, Typography, Box, Avatar, IconButton, Menu, MenuItem, Chip } from '@mui/material';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const drawerWidth = 240;

const TopBar = () => {
  const usuario = useStore(state => state.usuario);
  const clearUsuario = useStore(state => state.clearUsuario);
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    clearUsuario();
    navigate('/');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        width: `calc(100% - ${drawerWidth}px)`, 
        ml: `${drawerWidth}px`,
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {/* Se puede inyectar el título de la página aquí si se usa un context */}
        </Typography>
        
        {usuario && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={usuario.rol.toUpperCase()} 
              color={usuario.rol === 'tester' ? 'primary' : 'secondary'} 
              size="small" 
            />
            <Typography variant="body1">{usuario.nombre}</Typography>
            <IconButton size="large" onClick={handleMenu} color="inherit">
              <AccountCircleIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>Cambiar Usuario</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;

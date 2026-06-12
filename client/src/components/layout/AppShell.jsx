import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppShell = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
      <TopBar />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* Espaciador para la topbar fija */}
        {children}
      </Box>
    </Box>
  );
};

export default AppShell;

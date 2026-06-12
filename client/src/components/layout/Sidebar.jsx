import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Drawer, List, ListItem, ListItemIcon, ListItemText, 
  Toolbar, Divider, Typography, Box 
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BugReportIcon from '@mui/icons-material/BugReport';
import PeopleIcon from '@mui/icons-material/People';
import { useStore } from '../../store';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useStore();

  const menuItems = [
    { text: 'Proyectos', icon: <FolderIcon />, path: '/proyectos' },
    // { text: 'Reportes', icon: <AssessmentIcon />, path: '/reportes' },
  ];

  if (usuario?.rol === 'tester') {
    menuItems.push({ text: 'Reportes', icon: <AssessmentIcon />, path: '/reportes' });
    menuItems.push({ text: 'Usuarios', icon: <PeopleIcon />, path: '/usuarios' });
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BugReportIcon color="primary" />
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            TCMS
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => navigate(item.path)}
            selected={location.pathname.startsWith(item.path)}
          >
            <ListItemIcon sx={{ color: location.pathname.startsWith(item.path) ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;

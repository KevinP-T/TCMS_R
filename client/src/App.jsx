import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import AppShell from './components/layout/AppShell';

import SelectUserPage from './pages/SelectUserPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TestCaseDetailPage from './pages/TestCaseDetailPage';
import BugDetailPage from './pages/BugDetailPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';

const PrivateRoute = ({ children }) => {
  const usuario = useStore(state => state.usuario);
  if (!usuario) {
    return <Navigate to="/" replace />;
  }
  return <AppShell>{children}</AppShell>;
};

function App() {
  const usuario = useStore(state => state.usuario);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelectUserPage />} />
        
        <Route path="/proyectos" element={
          <PrivateRoute>
            <ProjectsPage />
          </PrivateRoute>
        } />
        
        <Route path="/proyectos/:id" element={
          <PrivateRoute>
            <ProjectDetailPage />
          </PrivateRoute>
        } />

        <Route path="/proyectos/:id/casos/:caseId" element={
          <PrivateRoute>
            <TestCaseDetailPage />
          </PrivateRoute>
        } />
        
        <Route path="/proyectos/:id/bugs/:bugId" element={
          <PrivateRoute>
            <BugDetailPage />
          </PrivateRoute>
        } />

        <Route path="/usuarios" element={
          <PrivateRoute>
            {usuario?.rol === 'tester' ? <UsersPage /> : <Navigate to="/proyectos" replace />}
          </PrivateRoute>
        } />

        <Route path="/reportes" element={
          <PrivateRoute>
            {usuario?.rol === 'tester' ? <ReportsPage /> : <Navigate to="/proyectos" replace />}
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

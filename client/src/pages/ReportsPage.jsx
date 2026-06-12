import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, MenuItem, TextField } from '@mui/material';
import { useStore } from '../store';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import BugReportIcon from '@mui/icons-material/BugReport';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

// Paleta Neon para Modo Oscuro
const COLORS_STATUS = {
  'pendiente': '#fbbf24',    // Amber 400
  'pasado': '#34d399',       // Emerald 400
  'fallido': '#f87171',      // Red 400
  'bloqueado': '#94a3b8',    // Slate 400
  'no_ejecutado': '#38bdf8'  // Sky 400
};

const COLORS_SEVERITY = {
  'critica': '#ef4444',      // Red 500
  'alta': '#f97316',         // Orange 500
  'media': '#eab308',        // Yellow 500
  'baja': '#22c55e'          // Green 500
};

const ReportsPage = () => {
  const { dashboardData, loadingReports, fetchDashboardData, projects, fetchProjects } = useStore();
  const [selectedProject, setSelectedProject] = useState('general');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchDashboardData(selectedProject);
  }, [fetchDashboardData, selectedProject]);

  if (loadingReports || !dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <CircularProgress />
      </div>
    );
  }

  const formatData = (dataArray, colorMap) => {
    return dataArray.map(item => ({
      name: item.estado || item.severidad,
      value: item.count,
      fill: colorMap[item.estado || item.severidad] || '#8b5cf6' // Default purple
    }));
  };

  const tcData = formatData(dashboardData.testCasesByStatus, COLORS_STATUS);
  const bugsSeverityData = formatData(dashboardData.bugsBySeverity, COLORS_SEVERITY);

  const totalTc = tcData.reduce((acc, curr) => acc + curr.value, 0);
  const totalBugs = bugsSeverityData.reduce((acc, curr) => acc + curr.value, 0);

  // Custom Tooltip component for Recharts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold">{`${payload[0].name.toUpperCase()}`}</p>
          <p className="text-cyan-400 font-bold">{`Cantidad: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Dashboard {selectedProject === 'general' ? 'Global' : 'de Proyecto'}
          </h1>
          <p className="text-slate-400 mt-1">Análisis multidimensional de métricas y estados.</p>
        </div>
        
        <div className="w-full md:w-auto min-w-[250px]">
          <TextField 
            select 
            fullWidth
            label="Filtrar por Proyecto" 
            value={selectedProject} 
            onChange={(e) => setSelectedProject(e.target.value)}
            size="small"
            className="bg-slate-800/50 backdrop-blur-sm rounded-lg"
          >
            <MenuItem value="general">Todos los Proyectos (General)</MenuItem>
            {projects?.map(p => (
              <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
            ))}
          </TextField>
        </div>
      </div>

      {/* STAT CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: Proyectos */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-800/60 backdrop-blur-xl border border-white/5 p-6 shadow-lg hover:border-cyan-500/50 hover:shadow-cyan-500/20 transition-all duration-300 group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FolderSpecialIcon sx={{ fontSize: 120 }} />
          </div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Proyectos Activos</p>
          <p className="text-5xl font-black text-white">{dashboardData.totalProyectos}</p>
          <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-transparent mt-4 rounded-full"></div>
        </div>

        {/* Card 2: Casos de Prueba */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-800/60 backdrop-blur-xl border border-white/5 p-6 shadow-lg hover:border-emerald-500/50 hover:shadow-emerald-500/20 transition-all duration-300 group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AssignmentTurnedInIcon sx={{ fontSize: 120 }} />
          </div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Casos de Prueba</p>
          <p className="text-5xl font-black text-white">{totalTc}</p>
          <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-transparent mt-4 rounded-full"></div>
        </div>

        {/* Card 3: Bugs */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-800/60 backdrop-blur-xl border border-white/5 p-6 shadow-lg hover:border-rose-500/50 hover:shadow-rose-500/20 transition-all duration-300 group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BugReportIcon sx={{ fontSize: 120 }} />
          </div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Bugs Reportados</p>
          <p className="text-5xl font-black text-white">{totalBugs}</p>
          <div className="h-1 w-20 bg-gradient-to-r from-rose-500 to-transparent mt-4 rounded-full"></div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Donut Casos */}
        <div className="bg-slate-800/40 backdrop-blur-lg border border-white/5 rounded-2xl p-6 h-[450px] shadow-xl flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6 text-center">Distribución de Casos de Prueba</h3>
          <div className="flex-grow">
            {tcData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={tcData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" cy="50%" 
                    innerRadius={70}
                    outerRadius={110} 
                    paddingAngle={5}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {tcData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(255,255,255,0.1)" strokeWidth={2}/>
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-slate-500">No hay datos suficientes</div>
            )}
          </div>
        </div>

        {/* Chart 2: Bar Bugs */}
        <div className="bg-slate-800/40 backdrop-blur-lg border border-white/5 rounded-2xl p-6 h-[450px] shadow-xl flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6 text-center">Bugs reportados por Severidad</h3>
          <div className="flex-grow">
            {bugsSeverityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bugsSeverityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
                  <YAxis allowDecimals={false} stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
                  <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Cantidad" radius={[6, 6, 0, 0]}>
                    {bugsSeverityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-slate-500">No hay datos suficientes</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsPage;

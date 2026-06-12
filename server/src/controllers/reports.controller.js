const { query, get } = require('../db/database');

exports.getGlobalDashboard = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    
    let baseWhere = '';
    const params = [];
    
    if (projectId && projectId !== 'general') {
      baseWhere = 'WHERE project_id = ?';
      params.push(projectId);
    }

    // 1. Total de Proyectos Activos (solo aplica si es general, o 1 si es por proyecto)
    let totalProyectos = 1;
    if (!projectId || projectId === 'general') {
      const proyectosData = await get(`SELECT COUNT(*) as total FROM projects WHERE estado = 'activo'`);
      totalProyectos = proyectosData.total;
    }

    // 2. Desglose de Casos de Prueba
    const testCasesStats = await query(`
      SELECT estado, COUNT(*) as count 
      FROM test_cases 
      ${baseWhere}
      GROUP BY estado
    `, params);

    // 3. Desglose de Bugs por Severidad
    const bugsSeveridadStats = await query(`
      SELECT severidad, COUNT(*) as count 
      FROM bugs 
      ${baseWhere}
      GROUP BY severidad
    `, params);

    // 4. Desglose de Bugs por Estado
    const bugsEstadoStats = await query(`
      SELECT estado, COUNT(*) as count 
      FROM bugs 
      ${baseWhere}
      GROUP BY estado
    `, params);

    res.json({
      totalProyectos,
      testCasesByStatus: testCasesStats,
      bugsBySeverity: bugsSeveridadStats,
      bugsByStatus: bugsEstadoStats,
    });
  } catch (error) {
    next(error);
  }
};

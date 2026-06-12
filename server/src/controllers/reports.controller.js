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

    // 5. Evolución Temporal (Pasado vs Fallido vs Otros)
    let evolutionWhere = '';
    const evolutionParams = [];
    if (projectId && projectId !== 'general') {
      evolutionWhere = 'WHERE t.project_id = ?';
      evolutionParams.push(projectId);
    }
    const evolutionStats = await query(`
      SELECT date(e.fecha_ejecucion) as fecha,
             SUM(CASE WHEN e.estado = 'pasado' THEN 1 ELSE 0 END) as pasado,
             SUM(CASE WHEN e.estado = 'fallido' THEN 1 ELSE 0 END) as fallido,
             SUM(CASE WHEN e.estado = 'bloqueado' THEN 1 ELSE 0 END) as bloqueado,
             SUM(CASE WHEN e.estado = 'no_ejecutado' THEN 1 ELSE 0 END) as no_ejecutado,
             SUM(CASE WHEN e.estado = 'pendiente' THEN 1 ELSE 0 END) as pendiente
      FROM test_case_executions e
      JOIN test_cases t ON e.test_case_id = t.id
      ${evolutionWhere}
      GROUP BY date(e.fecha_ejecucion)
      ORDER BY date(e.fecha_ejecucion) ASC
    `, evolutionParams);

    // 6. Casos de Prueba Más Inestables (Fallas repetidas)
    let unstableWhere = '';
    const unstableParams = [];
    if (projectId && projectId !== 'general') {
      unstableWhere = 'AND t.project_id = ?';
      unstableParams.push(projectId);
    }
    const unstableStats = await query(`
      SELECT t.id, t.id_cp, t.descripcion, COUNT(*) as fallas
      FROM test_case_executions e
      JOIN test_cases t ON e.test_case_id = t.id
      WHERE e.estado = 'fallido'
      ${unstableWhere}
      GROUP BY t.id
      ORDER BY fallas DESC
      LIMIT 5
    `, unstableParams);

    // 7. Estadísticas por Tester
    let testerWhere = '';
    const testerParams = [];
    if (projectId && projectId !== 'general') {
      testerWhere = 'WHERE t.project_id = ?';
      testerParams.push(projectId);
    }
    const testerStats = await query(`
      SELECT u.nombre as tester_nombre,
             COUNT(*) as total_ejecuciones,
             SUM(CASE WHEN e.estado = 'pasado' THEN 1 ELSE 0 END) as pasado,
             SUM(CASE WHEN e.estado = 'fallido' THEN 1 ELSE 0 END) as fallido,
             SUM(CASE WHEN e.estado = 'bloqueado' THEN 1 ELSE 0 END) as bloqueado,
             SUM(CASE WHEN e.estado = 'no_ejecutado' THEN 1 ELSE 0 END) as no_ejecutado,
             SUM(CASE WHEN e.estado = 'pendiente' THEN 1 ELSE 0 END) as pendiente
      FROM test_case_executions e
      JOIN users u ON e.tester_id = u.id
      JOIN test_cases t ON e.test_case_id = t.id
      ${testerWhere}
      GROUP BY u.id
      ORDER BY total_ejecuciones DESC
    `, testerParams);

    res.json({
      totalProyectos,
      testCasesByStatus: testCasesStats,
      bugsBySeverity: bugsSeveridadStats,
      bugsByStatus: bugsEstadoStats,
      evolutionData: evolutionStats,
      unstableTestCases: unstableStats,
      testerStats
    });
  } catch (error) {
    next(error);
  }
};

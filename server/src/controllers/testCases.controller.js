const { get, query, run } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const mapEstado = (estadoRaw) => {
  if (!estadoRaw) return 'pendiente';
  const val = estadoRaw.toLowerCase().trim();
  if (['pasó', 'paso', 'exitoso', 'pasado'].includes(val)) return 'pasado';
  if (['falló', 'fallo', 'falla', 'fallido'].includes(val)) return 'fallido';
  if (['bloqueado'].includes(val)) return 'bloqueado';
  if (['no_ejecutado', 'no ejecutado'].includes(val)) return 'no_ejecutado';
  return 'pendiente';
};

const generateIdCp = async (projectId, tipoCaso) => {
  const project = await get('SELECT nombre FROM projects WHERE id = ?', [projectId]);
  const pName = project ? project.nombre.toUpperCase().replace(/\s+/g, '-') : 'PROY';
  let tLetter = 'P';
  if (tipoCaso === 'negativo') tLetter = 'N';
  else if (tipoCaso === 'borde') tLetter = 'B';
  
  const existingIds = await query(`SELECT id_cp FROM test_cases WHERE project_id = ? AND id_cp IS NOT NULL`, [projectId]);
  let maxCount = 0;
  existingIds.forEach(row => {
    const parts = row.id_cp.split('-CP-');
    if (parts.length === 2) {
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxCount) maxCount = num;
    }
  });
  
  const nextCount = (maxCount + 1).toString().padStart(3, '0');
  return `${pName}-${tLetter}-CP-${nextCount}`;
};

exports.getAllTestCases = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { ciclo_id, estado, tipo } = req.query;
    
    let sql = `
      SELECT t.*, u.nombre as tester_nombre, c.nombre as ciclo_nombre
      FROM test_cases t
      JOIN users u ON t.tester_id = u.id
      LEFT JOIN ciclos c ON t.ciclo_id = c.id
      WHERE t.project_id = ?
    `;
    const params = [projectId];
    
    if (ciclo_id) { sql += ` AND t.ciclo_id = ?`; params.push(ciclo_id); }
    if (estado) { sql += ` AND t.estado = ?`; params.push(estado); }
    if (tipo) { sql += ` AND t.tipo_caso = ?`; params.push(tipo); }
    
    sql += ` ORDER BY t.creado_en DESC`;
    
    const testCases = await query(sql, params);
    
    // Parsear campos JSON
    const parsedTestCases = testCases.map(tc => ({
      ...tc,
      precondiciones: tc.precondiciones ? JSON.parse(tc.precondiciones) : [],
      pasos: tc.pasos ? JSON.parse(tc.pasos) : [],
      resultados_esperados: tc.resultados_esperados ? JSON.parse(tc.resultados_esperados) : [],
      resultados_obtenidos: tc.resultados_obtenidos ? JSON.parse(tc.resultados_obtenidos) : [],
    }));
    
    res.json(parsedTestCases);
  } catch (error) {
    next(error);
  }
};

exports.getTestCaseById = async (req, res, next) => {
  try {
    const { id, projectId } = req.params;
    const tc = await get(`
      SELECT t.*, u.nombre as tester_nombre, c.nombre as ciclo_nombre
      FROM test_cases t
      JOIN users u ON t.tester_id = u.id
      LEFT JOIN ciclos c ON t.ciclo_id = c.id
      WHERE t.id = ? AND t.project_id = ?
    `, [id, projectId]);
    
    if (!tc) return res.status(404).json({ error: 'Caso de prueba no encontrado' });
    
    const parsedTc = {
      ...tc,
      precondiciones: tc.precondiciones ? JSON.parse(tc.precondiciones) : [],
      pasos: tc.pasos ? JSON.parse(tc.pasos) : [],
      resultados_esperados: tc.resultados_esperados ? JSON.parse(tc.resultados_esperados) : [],
      resultados_obtenidos: tc.resultados_obtenidos ? JSON.parse(tc.resultados_obtenidos) : [],
    };
    
    // Obtener bugs vinculados
    const bugs = await query(`SELECT * FROM bugs WHERE test_case_id = ?`, [id]);
    parsedTc.bugs_vinculados = bugs;
    
    res.json(parsedTc);
  } catch (error) {
    next(error);
  }
};

exports.createTestCase = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const {
      ciclo_id, id_cu, descripcion, datos, precondiciones, 
      prioridad, tipo_caso, pasos, resultados_esperados, 
      resultados_obtenidos, post_condicion, tester_id
    } = req.body;
    
    const id = uuidv4();
    const id_cp = await generateIdCp(projectId, tipo_caso);
    
    await run(`
      INSERT INTO test_cases (
        id, project_id, ciclo_id, id_cu, id_cp, descripcion, datos, precondiciones,
        prioridad, tipo_caso, pasos, resultados_esperados, resultados_obtenidos,
        post_condicion, tester_id, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')
    `, [
      id, projectId, ciclo_id || null, id_cu, id_cp, descripcion, datos, 
      precondiciones ? JSON.stringify(precondiciones) : null,
      prioridad, tipo_caso, 
      pasos ? JSON.stringify(pasos) : null, 
      resultados_esperados ? JSON.stringify(resultados_esperados) : null, 
      resultados_obtenidos ? JSON.stringify(resultados_obtenidos) : null,
      post_condicion, tester_id
    ]);
    
    // Registrar ejecución inicial en el historial
    const execId = uuidv4();
    await run(`
      INSERT INTO test_case_executions (
        id, test_case_id, estado, tester_id, fecha_ejecucion
      ) VALUES (?, ?, 'pendiente', ?, datetime('now'))
    `, [execId, id, tester_id]);

    const newTc = await get(`SELECT * FROM test_cases WHERE id = ?`, [id]);
    res.status(201).json(newTc);
  } catch (error) {
    next(error);
  }
};

exports.updateTestCase = async (req, res, next) => {
  try {
    const { id, projectId } = req.params;
    const {
      ciclo_id, id_cu, descripcion, datos, precondiciones, 
      prioridad, tipo_caso, pasos, resultados_esperados, 
      resultados_obtenidos, post_condicion, estado, fecha_ejecucion
    } = req.body;
    
    const tc = await get(`SELECT id, estado, tester_id, resultados_obtenidos FROM test_cases WHERE id = ? AND project_id = ?`, [id, projectId]);
    if (!tc) return res.status(404).json({ error: 'Caso de prueba no encontrado' });

    const oldEstado = tc.estado;
    const newEstado = estado || tc.estado;

    await run(`
      UPDATE test_cases SET 
        ciclo_id = ?, id_cu = ?, descripcion = ?, datos = ?, precondiciones = ?,
        prioridad = ?, tipo_caso = ?, pasos = ?, resultados_esperados = ?, 
        resultados_obtenidos = ?, post_condicion = ?, estado = ?, fecha_ejecucion = ?,
        actualizado_en = datetime('now')
      WHERE id = ? AND project_id = ?
    `, [
      ciclo_id || null, id_cu, descripcion, datos, 
      precondiciones ? JSON.stringify(precondiciones) : null,
      prioridad, tipo_caso, 
      pasos ? JSON.stringify(pasos) : null, 
      resultados_esperados ? JSON.stringify(resultados_esperados) : null, 
      resultados_obtenidos ? JSON.stringify(resultados_obtenidos) : null,
      post_condicion, newEstado, fecha_ejecucion || (newEstado !== oldEstado ? datetime('now') : null),
      id, projectId
    ]);

    if (newEstado !== oldEstado) {
      const execId = uuidv4();
      await run(`
        INSERT INTO test_case_executions (
          id, test_case_id, estado, tester_id, resultados_obtenidos, observaciones, fecha_ejecucion
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `, [
        execId, 
        id, 
        newEstado, 
        tc.tester_id, 
        resultados_obtenidos ? JSON.stringify(resultados_obtenidos) : tc.resultados_obtenidos, 
        'Actualizado mediante formulario de edición'
      ]);
    }
    
    const updatedTc = await get(`SELECT * FROM test_cases WHERE id = ?`, [id]);
    res.json(updatedTc);
  } catch (error) {
    next(error);
  }
};

exports.updateEstado = async (req, res, next) => {
  try {
    const { id, projectId } = req.params;
    const { estado, tester_id, resultados_obtenidos, observaciones } = req.body;
    
    const tc = await get(`SELECT id, tester_id, resultados_obtenidos FROM test_cases WHERE id = ? AND project_id = ?`, [id, projectId]);
    if (!tc) return res.status(404).json({ error: 'Caso de prueba no encontrado' });

    const actualTesterId = tester_id || tc.tester_id;
    const finalResultados = resultados_obtenidos ? JSON.stringify(resultados_obtenidos) : tc.resultados_obtenidos;

    await run(`
      UPDATE test_cases SET 
        estado = ?, 
        fecha_ejecucion = datetime('now'), 
        actualizado_en = datetime('now'),
        resultados_obtenidos = ?,
        tester_id = ?
      WHERE id = ? AND project_id = ?
    `, [estado, finalResultados, actualTesterId, id, projectId]);

    const execId = uuidv4();
    await run(`
      INSERT INTO test_case_executions (
        id, test_case_id, estado, tester_id, resultados_obtenidos, observaciones, fecha_ejecucion
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      execId, 
      id, 
      estado, 
      actualTesterId, 
      finalResultados, 
      observaciones || null
    ]);
    
    res.json({ message: 'Estado actualizado e historial registrado', estado });
  } catch (error) {
    next(error);
  }
};

exports.getExecutionsByTestCaseId = async (req, res, next) => {
  try {
    const { id, projectId } = req.params;
    
    const tc = await get('SELECT id FROM test_cases WHERE id = ? AND project_id = ?', [id, projectId]);
    if (!tc) return res.status(404).json({ error: 'Caso de prueba no encontrado' });

    const executions = await query(`
      SELECT e.*, u.nombre as tester_nombre
      FROM test_case_executions e
      LEFT JOIN users u ON e.tester_id = u.id
      WHERE e.test_case_id = ?
      ORDER BY e.fecha_ejecucion DESC
    `, [id]);

    const parsedExecutions = executions.map(exec => ({
      ...exec,
      resultados_obtenidos: exec.resultados_obtenidos ? JSON.parse(exec.resultados_obtenidos) : []
    }));

    res.json(parsedExecutions);
  } catch (error) {
    next(error);
  }
};

exports.deleteTestCase = async (req, res, next) => {
  try {
    const { id, projectId } = req.params;
    await run(`DELETE FROM test_cases WHERE id = ? AND project_id = ?`, [id, projectId]);
    res.json({ message: 'Caso de prueba eliminado' });
  } catch (error) {
    next(error);
  }
};

exports.importTestCases = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { casos } = req.body; 
    const testerFallbackId = req.headers['x-user-id']; 

    if (!casos || !Array.isArray(casos)) {
      return res.status(400).json({ error: 'Formato JSON inválido. Se esperaba un arreglo "casos".' });
    }

    let insertCount = 0;
    const users = await query('SELECT id, nombre FROM users');
    const userMap = {};
    users.forEach(u => userMap[u.nombre.toLowerCase()] = u.id);

    for (const caso of casos) {
      const id = require('uuid').v4(); // Usar uuid internamente
      
      let testerId = testerFallbackId;
      if (caso.tester) {
        const foundId = userMap[caso.tester.toLowerCase()];
        if (foundId) testerId = foundId;
      }

      if (!testerId && users.length > 0) {
        testerId = users[0].id;
      }

      const tipoReal = caso.tipoCaso && ['positivo', 'negativo', 'borde'].includes(caso.tipoCaso.toLowerCase()) ? caso.tipoCaso.toLowerCase() : 'positivo';
      let id_cp_val = caso.idCP;
      if (!id_cp_val) {
        id_cp_val = await generateIdCp(projectId, tipoReal);
      }

      await run(`
        INSERT INTO test_cases (
          id, project_id, ciclo_id, id_cu, id_cp, descripcion, datos, precondiciones,
          prioridad, tipo_caso, pasos, resultados_esperados, resultados_obtenidos,
          post_condicion, estado, tester_id, fecha_ejecucion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, projectId, null, caso.idCU || null, id_cp_val, caso.descripcion || 'Sin descripción', caso.datos || null,
        caso.precondiciones ? JSON.stringify(caso.precondiciones) : null,
        caso.prioridad && ['alta', 'media', 'baja'].includes(caso.prioridad.toLowerCase()) ? caso.prioridad.toLowerCase() : 'media',
        tipoReal,
        caso.pasos ? JSON.stringify(caso.pasos) : null,
        caso.resultadosEsperados ? JSON.stringify(caso.resultadosEsperados) : null,
        caso.resultadosObtenidos ? JSON.stringify(caso.resultadosObtenidos) : null,
        caso.postCondicion || null,
        mapEstado(caso.estado),
        testerId,
        caso.fechaEjecucion || null
      ]);
      insertCount++;
    }

    res.json({ message: `Se importaron ${insertCount} casos correctamente.` });
  } catch (error) {
    next(error);
  }
};

exports.exportTestCases = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const testCases = await query(`
      SELECT t.*, u.nombre as tester_nombre 
      FROM test_cases t
      LEFT JOIN users u ON t.tester_id = u.id
      WHERE t.project_id = ?
    `, [projectId]);

    const project = await get(`SELECT * FROM projects WHERE id = ?`, [projectId]);

    const exportedJson = {
      _comentario: "JSON de variables para TEMPLATE_CU — Planilla de Casos de Prueba. Completar antes de generar el documento.",
      proyecto: project ? project.nombre : "",
      version: project ? project.version : "",
      ciclo: "",
      casos: testCases.map(tc => ({
        idCP: tc.id_cp || tc.id,
        idCU: tc.id_cu || "",
        descripcion: tc.descripcion || "",
        datos: tc.datos || "",
        precondiciones: tc.precondiciones ? JSON.parse(tc.precondiciones) : [],
        prioridad: tc.prioridad,
        tipoCaso: tc.tipo_caso,
        resultadosEsperados: tc.resultados_esperados ? JSON.parse(tc.resultados_esperados) : [],
        resultadosObtenidos: tc.resultados_obtenidos ? JSON.parse(tc.resultados_obtenidos) : [],
        postCondicion: tc.post_condicion || "",
        pasos: tc.pasos ? JSON.parse(tc.pasos) : [],
        tester: tc.tester_nombre || "",
        fechaEjecucion: tc.fecha_ejecucion || "",
        estado: tc.estado
      }))
    };

    res.json(exportedJson);
  } catch (error) {
    next(error);
  }
};

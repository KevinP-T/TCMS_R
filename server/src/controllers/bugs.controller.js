const { get, query, run } = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

exports.getAllBugs = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { estado, severidad, desarrollador_id } = req.query;
    
    let sql = `
      SELECT b.*, u1.nombre as tester_nombre, u2.nombre as desarrollador_nombre, c.nombre as ciclo_nombre
      FROM bugs b
      JOIN users u1 ON b.tester_id = u1.id
      LEFT JOIN users u2 ON b.desarrollador_id = u2.id
      LEFT JOIN ciclos c ON b.ciclo_id = c.id
      WHERE b.project_id = ?
    `;
    const params = [projectId];
    
    if (estado) { sql += ` AND b.estado = ?`; params.push(estado); }
    if (severidad) { sql += ` AND b.severidad = ?`; params.push(severidad); }
    if (desarrollador_id) { sql += ` AND b.desarrollador_id = ?`; params.push(desarrollador_id); }
    
    sql += ` ORDER BY b.creado_en DESC`;
    
    const bugs = await query(sql, params);
    
    const parsedBugs = bugs.map(b => ({
      ...b,
      evidencia_paths: b.evidencia_paths ? JSON.parse(b.evidencia_paths) : []
    }));
    
    res.json(parsedBugs);
  } catch (error) {
    next(error);
  }
};

exports.getBugById = async (req, res, next) => {
  try {
    const { id, projectId } = req.params;
    const b = await get(`
      SELECT b.*, u1.nombre as tester_nombre, u2.nombre as desarrollador_nombre, c.nombre as ciclo_nombre
      FROM bugs b
      JOIN users u1 ON b.tester_id = u1.id
      LEFT JOIN users u2 ON b.desarrollador_id = u2.id
      LEFT JOIN ciclos c ON b.ciclo_id = c.id
      WHERE b.id = ? AND b.project_id = ?
    `, [id, projectId]);
    
    if (!b) return res.status(404).json({ error: 'Bug no encontrado' });
    
    res.json({
      ...b,
      evidencia_paths: b.evidencia_paths ? JSON.parse(b.evidencia_paths) : []
    });
  } catch (error) {
    next(error);
  }
};

exports.createBug = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    // multipart/form-data. req.body tiene texto, req.files tiene archivos
    const {
      ciclo_id, test_case_id, id_sistema, id_cu, id_cp, id_paso,
      titulo, descripcion, estado, prioridad, severidad,
      desarrollador_id, area_asignada, descripcion_resolucion,
      fecha_est_entrega, fecha_real_entrega, fecha_cierre, observaciones, tester_id
    } = req.body;
    
    const evidencia_paths = req.files ? req.files.map(f => f.filename) : [];
    const id = uuidv4();
    
    await run(`
      INSERT INTO bugs (
        id, project_id, ciclo_id, test_case_id, id_sistema, id_cu, id_cp, id_paso,
        titulo, descripcion, estado, prioridad, severidad, desarrollador_id,
        area_asignada, descripcion_resolucion, evidencia_paths, tester_id,
        fecha_est_entrega, fecha_real_entrega, fecha_cierre, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, projectId, ciclo_id || null, test_case_id || null, id_sistema, id_cu, id_cp, id_paso,
      titulo, descripcion, estado || 'abierto', prioridad, severidad, desarrollador_id || null,
      area_asignada, descripcion_resolucion, JSON.stringify(evidencia_paths), tester_id,
      fecha_est_entrega, fecha_real_entrega, fecha_cierre, observaciones
    ]);
    
    const newBug = await get(`SELECT * FROM bugs WHERE id = ?`, [id]);
    res.status(201).json({ ...newBug, evidencia_paths: JSON.parse(newBug.evidencia_paths) });
  } catch (error) {
    next(error);
  }
};

exports.updateBug = async (req, res, next) => {
  try {
    const { id, projectId } = req.params;
    const {
      ciclo_id, test_case_id, id_sistema, id_cu, id_cp, id_paso,
      titulo, descripcion, estado, prioridad, severidad,
      desarrollador_id, area_asignada, descripcion_resolucion,
      fecha_est_entrega, fecha_real_entrega, fecha_cierre, observaciones
    } = req.body;
    
    const b = await get(`SELECT id, estado FROM bugs WHERE id = ? AND project_id = ?`, [id, projectId]);
    if (!b) return res.status(404).json({ error: 'Bug no encontrado' });

    await run(`
      UPDATE bugs SET 
        ciclo_id = ?, test_case_id = ?, id_sistema = ?, id_cu = ?, id_cp = ?, id_paso = ?,
        titulo = ?, descripcion = ?, estado = ?, prioridad = ?, severidad = ?,
        desarrollador_id = ?, area_asignada = ?, descripcion_resolucion = ?,
        fecha_est_entrega = ?, fecha_real_entrega = ?, fecha_cierre = ?, observaciones = ?,
        actualizado_en = datetime('now')
      WHERE id = ? AND project_id = ?
    `, [
      ciclo_id || null, test_case_id || null, id_sistema, id_cu, id_cp, id_paso,
      titulo, descripcion, estado || b.estado, prioridad, severidad,
      desarrollador_id || null, area_asignada, descripcion_resolucion,
      fecha_est_entrega, fecha_real_entrega, fecha_cierre, observaciones,
      id, projectId
    ]);
    
    const updatedBug = await get(`SELECT * FROM bugs WHERE id = ?`, [id]);
    res.json({ ...updatedBug, evidencia_paths: updatedBug.evidencia_paths ? JSON.parse(updatedBug.evidencia_paths) : [] });
  } catch (error) {
    next(error);
  }
};

exports.updateEstado = async (req, res, next) => {
  try {
    const { id, projectId } = req.params;
    const { estado } = req.body;
    
    const b = await get(`SELECT id FROM bugs WHERE id = ? AND project_id = ?`, [id, projectId]);
    if (!b) return res.status(404).json({ error: 'Bug no encontrado' });

    await run(`
      UPDATE bugs SET estado = ?, actualizado_en = datetime('now')
      WHERE id = ? AND project_id = ?
    `, [estado, id, projectId]);
    
    res.json({ message: 'Estado actualizado', estado });
  } catch (error) {
    next(error);
  }
};

exports.deleteBug = async (req, res, next) => {
  try {
    const { id, projectId } = req.params;
    const b = await get(`SELECT evidencia_paths FROM bugs WHERE id = ? AND project_id = ?`, [id, projectId]);
    
    if (b && b.evidencia_paths) {
      const paths = JSON.parse(b.evidencia_paths);
      paths.forEach(p => {
        const filePath = path.join(__dirname, '../../uploads', p);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }
    
    await run(`DELETE FROM bugs WHERE id = ? AND project_id = ?`, [id, projectId]);
    res.json({ message: 'Bug eliminado' });
  } catch (error) {
    next(error);
  }
};

exports.uploadEvidencia = async (req, res, next) => {
  try {
    const { id, projectId } = req.params;
    const b = await get(`SELECT evidencia_paths FROM bugs WHERE id = ? AND project_id = ?`, [id, projectId]);
    if (!b) return res.status(404).json({ error: 'Bug no encontrado' });
    
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
    
    let currentPaths = b.evidencia_paths ? JSON.parse(b.evidencia_paths) : [];
    const newPaths = req.files.map(f => f.filename);
    currentPaths = [...currentPaths, ...newPaths];
    
    await run(`UPDATE bugs SET evidencia_paths = ? WHERE id = ? AND project_id = ?`, [JSON.stringify(currentPaths), id, projectId]);
    
    res.json({ message: 'Archivos subidos', evidencia_paths: currentPaths });
  } catch (error) {
    next(error);
  }
};

exports.deleteEvidencia = async (req, res, next) => {
  try {
    const { id, projectId, filename } = req.params;
    const b = await get(`SELECT evidencia_paths FROM bugs WHERE id = ? AND project_id = ?`, [id, projectId]);
    if (!b) return res.status(404).json({ error: 'Bug no encontrado' });
    
    let currentPaths = b.evidencia_paths ? JSON.parse(b.evidencia_paths) : [];
    currentPaths = currentPaths.filter(p => p !== filename);
    
    const filePath = path.join(__dirname, '../../uploads', filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    
    await run(`UPDATE bugs SET evidencia_paths = ? WHERE id = ? AND project_id = ?`, [JSON.stringify(currentPaths), id, projectId]);
    
    res.json({ message: 'Archivo eliminado', evidencia_paths: currentPaths });
  } catch (error) {
    next(error);
  }
};

exports.importBugs = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { ciclo: defaultCicloName, bug: bugs } = req.body; 
    const fallbackId = req.headers['x-user-id']; 

    if (!bugs || !Array.isArray(bugs)) {
      return res.status(400).json({ error: 'Formato JSON inválido. Se esperaba un arreglo "bug".' });
    }

    // Mapeadores para normalizar valores
    const mapBugEstado = (estadoRaw) => {
      if (!estadoRaw) return 'abierto';
      const val = estadoRaw.toLowerCase().trim();
      if (['abierto', 'open'].includes(val)) return 'abierto';
      if (['en progreso', 'en_progreso', 'progress'].includes(val)) return 'en_progreso';
      if (['pendiente revision', 'pendiente revisión', 'pendiente_revision', 'a revisar', 'revisar'].includes(val)) return 'pendiente_revision';
      if (['resuelto', 'resolved'].includes(val)) return 'resuelto';
      if (['cerrado', 'closed'].includes(val)) return 'cerrado';
      if (['rechazado', 'rejected'].includes(val)) return 'rechazado';
      return 'abierto';
    };

    const mapPrioridad = (valRaw) => {
      if (!valRaw) return 'media';
      const val = valRaw.toLowerCase().trim();
      if (['alta', 'high'].includes(val)) return 'alta';
      if (['media', 'medium'].includes(val)) return 'media';
      if (['baja', 'low'].includes(val)) return 'baja';
      return 'media';
    };

    const mapSeveridad = (valRaw) => {
      if (!valRaw) return 'media';
      const val = valRaw.toLowerCase().trim();
      if (['critica', 'crítica', 'critical'].includes(val)) return 'critica';
      if (['alta', 'high'].includes(val)) return 'alta';
      if (['media', 'medium'].includes(val)) return 'media';
      if (['baja', 'low'].includes(val)) return 'baja';
      return 'media';
    };

    let insertCount = 0;
    
    // Obtener usuarios mapeados por nombre
    const users = await query('SELECT id, nombre FROM users');
    const userMap = {};
    users.forEach(u => userMap[u.nombre.toLowerCase()] = u.id);

    // Obtener y mapear ciclos existentes por nombre para evitar duplicar
    const existingCiclos = await query('SELECT id, nombre FROM ciclos WHERE project_id = ?', [projectId]);
    const cicloMap = {};
    existingCiclos.forEach(c => cicloMap[c.nombre.toLowerCase()] = c.id);

    const getOrCreateCiclo = async (cicloName) => {
      if (!cicloName) return null;
      const normalized = cicloName.trim().toLowerCase();
      if (cicloMap[normalized]) return cicloMap[normalized];
      
      const newCicloId = uuidv4();
      await run('INSERT INTO ciclos (id, project_id, nombre) VALUES (?, ?, ?)', [newCicloId, projectId, cicloName.trim()]);
      cicloMap[normalized] = newCicloId;
      return newCicloId;
    };

    for (const b of bugs) {
      const id = uuidv4();
      
      let testerId = fallbackId;
      if (b.responsable_tester) {
        const foundId = userMap[b.responsable_tester.toLowerCase()];
        if (foundId) testerId = foundId;
      }

      if (!testerId && users.length > 0) {
        testerId = users[0].id;
      }

      // Obtener o crear ciclo
      const cicloName = b.ciclo || defaultCicloName;
      const cicloId = await getOrCreateCiclo(cicloName);

      // Vincular directamente con el caso de prueba si existe
      let testCaseId = null;
      if (b.id_cp) {
        const foundTc = await get(`
          SELECT id FROM test_cases 
          WHERE project_id = ? AND (id_cp = ? OR id = ?)
        `, [projectId, b.id_cp, b.id_cp]);
        if (foundTc) {
          testCaseId = foundTc.id;
        }
      }

      await run(`
        INSERT INTO bugs (
          id, project_id, ciclo_id, test_case_id, id_sistema, id_cu, id_cp, id_paso,
          titulo, descripcion, estado, prioridad, severidad, desarrollador_id,
          area_asignada, descripcion_resolucion, evidencia_paths, tester_id,
          fecha_est_entrega, fecha_real_entrega, fecha_cierre, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, projectId, cicloId, testCaseId, b.id_sistema || null, b.id_cu || null, b.id_cp || null, b.id_paso || null,
        b.titulo || 'Bug importado', b.descripcion || 'Sin descripción',
        mapBugEstado(b.estado),
        mapPrioridad(b.prioridad),
        mapSeveridad(b.severidad),
        null,
        b.area_asignada || null, b.descripcion_resolucion || null,
        b.evidencia_link ? JSON.stringify([b.evidencia_link]) : JSON.stringify([]),
        testerId,
        b.fecha_est_entrega || null, b.fecha_real_entrega || null, b.fecha_cierre || null, b.observaciones || null
      ]);
      insertCount++;
    }

    res.json({ message: `Se importaron ${insertCount} bugs correctamente.` });
  } catch (error) {
    next(error);
  }
};

exports.exportBugs = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const bugsList = await query(`
      SELECT b.*, u.nombre as tester_nombre 
      FROM bugs b
      LEFT JOIN users u ON b.tester_id = u.id
      WHERE b.project_id = ?
    `, [projectId]);

    const project = await get(`SELECT * FROM projects WHERE id = ?`, [projectId]);

    const exportedJson = {
      sistema_proyecto: project ? project.sistema : "",
      version: project ? project.version : "",
      ciclo: "",
      bug: bugsList.map(b => {
        let evidencia = "";
        if (b.evidencia_paths) {
          try {
            const arr = JSON.parse(b.evidencia_paths);
            if (arr.length > 0) evidencia = arr[0];
          } catch(e) {}
        }
        return {
          id_bug: b.id,
          id_sistema: b.id_sistema || "",
          id_cu: b.id_cu || "",
          id_cp: b.id_cp || "",
          id_paso: b.id_paso || "",
          titulo: b.titulo || "",
          descripcion: b.descripcion || "",
          estado: b.estado,
          prioridad: b.prioridad,
          severidad: b.severidad,
          ciclo: b.ciclo_id || "",
          evidencia_link: evidencia,
          responsable_tester: b.tester_nombre || "",
          fecha_detectada: b.fecha_detectada || "",
          fecha_est_entrega: b.fecha_est_entrega || "",
          area_asignada: b.area_asignada || "",
          descripcion_resolucion: b.descripcion_resolucion || "",
          fecha_real_entrega: b.fecha_real_entrega || "",
          fecha_cierre: b.fecha_cierre || "",
          observaciones: b.observaciones || ""
        };
      })
    };

    res.json(exportedJson);
  } catch (error) {
    next(error);
  }
};

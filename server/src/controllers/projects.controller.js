const { get, query, run } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

exports.getAllProjects = async (req, res, next) => {
  try {
    const projects = await query(`
      SELECT p.*, u.nombre as creador_nombre
      FROM projects p
      JOIN users u ON p.creado_por = u.id
      ORDER BY p.creado_en DESC
    `);
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await get(`
      SELECT p.*, u.nombre as creador_nombre
      FROM projects p
      JOIN users u ON p.creado_por = u.id
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(project);
  } catch (error) {
    next(error);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const { nombre, sistema, version, descripcion, estado, creado_por } = req.body;
    const id = uuidv4();
    
    await run(`
      INSERT INTO projects (id, nombre, sistema, version, descripcion, estado, creado_por)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, nombre, sistema, version, descripcion, estado || 'activo', creado_por]);
    
    const newProject = await get(`SELECT * FROM projects WHERE id = ?`, [id]);
    res.status(201).json(newProject);
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { nombre, sistema, version, descripcion, estado } = req.body;
    const { id } = req.params;
    
    const project = await get(`SELECT id FROM projects WHERE id = ?`, [id]);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    await run(`
      UPDATE projects 
      SET nombre = ?, sistema = ?, version = ?, descripcion = ?, estado = ?, actualizado_en = datetime('now')
      WHERE id = ?
    `, [nombre, sistema, version, descripcion, estado, id]);
    
    const updatedProject = await get(`SELECT * FROM projects WHERE id = ?`, [id]);
    res.json(updatedProject);
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await run(`DELETE FROM projects WHERE id = ?`, [id]);
    res.json({ message: 'Proyecto eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

exports.getProjectSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Casos
    const casosStats = await query(`
      SELECT estado, COUNT(*) as count 
      FROM test_cases 
      WHERE project_id = ? 
      GROUP BY estado
    `, [id]);
    
    // Bugs
    const bugsStats = await query(`
      SELECT estado, COUNT(*) as count 
      FROM bugs 
      WHERE project_id = ? 
      GROUP BY estado
    `, [id]);
    
    const totalCasos = casosStats.reduce((acc, curr) => acc + curr.count, 0);
    const totalBugs = bugsStats.reduce((acc, curr) => acc + curr.count, 0);
    
    res.json({
      casos: { total: totalCasos, desglose: casosStats },
      bugs: { total: totalBugs, desglose: bugsStats }
    });
  } catch (error) {
    next(error);
  }
};

// --- Ciclos ---
exports.getCiclos = async (req, res, next) => {
  try {
    const ciclos = await query(`SELECT * FROM ciclos WHERE project_id = ? ORDER BY creado_en DESC`, [req.params.projectId]);
    res.json(ciclos);
  } catch (error) {
    next(error);
  }
};

exports.createCiclo = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    const { projectId } = req.params;
    
    const id = uuidv4();
    await run(`INSERT INTO ciclos (id, project_id, nombre) VALUES (?, ?, ?)`, [id, projectId, nombre]);
    
    const newCiclo = await get(`SELECT * FROM ciclos WHERE id = ?`, [id]);
    res.status(201).json(newCiclo);
  } catch (error) {
    next(error);
  }
};

exports.deleteCiclo = async (req, res, next) => {
  try {
    const { cicloId } = req.params;
    await run(`DELETE FROM ciclos WHERE id = ?`, [cicloId]);
    res.json({ message: 'Ciclo eliminado' });
  } catch (error) {
    next(error);
  }
};

const { db, get, query, run } = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

exports.loginUser = async (req, res, next) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ error: 'El PIN es requerido' });

    const user = await get(`SELECT * FROM users WHERE pin = ? AND activo = 1`, [pin]);
    if (!user) return res.status(401).json({ error: 'PIN incorrecto o usuario inactivo' });
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await query(`SELECT * FROM users WHERE activo = 1 ORDER BY nombre ASC`);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await get(`SELECT * FROM users WHERE id = ?`, [req.params.id]);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { nombre, rol } = req.body;
    if (!nombre || !rol) return res.status(400).json({ error: 'Nombre y rol son requeridos' });
    
    const id = uuidv4();
    const pin = Math.floor(1000 + Math.random() * 9000).toString(); // Generar PIN aleatorio

    await run(`INSERT INTO users (id, nombre, rol, pin) VALUES (?, ?, ?, ?)`, [id, nombre, rol, pin]);
    
    const newUser = await get(`SELECT * FROM users WHERE id = ?`, [id]);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { nombre, rol } = req.body;
    const { id } = req.params;
    
    const user = await get(`SELECT * FROM users WHERE id = ?`, [id]);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    await run(`UPDATE users SET nombre = ?, rol = ? WHERE id = ?`, [nombre, rol, id]);
    
    const updatedUser = await get(`SELECT * FROM users WHERE id = ?`, [id]);
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await run(`UPDATE users SET activo = 0 WHERE id = ?`, [id]);
    res.json({ message: 'Usuario desactivado correctamente' });
  } catch (error) {
    next(error);
  }
};

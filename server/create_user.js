const { db } = require('./src/db/database');
const crypto = require('crypto');
const pin = Math.floor(1000 + Math.random() * 9000).toString();

try {
  db.prepare("INSERT INTO users (id, nombre, rol, pin) VALUES (?, ?, ?, ?)").run(crypto.randomUUID(), 'Tester Principal', 'tester', pin);
  console.log(`Usuario creado exitosamente con PIN: ${pin}`);
} catch (err) {
  console.error('Error creando usuario:', err);
}

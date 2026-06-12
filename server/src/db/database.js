const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// El path donde se guardará la bd
const dataDir = path.join(__dirname, '../../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'tcms.db');

// Inicializar BD
const db = new Database(dbPath, { verbose: console.log });

// Habilitar Foreign Keys
db.pragma('foreign_keys = ON');

// Función para ejecutar migraciones
const runMigrations = () => {
  // Crear tabla de migraciones si no existe
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs.readdirSync(migrationsDir).sort();
  
  for (const file of files) {
    if (file.endsWith('.sql')) {
      // Verificar si ya se aplicó
      const applied = db.prepare('SELECT id FROM migrations WHERE filename = ?').get(file);
      if (applied) continue;

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`Ejecutando migración: ${file}`);
      // Ejecutar la migración dentro de una transacción y registrarla
      db.transaction(() => {
        db.exec(sql);
        db.prepare('INSERT INTO migrations (filename) VALUES (?)').run(file);
      })();
    }
  }
};

// Ejecutar migraciones al iniciar
runMigrations();

// Exportar la instancia y métodos auxiliares para futura migración a PG
module.exports = {
  db,
  // Abstracciones para queries, permitiendo que a futuro si pasamos a postgres 
  // esto sea asíncrono y los controllers usen await (aquí resolvemos la promesa para mantener compatibilidad con async/await en los controllers)
  query: async (sql, params = []) => {
    return db.prepare(sql).all(params);
  },
  get: async (sql, params = []) => {
    return db.prepare(sql).get(params);
  },
  run: async (sql, params = []) => {
    return db.prepare(sql).run(params);
  }
};

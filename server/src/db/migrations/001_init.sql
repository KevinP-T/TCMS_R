-- migrations/001_init.sql

-- Usuarios (sin contraseña en v1)
CREATE TABLE IF NOT EXISTS users (
  id        TEXT PRIMARY KEY,          -- UUID v4
  nombre    TEXT NOT NULL,
  rol       TEXT NOT NULL CHECK(rol IN ('tester', 'desarrollador')),
  activo    INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Proyectos
CREATE TABLE IF NOT EXISTS projects (
  id           TEXT PRIMARY KEY,       -- UUID v4
  nombre       TEXT NOT NULL,
  sistema      TEXT NOT NULL,          -- Nombre del sistema/API a probar
  version      TEXT NOT NULL,
  descripcion  TEXT,
  estado       TEXT NOT NULL DEFAULT 'activo'
                CHECK(estado IN ('activo', 'pausado', 'cerrado')),
  creado_por   TEXT NOT NULL REFERENCES users(id),
  creado_en    TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_en TEXT
);

-- Ciclos de prueba (agrupan casos dentro de un proyecto)
CREATE TABLE IF NOT EXISTS ciclos (
  id          TEXT PRIMARY KEY,        -- UUID v4
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,           -- ej: "Ciclo 1", "Sprint 3"
  creado_en   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Casos de prueba
CREATE TABLE IF NOT EXISTS test_cases (
  id                  TEXT PRIMARY KEY,  -- UUID v4
  project_id          TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  ciclo_id            TEXT REFERENCES ciclos(id),
  id_cu               TEXT,              -- ID del caso de uso relacionado
  descripcion         TEXT NOT NULL,
  datos               TEXT,
  precondiciones      TEXT,              -- JSON array serializado
  prioridad           TEXT NOT NULL CHECK(prioridad IN ('alta', 'media', 'baja')),
  tipo_caso           TEXT NOT NULL CHECK(tipo_caso IN ('positivo', 'negativo', 'borde')),
  pasos               TEXT,              -- JSON array serializado
  resultados_esperados TEXT,             -- JSON array serializado
  resultados_obtenidos TEXT,             -- JSON array serializado
  post_condicion      TEXT,
  estado              TEXT NOT NULL DEFAULT 'pendiente'
                      CHECK(estado IN ('pendiente', 'pasado', 'fallido', 'bloqueado', 'no_ejecutado')),
  tester_id           TEXT NOT NULL REFERENCES users(id),
  fecha_ejecucion     TEXT,
  creado_en           TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_en      TEXT
);

-- Reportes de bug
CREATE TABLE IF NOT EXISTS bugs (
  id                     TEXT PRIMARY KEY,  -- UUID v4
  project_id             TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  ciclo_id               TEXT REFERENCES ciclos(id),
  test_case_id           TEXT REFERENCES test_cases(id),  -- nullable: bug puede crearse libre
  id_sistema             TEXT,              -- ID interno del sistema bajo prueba
  id_cu                  TEXT,
  id_cp                  TEXT,              -- ID caso de prueba (texto, por compatibilidad)
  id_paso                TEXT,              -- Paso específico donde falló
  titulo                 TEXT NOT NULL,
  descripcion            TEXT NOT NULL,
  estado                 TEXT NOT NULL DEFAULT 'abierto'
                         CHECK(estado IN ('abierto', 'en_progreso', 'pendiente_revision', 'resuelto', 'cerrado', 'rechazado')),
  prioridad              TEXT NOT NULL CHECK(prioridad IN ('alta', 'media', 'baja')),
  severidad              TEXT NOT NULL CHECK(severidad IN ('critica', 'alta', 'media', 'baja')),
  evidencia_paths        TEXT,             -- JSON array de rutas de archivos subidos
  tester_id              TEXT NOT NULL REFERENCES users(id),
  desarrollador_id       TEXT REFERENCES users(id),
  area_asignada          TEXT,
  descripcion_resolucion TEXT,
  fecha_detectada        TEXT NOT NULL DEFAULT (datetime('now')),
  fecha_est_entrega      TEXT,
  fecha_real_entrega     TEXT,
  fecha_cierre           TEXT,
  observaciones          TEXT,
  creado_en              TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_en         TEXT
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_test_cases_project ON test_cases(project_id);
CREATE INDEX IF NOT EXISTS idx_bugs_project        ON bugs(project_id);
CREATE INDEX IF NOT EXISTS idx_bugs_test_case      ON bugs(test_case_id);
CREATE INDEX IF NOT EXISTS idx_bugs_desarrollador  ON bugs(desarrollador_id);
CREATE INDEX IF NOT EXISTS idx_bugs_estado         ON bugs(estado);

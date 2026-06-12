-- migrations/004_test_case_executions.sql

-- Tabla de historial de ejecuciones de casos de prueba
CREATE TABLE IF NOT EXISTS test_case_executions (
  id                   TEXT PRIMARY KEY,  -- UUID v4
  test_case_id         TEXT NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
  estado               TEXT NOT NULL CHECK(estado IN ('pendiente', 'pasado', 'fallido', 'bloqueado', 'no_ejecutado')),
  tester_id            TEXT REFERENCES users(id),
  resultados_obtenidos TEXT,              -- JSON array de resultados/mensajes del test
  observaciones        TEXT,              -- Comentarios adicionales
  fecha_ejecucion      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Registrar un historial inicial para los casos de prueba que ya existen
-- para no tener la línea de tiempo vacía
INSERT INTO test_case_executions (id, test_case_id, estado, tester_id, fecha_ejecucion)
SELECT 
  'INIT-' || substr(id, 1, 8) || '-' || strftime('%s', 'now'),
  id, 
  estado, 
  tester_id, 
  COALESCE(fecha_ejecucion, creado_en)
FROM test_cases;

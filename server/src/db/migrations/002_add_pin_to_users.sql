-- migrations/002_add_pin_to_users.sql
ALTER TABLE users ADD COLUMN pin TEXT;

-- Generar un PIN por defecto para los usuarios existentes que no tengan
-- Para simplificar la migración usando solo SQLite nativo, 
-- usaremos abs(random()) % 9000 + 1000 que da un numero entre 1000 y 9999.
UPDATE users SET pin = CAST((abs(random()) % 9000 + 1000) AS TEXT) WHERE pin IS NULL;

-- Para asegurar que es único en SQLite no podemos hacer ALTER TABLE ADD CONSTRAINT UNIQUE
-- fácilmente sin recrear la tabla, así que crearemos un índice único.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_pin ON users(pin);

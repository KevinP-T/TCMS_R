-- migrations/003_add_id_cp.sql
ALTER TABLE test_cases ADD COLUMN id_cp TEXT;

-- Generar un id_cp por defecto para los que ya existen para evitar nulls
-- No podemos hacer la lógica completa de incremental en SQLite de forma simple con UPDATE
-- Así que simplemente le pondremos un prefijo 'CP-OLD-' + parte del UUID
UPDATE test_cases SET id_cp = 'CP-OLD-' || substr(id, 1, 8) WHERE id_cp IS NULL;

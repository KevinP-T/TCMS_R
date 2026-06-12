const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Inicializa la bd y ejecuta migraciones
require('./db/database'); 

const app = express();
const PORT = process.env.PORT || 3500;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Directorio para archivos subidos (evidencias)
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir archivos estáticos
app.use('/uploads', express.static(uploadsDir));

// Rutas (se conectarán en la siguiente fase)
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/projects', require('./routes/projects.routes'));
app.use('/api/projects', require('./routes/testCases.routes'));
app.use('/api/projects', require('./routes/bugs.routes'));
app.use('/api/reports', require('./routes/reports.routes'));

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TCMS API Running' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Arrancar servidor
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
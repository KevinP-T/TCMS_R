const express = require('express');
const router = express.Router();
const bugsController = require('../controllers/bugs.controller');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { bugSchema, estadoBugSchema } = require('../schemas/bug.schema');

// Rutas de bugs
router.get('/:projectId/bugs', bugsController.getAllBugs);
router.get('/:projectId/bugs/:id', bugsController.getBugById);
// Create bug can include files via multipart form data, so we run upload.array first, then parsing strings might be needed because form-data sends strings
router.post('/:projectId/bugs', upload.array('evidencias', 5), validate(bugSchema), bugsController.createBug);
router.put('/:projectId/bugs/:id', validate(bugSchema), bugsController.updateBug);
router.patch('/:projectId/bugs/:id/estado', validate(estadoBugSchema), bugsController.updateEstado);
router.delete('/:projectId/bugs/:id', bugsController.deleteBug);

// Rutas de evidencias de un bug específico
router.post('/:projectId/bugs/:id/evidencias', upload.array('evidencias', 5), bugsController.uploadEvidencia);
router.delete('/:projectId/bugs/:id/evidencias/:filename', bugsController.deleteEvidencia);

// Rutas de Importación/Exportación Masiva
router.post('/:projectId/bugs/import', bugsController.importBugs);
router.get('/:projectId/bugs/export', bugsController.exportBugs);

module.exports = router;

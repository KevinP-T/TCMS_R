const express = require('express');
const router = express.Router();
const testCasesController = require('../controllers/testCases.controller');
const validate = require('../middleware/validate');
const { testCaseSchema, estadoTestCaseSchema } = require('../schemas/testCase.schema');

// Se monta en /api/projects por lo que la ruta real recibe :projectId antes
router.get('/:projectId/test-cases', testCasesController.getAllTestCases);
router.get('/:projectId/test-cases/:id', testCasesController.getTestCaseById);
router.post('/:projectId/test-cases', validate(testCaseSchema), testCasesController.createTestCase);
router.put('/:projectId/test-cases/:id', validate(testCaseSchema), testCasesController.updateTestCase);
router.patch('/:projectId/test-cases/:id/estado', validate(estadoTestCaseSchema), testCasesController.updateEstado);
router.delete('/:projectId/test-cases/:id', testCasesController.deleteTestCase);

// Rutas de Importación/Exportación Masiva
router.post('/:projectId/test-cases/import', testCasesController.importTestCases);
router.get('/:projectId/test-cases/export', testCasesController.exportTestCases);

module.exports = router;

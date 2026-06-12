const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects.controller');
const validate = require('../middleware/validate');
const { projectSchema, cicloSchema } = require('../schemas/project.schema');

// Proyectos
router.get('/', projectsController.getAllProjects);
router.get('/:id', projectsController.getProjectById);
router.get('/:id/summary', projectsController.getProjectSummary);
router.post('/', validate(projectSchema), projectsController.createProject);
router.put('/:id', validate(projectSchema), projectsController.updateProject);
router.delete('/:id', projectsController.deleteProject);

// Ciclos
router.get('/:projectId/ciclos', projectsController.getCiclos);
router.post('/:projectId/ciclos', validate(cicloSchema), projectsController.createCiclo);
router.delete('/:projectId/ciclos/:cicloId', projectsController.deleteCiclo);

module.exports = router;

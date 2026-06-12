const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');

router.get('/dashboard', reportsController.getGlobalDashboard);

module.exports = router;

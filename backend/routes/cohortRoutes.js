// backend/routes/cohortRoutes.js
const express = require('express');
const router = express.Router();
const cohortController = require('../controllers/cohortController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken); // Protect all cohort routes

router.post('/', cohortController.createCohort);
router.get('/', cohortController.getAllCohorts);
router.get('/:id', cohortController.getCohortById);
router.put('/:id', cohortController.updateCohort);
router.delete('/:id', cohortController.deleteCohort);

module.exports = router;
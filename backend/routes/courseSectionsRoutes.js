// backend/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken); // Protect all course routes

// router.post('/', courseController.createCourseSection);
router.get('/', courseController.getAllCourseSections);
// router.get('/:id', courseController.getCourseSectionById);
// router.put('/:id', courseController.updateCourseSection);
// router.delete('/:id', courseController.deleteCourseSection);

module.exports = router;
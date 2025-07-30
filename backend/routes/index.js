// backend/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const cohortRoutes = require('./cohortRoutes');
const courseRoutes = require('./courseRoutes');
const courseSectionsRoutes = require('./courseSectionsRoutes');

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/cohorts', cohortRoutes);
router.use('/courses', courseRoutes);
router.use('/coursesections', courseSectionsRoutes);

// Add more routes for other entities here as you implement their controllers
// Example:
// const facilitatorRoutes = require('./facilitatorRoutes');
// router.use('/facilitators', facilitatorRoutes);

module.exports = router;
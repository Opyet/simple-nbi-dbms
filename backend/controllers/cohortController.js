// backend/controllers/cohortController.js
const db = require('../config/db');
const common = require('./commonController');

const tableName = 'Cohort';
const idColumn = 'cohortid';
const updatableColumns = ['name', 'startdate', 'enddate'];

const createCohort = async (req, res) => {
    const { name, startDate, endDate } = req.body;
    // Basic validation
    if (!name || !startDate || !endDate) {
        return res.status(400).json({ message: 'Cohort name, start date, and end date are required.' });
    }
    
    await common.create(tableName, ['name', 'startdate', 'enddate'], [name, startDate, endDate])(req, res);
};

const getAllCohorts = common.getAll(tableName);
const getCohortById = common.getById(tableName, idColumn);

const updateCohort = async (req, res) => {
    const { name, startDate, endDate } = req.body;
    // Basic validation for existing fields if provided
    if (name === undefined && startDate === undefined && endDate === undefined) {
        return res.status(400).json({ message: 'At least one field (name, startDate, endDate) is required for update.' });
    }
    await common.update(tableName, idColumn, updatableColumns)(req, res);
};

const deleteCohort = common.deleteById(tableName, idColumn);

module.exports = {
    createCohort,
    getAllCohorts,
    getCohortById,
    updateCohort,
    deleteCohort,
};
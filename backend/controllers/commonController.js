// backend/controllers/commonController.js
const db = require('../config/db');

// Generic GET ALL
const getAll = (tableName) => async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM "${tableName}"`);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(`Error getting all ${tableName}:`, err);
        res.status(500).json({ message: `Server error getting ${tableName}` });
    }
};

// Generic GET BY ID
const getById = (tableName, idColumn) => async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query(`SELECT * FROM "${tableName}" WHERE "${idColumn}" = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: `${tableName} not found` });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(`Error getting ${tableName} by ID:`, err);
        res.status(500).json({ message: `Server error getting ${tableName}` });
    }
};

// Generic CREATE
const create = (tableName, columns, values) => async (req, res) => {
    const queryColumns = columns.map(col => `"${col}"`).join(', ');
    const queryValues = values.map((_, i) => `$${i + 1}`).join(', ');
    const returningColumns = columns.includes('id') ? 'id' : (columns.find(c => c.endsWith('id')) || '*'); // Try to return the PK or all

    try {
        // console.log('req', req.body); // Debugging log
        
        console.log(`Creating ${tableName} with columns: ${queryColumns} and values: ${queryValues}`, req.body); // Debugging log
        
        // Extract values from req.body into an array
        const queryParams = Object.values(req.body);

        console.log('params', queryParams); // Debugging log
        
        const result = await db.query(
            `INSERT INTO "${tableName}" (${queryColumns}) VALUES (${queryValues}) RETURNING *`,
            queryParams
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(`Error creating ${tableName}:`, err);
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ message: `${tableName} with provided unique fields already exists.` });
        }
        res.status(500).json({ message: `Server error creating ${tableName}` });
    }
};

// Generic UPDATE
const update = (tableName, idColumn, updatableColumns) => async (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    const setClause = [];
    const queryParams = [];
    let paramIndex = 1;

    for (const col of updatableColumns) {
        if (updates[col] !== undefined) {
            setClause.push(`"${col}" = $${paramIndex}`);
            queryParams.push(updates[col]);
            paramIndex++;
        }
    }

    if (setClause.length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    queryParams.push(id); // Add ID at the end
    try {
        const result = await db.query(
            `UPDATE "${tableName}" SET ${setClause.join(', ')} WHERE "${idColumn}" = $${paramIndex} RETURNING *`,
            queryParams
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: `${tableName} not found.` });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(`Error updating ${tableName}:`, err);
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ message: `${tableName} with updated unique fields already exists.` });
        }
        res.status(500).json({ message: `Server error updating ${tableName}` });
    }
};

// Generic DELETE
const deleteById = (tableName, idColumn) => async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query(`DELETE FROM "${tableName}" WHERE "${idColumn}" = $1 RETURNING *`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: `${tableName} not found.` });
        }
        res.status(200).json({ message: `${tableName} deleted successfully.`, deleted: result.rows[0] });
    } catch (err) {
        console.error(`Error deleting ${tableName}:`, err);
        res.status(500).json({ message: `Server error deleting ${tableName}. It might have associated records.` });
    }
};


module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteById,
};
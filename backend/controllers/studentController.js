// backend/controllers/studentController.js
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Create a new student (and potentially a user)
const createStudent = async (req, res) => {
    const { username, password, surname, firstname, phone, nationality, isBornAgain } = req.body;
    let client;
    try {
        client = await db.getClient();
        await client.query('BEGIN');

        // 1. Create User
        const hashedPassword = await bcrypt.hash(password, 10);
        const userResult = await client.query(
            'INSERT INTO "Users" (username, passwordHash) VALUES ($1, $2) RETURNING userid',
            [username, hashedPassword]
        );
        const _userid = userResult.rows[0].userid;

        // 2. Create Student
        const studentResult = await client.query(
            'INSERT INTO "Student" (_userid, surname, firstname, phone, nationality, isBornAgain) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [_userid, surname, firstname, phone, nationality, isBornAgain]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: 'Student and User created successfully', student: studentResult.rows[0] });

    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('Error creating student (and user):', err);
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ message: 'Username already exists or student/user linked already.' });
        }
        res.status(500).json({ message: 'Server error creating student' });
    } finally {
        if (client) client.release();
    }
};

// Get all students (with associated user data)
const getAllStudents = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                s.studentid, s.surname, s.firstname, s.phone, s.nationality, s.isBornAgain,
                u.userid, u.username, u.lastLoginTimestamp
            FROM "Student" s
            JOIN "Users" u ON s._userid = u.userid
            ORDER BY s.surname, s.firstname
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error getting all students:', err);
        res.status(500).json({ message: 'Server error getting students' });
    }
};

// Get a single student by ID (with associated user data)
const getStudentById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`
            SELECT
                s.studentid, s.surname, s.firstname, s.phone, s.nationality, s.isBornAgain,
                u.userid, u.username, u.lastLoginTimestamp
            FROM "Student" s
            JOIN "Users" u ON s._userid = u.userid
            WHERE s.studentid = $1
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error getting student by ID:', err);
        res.status(500).json({ message: 'Server error getting student' });
    }
};

// Update a student
const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { surname, firstname, phone, nationality, isBornAgain, username } = req.body;
    let client;
    try {
        client = await db.getClient();
        await client.query('BEGIN');

        // Update Student details
        const studentUpdateQuery = `
            UPDATE "Student"
            SET surname = $1, firstname = $2, phone = $3, nationality = $4, isbornagain = $5
            WHERE studentid = $6
            RETURNING _userid;
        `;
        const studentResult = await client.query(studentUpdateQuery, [surname, firstname, phone, nationality, isBornAgain, id]);

        if (studentResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Student not found.' });
        }

        const _userid = studentResult.rows[0]._userid;

        // Update associated User's username if provided
        if (username) {
            await client.query(
                'UPDATE "Users" SET username = $1 WHERE userid = $2',
                [username, _userid]
            );
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Student and associated user updated successfully.' });

    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('Error updating student:', err);
        if (err.code === '23505') { // Unique violation on username
            return res.status(409).json({ message: 'Username already exists.' });
        }
        res.status(500).json({ message: 'Server error updating student.' });
    } finally {
        if (client) client.release();
    }
};

// Delete a student (and associated user)
const deleteStudent = async (req, res) => {
    const { id } = req.params;
    let client;
    try {
        client = await db.getClient();
        await client.query('BEGIN');

        // Get the _userid before deleting the student
        const studentResult = await client.query('SELECT _userid FROM "Student" WHERE studentid = $1', [id]);
        if (studentResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Student not found.' });
        }
        const _userid = studentResult.rows[0]._userid;

        // Deleting the user will cascade delete the student due to ON DELETE CASCADE
        await client.query('DELETE FROM "Users" WHERE userid = $1', [_userid]);

        await client.query('COMMIT');
        res.status(200).json({ message: 'Student and associated user deleted successfully.' });

    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('Error deleting student:', err);
        res.status(500).json({ message: 'Server error deleting student.' });
    } finally {
        if (client) client.release();
    }
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
};
// backend/controllers/courseController.js
const db = require('../config/db');
const common = require('./commonController');

const tableName = 'Course';
const idColumn = 'courseid';
const updatableColumns = ['title', 'code', 'description', 'units', '_sectionid', 'teachingHours'];

const createCourse = async (req, res) => {
    const { title, code, description, units, _sectionid, teachingHours, types } = req.body;
    if (!title || !code || units === undefined) {
        return res.status(400).json({ message: 'Course title, code, and units are required.' });
    }

    let client;
    try {
        client = await db.getClient();
        await client.query('BEGIN');

        const courseResult = await client.query(
            'INSERT INTO "Course" (title, code, description, units, _sectionid, teachingHours) VALUES ($1, $2, $3, $4, $5, $6) RETURNING courseid',
            [title, code, description, units, _sectionid || null, teachingHours || null]
        );
        const courseid = courseResult.rows[0].courseid;

        // Handle CourseType if provided
        if (types && Array.isArray(types) && types.length > 0) {
            for (const type of types) {
                await client.query('INSERT INTO "CourseType" (_courseid, type) VALUES ($1, $2)', [courseid, type]);
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Course created successfully', courseid: courseid });

    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('Error creating course:', err);
        if (err.code === '23505') { // Unique violation for course code
            return res.status(409).json({ message: 'Course with this code already exists.' });
        }
        res.status(500).json({ message: 'Server error creating course.' });
    } finally {
        if (client) client.release();
    }
};

const getAllCourses = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                c.courseid, c.title, c.code, c.description, c.units, c.teachinghours,
                cs.sectionName,
                ARRAY_AGG(ct.type) FILTER (WHERE ct.type IS NOT NULL) as types
            FROM "Course" c
            LEFT JOIN "CourseSection" cs ON c._sectionid = cs.sectionid
            LEFT JOIN "CourseType" ct ON c.courseid = ct._courseid
            GROUP BY c.courseid, cs.sectionName
            ORDER BY c.title
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error getting all courses:', err);
        res.status(500).json({ message: 'Server error getting courses' });
    }
};

const getAllCourseSections = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                *
            FROM "CourseSection" cs
            ORDER BY cs.sectionid
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error getting all course sections:', err);
        res.status(500).json({ message: 'Server error getting course sections' });
    }
};

const getCourseById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`
            SELECT
                c.courseid, c.title, c.code, c.description, c.units, c."_sectionid", c.teachinghours,
                cs.sectionName,
                ARRAY_AGG(ct.type) FILTER (WHERE ct.type IS NOT NULL) as types
            FROM "Course" c
            LEFT JOIN "CourseSection" cs ON c._sectionid = cs.sectionid
            LEFT JOIN "CourseType" ct ON c.courseid = ct._courseid
            WHERE c.courseid = $1
            GROUP BY c.courseid, cs.sectionName
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error getting course by ID:', err);
        res.status(500).json({ message: 'Server error getting course' });
    }
};

const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { title, code, description, units, _sectionid, teachingHours, types } = req.body;
    let client;
    try {
        client = await db.getClient();
        await client.query('BEGIN');

        const fieldsToUpdate = [];
        const queryParams = [id];
        let paramIndex = 1;

        if (title !== undefined) fieldsToUpdate.push(`title = $${++paramIndex}`); queryParams.push(title);
        if (code !== undefined) fieldsToUpdate.push(`code = $${++paramIndex}`); queryParams.push(code);
        if (description !== undefined) fieldsToUpdate.push(`description = $${++paramIndex}`); queryParams.push(description);
        if (units !== undefined) fieldsToUpdate.push(`units = $${++paramIndex}`); queryParams.push(units);
        if (_sectionid !== undefined) fieldsToUpdate.push(`_sectionid = $${++paramIndex}`); queryParams.push(_sectionid);
        if (teachingHours !== undefined) fieldsToUpdate.push(`"teachingHours" = $${++paramIndex}`); queryParams.push(teachingHours);

        if (fieldsToUpdate.length === 0 && types === undefined) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'No valid fields provided for update.' });
        }

        if (fieldsToUpdate.length > 0) {
            await client.query(
                `UPDATE "Course" SET ${fieldsToUpdate.join(', ')} WHERE courseid = $1`,
                queryParams
            );
        }

        // Update CourseType: delete existing and re-insert if 'types' array is provided
        if (types !== undefined && Array.isArray(types)) {
            await client.query('DELETE FROM "CourseType" WHERE _courseid = $1', [id]);
            for (const type of types) {
                await client.query('INSERT INTO "CourseType" (_courseid, type) VALUES ($1, $2)', [id, type]);
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Course updated successfully.' });

    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('Error updating course:', err);
        if (err.code === '23505') { // Unique violation for course code
            return res.status(409).json({ message: 'Course with this code already exists.' });
        }
        res.status(500).json({ message: 'Server error updating course.' });
    } finally {
        if (client) client.release();
    }
};


const deleteCourse = common.deleteById(tableName, idColumn); // This will cascade delete CourseType entries

module.exports = {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getAllCourseSections,
};
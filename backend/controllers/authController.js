// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../utils/jwt');

const registerUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO "Users" (username, passwordHash) VALUES ($1, $2) RETURNING userid, username',
            [username, hashedPassword]
        );
        const user = result.rows[0];
        const token = generateToken({ userid: user.userid, username: user.username });
        res.status(201).json({ message: 'User registered successfully', user, token });
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ message: 'Username already exists' });
        }
        console.error('Error during registration:', err);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const loginUser = async (req, res) => {
    
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        
        const result = await db.query('SELECT * FROM "Users" WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordhash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update lastLoginTimestamp
        await db.query('UPDATE "Users" SET lastLoginTimestamp = CURRENT_TIMESTAMP WHERE userid = $1', [user.userid]);

        const token = generateToken({ userid: user.userid, username: user.username });

        
        // Optionally, store the token in UserLogin table (for session tracking/invalidation)
        await db.query('INSERT INTO "UserLogin" (userid, token) VALUES ($1, $2) ON CONFLICT (token) DO UPDATE SET loggedAt = CURRENT_TIMESTAMP', [user.userid, token]);


        res.status(200).json({ message: 'Login successful', token, user: { userid: user.userid, username: user.username } });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
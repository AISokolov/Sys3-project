const express = require('express');
const { authUser, registerUser } = require('../services/authService');

const auth = express.Router();

auth.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await authUser(username, password);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        req.session.user = user; // Store user info in session
        return res.json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

auth.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = await registerUser(username, email, password);

        if (!user) {
            return res.status(409).json({ message: 'The user with this username or email already exists.' });
        }
        req.session.user = user; // Store user info in session
        return res.status(201).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

auth.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        return res.json({ message: 'Logged out successfully' });
    });
});

module.exports = auth;
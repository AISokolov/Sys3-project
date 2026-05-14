const db = require('../db/db');

async function authUser(username, password) {
    const [rows] = await db.query(
        `
    SELECT u_id, user_name, email, password
    FROM user
    WHERE user_name = ?
    LIMIT 1
    `,
        [username]
    );
    if (rows.length === 0 || rows[0].password !== password) {
        return null; // User not found or incorrect password
    }
    return rows[0];
}

async function registerUser(username, email, password) {
    const [existingUser] = await db.query(
        `
    SELECT u_id
    FROM user
    WHERE user_name = ? OR email = ?
    LIMIT 1
    `,
        [username, email]
    );
    if (existingUser.length > 0) {
        throw new Error('The user with this username or email already exists');
    }
    const [result] = await db.query(
        `
    INSERT INTO user (user_name, email, password)
    VALUES (?, ?, ?)
    `,
        [username, email, password]
    );
    return {
        u_id: result.insertId,
        user_name: username,
        email: email
    }
}

module.exports = {
    authUser,
    registerUser,
};

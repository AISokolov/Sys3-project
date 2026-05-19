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

    return {
        id: rows[0].u_id,
        username: rows[0].user_name,
        email: rows[0].email,
    };
}

async function registerUser(username, email, password) {
    // check if user with the same username or email already exists
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
        return null;
    }
    const [result] = await db.query(
        `
    INSERT INTO user (user_name, email, password)
    VALUES (?, ?, ?)
    `,
        [username, email, password]
    );
    return {
        id: result.insertId,
        username,
        email,
    };
}

module.exports = {
    authUser,
    registerUser,
};

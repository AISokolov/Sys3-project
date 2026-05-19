const db = require('../db/db');

async function updateProfile(id, username, email, password) {
    if (password) {
        await db.query(
            `
            UPDATE user
            SET user_name = ?, email = ?, password = ?
            WHERE u_id = ?
            `,
            [username, email, password, id]
        );
    } else {
        await db.query(
            `
            UPDATE user
            SET user_name = ?, email = ?
            WHERE u_id = ?
            `,
            [username, email, id]
        );
    }

    return {
        id,
        username,
        email,
    };
}

async function getUserSubscriptions(id) {
    const [rows] = await db.query(
        `
        SELECT
        s.sub_id AS id,
        s.billing_date,
        s.group_id,
        st.type_id,
        st.service_name AS name,
        st.description,
        st.icon_image,
        st.cost
        FROM subscription s
        JOIN subscription_type_list st ON st.type_id = s.type_id
        WHERE s.owner_id = ?
        ORDER BY s.billing_date;
        `,
        [id]
    )
    return rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        cost: Number(row.cost),
        billingDate: row.billing_date,
        groupId: row.group_id,
        image: row.icon_image
            ? `data:image/png;base64,${Buffer.from(row.icon_image).toString('base64')}` : null,
    }));
}

async function unsubscribe(id, subId) {
    const [result] = await db.query(
        `
        DELETE FROM subscription
        WHERE sub_id = ?
        AND owner_id = ?
        `,
        [subId, id]
    )
    return result.affectedRows > 0
}

module.exports = {
    updateProfile,
    getUserSubscriptions,
    unsubscribe
};

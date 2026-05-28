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
        s.owner_id,
        g.name AS group_name,
        st.type_id,
        st.service_name AS name,
        st.description,
        st.icon_image,
        st.cost
        FROM group_members gm
        JOIN subscription s ON s.group_id = gm.g_id
        JOIN \`group\` g ON g.g_id = s.group_id
        JOIN subscription_type_list st ON st.type_id = s.type_id
        WHERE gm.u_id = ?
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
        groupName: row.group_name,
        ownerId: row.owner_id,
        isOwner: Number(row.owner_id) === Number(id),
        image: row.icon_image
            ? `data:image/png;base64,${Buffer.from(row.icon_image).toString('base64')}` : null,
    }));
}

async function unsubscribe(id, subId) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [subscriptionRows] = await connection.query(
            `
            SELECT sub_id, group_id, owner_id
            FROM subscription
            WHERE sub_id = ?
            FOR UPDATE
            `,
            [subId]
        );

        if (subscriptionRows.length === 0) {
            await connection.rollback();
            return null;
        }

        const subscription = subscriptionRows[0];

        const [memberRows] = await connection.query(
            `
            SELECT u_id
            FROM group_members
            WHERE u_id = ? AND g_id = ?
            LIMIT 1
            `,
            [id, subscription.group_id]
        );

        if (memberRows.length === 0) {
            await connection.rollback();
            return null;
        }

        await connection.query(
            `
            DELETE FROM group_members
            WHERE u_id = ? AND g_id = ?
            `,
            [id, subscription.group_id]
        );

        const [remainingMembers] = await connection.query(
            `
            SELECT u_id
            FROM group_members
            WHERE g_id = ?
            ORDER BY joined_at, u_id
            FOR UPDATE
            `,
            [subscription.group_id]
        );

        if (remainingMembers.length === 0) {
            await connection.query(
                `
                DELETE FROM subscription
                WHERE group_id = ?
                `,
                [subscription.group_id]
            );

            await connection.query(
                `
                DELETE FROM \`group\`
                WHERE g_id = ?
                `,
                [subscription.group_id]
            );

            await connection.commit();
            return { groupDeleted: true };
        }

        if (Number(subscription.owner_id) === Number(id)) {
            await connection.query(
                `
                UPDATE subscription
                SET owner_id = ?
                WHERE group_id = ?
                `,
                [remainingMembers[0].u_id, subscription.group_id]
            );
        }

        await connection.commit();
        return { groupDeleted: false };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    updateProfile,
    getUserSubscriptions,
    unsubscribe
};

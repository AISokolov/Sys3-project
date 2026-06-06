const db = require('../db/db');

// Update user profile information
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
        u_id: id,
        user_name: username,
        email,
    };
}

// Helper function to handle leaving a subscription group
async function leaveSubscription(connection, id, subscription) {
    // delete notifications for the user and subscription
    await connection.query(
        `
        UPDATE notification
        SET is_deleted = 1
        WHERE user_id = ?
        AND subscription_id = ?
        AND group_id = ?
        `,
        [id, subscription.sub_id, subscription.group_id]
    );
    // delete the user from the group
    await connection.query(
        `
        DELETE FROM group_members
        WHERE u_id = ? AND g_id = ?
        `,
        [id, subscription.group_id]
    );
    // check if the group has any remaining members
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

    // If no members remain, delete the subscription and group
    if (remainingMembers.length === 0) {
        await connection.query(
            `
            DELETE FROM notification
            WHERE group_id = ?
            `,
            [subscription.group_id]
        );

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

        return { groupDeleted: true };
    }

    // If the leaving user is the owner, transfer ownership to the next member
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

    return { groupDeleted: false };
}

// Cleanup expired memberships for a user
async function cleanupExpiredMemberships(id) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [expiredRows] = await connection.query(
            `
            SELECT s.sub_id, s.group_id, s.owner_id
            FROM group_members gm
            JOIN subscription s ON s.group_id = gm.g_id
            WHERE gm.u_id = ?
            AND gm.next_payment_date < CURDATE()
            FOR UPDATE
            `,
            [id]
        );

        for (const subscription of expiredRows) {
            await leaveSubscription(connection, id, subscription);
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Get user subscriptions, ensuring expired memberships are cleaned up first
async function getUserSubscriptions(id) {
    await cleanupExpiredMemberships(id);

    const [rows] = await db.query(
        `
        SELECT
        s.sub_id AS id,
        gm.next_payment_date,
        s.group_id,
        s.owner_id,
        g.name AS group_name,
        g.service_link,
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
        ORDER BY gm.next_payment_date;
        `,
        [id]
    );
    return rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        cost: Number(row.cost),
        billingDate: row.next_payment_date,
        nextBillingDate: row.next_payment_date,
        groupId: row.group_id,
        groupName: row.group_name,
        serviceLink: row.service_link,
        ownerId: row.owner_id,
        isOwner: Number(row.owner_id) === Number(id),
        image: row.icon_image
            ? `data:image/png;base64,${Buffer.from(row.icon_image).toString('base64')}` : null,
    }));
}

// Unsubscribe from a subscription group
async function unsubscribe(id, subId) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Lock the subscription row to prevent concurrent modifications    
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

        // Check if the user is a member of the group
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

        const result = await leaveSubscription(connection, id, subscription);

        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Renew subscription for a user after payment is successful
async function renewSubscription(id, subId) {
    // get the subscription to find the group id
    const [subscriptionRows] = await db.query(
        `
        SELECT group_id
        FROM subscription
        WHERE sub_id = ?
        LIMIT 1
        `,
        [subId]
    );

    if (subscriptionRows.length === 0) {
        return null;
    }

    const groupId = subscriptionRows[0].group_id;

    // Update the next payment date for the user in the group
    const [result] = await db.query(
        `
        UPDATE group_members
        SET next_payment_date = CASE
            WHEN next_payment_date < CURDATE()
            THEN DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
            ELSE DATE_ADD(next_payment_date, INTERVAL 1 MONTH)
        END
        WHERE u_id = ?
        AND g_id = ?
        `,
        [id, groupId]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    // delete any existing notifications
    await db.query(
        `
        UPDATE notification
        SET is_deleted = 1
        WHERE user_id = ?
        AND subscription_id = ?
        AND group_id = ?
        `,
        [id, subId, groupId]
    );

    return { renewed: true };
}

module.exports = {
    updateProfile,
    getUserSubscriptions,
    unsubscribe,
    renewSubscription,
    cleanupExpiredMemberships
};

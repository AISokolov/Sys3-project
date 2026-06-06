const db = require('../db/db');
const { cleanupExpiredMemberships } = require('./profileService');

// Create billing reminders for upcoming payments
async function createBillingReminders(userId) {
    await db.query(
        `
        INSERT INTO notification (user_id, subscription_id, group_id, message)
        SELECT
            ?,
            s.sub_id,
            s.group_id,
            CONCAT(st.service_name, ' payment is due on ', DATE_FORMAT(gm.next_payment_date, '%Y-%m-%d'), '.')
        FROM group_members gm
        JOIN subscription s ON s.group_id = gm.g_id
        JOIN subscription_type_list st ON st.type_id = s.type_id
        WHERE gm.u_id = ?
        AND gm.next_payment_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND NOT EXISTS (
            SELECT 1
            FROM notification n
            WHERE n.user_id = ?
            AND n.subscription_id = s.sub_id
            AND n.group_id = s.group_id
            AND n.message = CONCAT(st.service_name, ' payment is due on ', DATE_FORMAT(gm.next_payment_date, '%Y-%m-%d'), '.')
        )
        `,
        [userId, userId, userId]
    );
}

// Get notifications for a user, ensuring expired memberships are cleaned up and billing reminders are created first
async function getNotifications(userId) {
    await cleanupExpiredMemberships(userId);
    await createBillingReminders(userId);

    const [rows] = await db.query(
        `
        SELECT notification_id, subscription_id, group_id, message, created_at
        FROM notification
        WHERE user_id = ?
        AND is_deleted = 0
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return rows.map((row) => ({
        id: row.notification_id,
        subscriptionId: row.subscription_id,
        groupId: row.group_id,
        message: row.message,
        createdAt: row.created_at,
    }));
}

//  delete a notification for a user
async function deleteNotification(userId, notificationId) {
    const [result] = await db.query(
        `
        UPDATE notification
        SET is_deleted = 1
        WHERE notification_id = ?
        AND user_id = ?
        `,
        [notificationId, userId]
    );

    return result.affectedRows > 0;
}

module.exports = {
    getNotifications,
    deleteNotification,
};

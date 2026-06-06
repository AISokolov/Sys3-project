const db = require('../db/db');

// getting groups for a specific service type
async function getGroupSub(typeId, userId) {
    const [rows] = await db.query(
        `
    SELECT
      g.g_id AS id,
      g.name,
      (
        SELECT COUNT(*)
        FROM group_members members
        WHERE members.g_id = g.g_id
      ) AS memberCount,
      EXISTS (
        SELECT 1
        FROM group_members joined_member
        WHERE joined_member.g_id = g.g_id
        AND joined_member.u_id = ?
      ) AS currentUserJoined,
      4 AS capacity
    FROM \`group\` g
    JOIN subscription s ON s.group_id = g.g_id
    WHERE s.type_id = ?
    `,
        [userId, typeId]
    );

    return rows.map((row) => ({
        id: row.id,
        name: row.name,
        memberCount: Number(row.memberCount),
        currentUserJoined: Number(row.currentUserJoined) > 0, // true if user has joined, false otherwise
        capacity: Number(row.capacity),
    }));
}

// creating a new group and subscribing the creator to it
async function createGroup(userId, name, typeId, serviceLink) {
    // Insert the new group into the database
    const [groupResult] = await db.query(
        `
        INSERT INTO \`group\` (name, service_link)
        VALUES (?, ?)
        `,
        [name, serviceLink]
    );

    const groupId = groupResult.insertId;
    // Add the creator as a member of the group
    await db.query(
        `
        INSERT INTO group_members (u_id, g_id, next_payment_date)
        VALUES (?, ?, DATE_ADD(CURDATE(), INTERVAL 1 MONTH))
        `,
        [userId, groupId]
    );
    // Create a subscription for the group with the creator as the owner
    await db.query(
        `
        INSERT INTO subscription (billing_date, owner_id, group_id, type_id)
        VALUES (DATE_ADD(CURDATE(), INTERVAL 1 MONTH), ?, ?, ?)
        `,
        [userId, groupId, typeId]
    );

    return {
        id: groupId,
        name,
        serviceLink,
        typeId,
        memberCount: 1,
        capacity: 4,
    };
}

async function joinGroup(userId, groupId) {
    // Check if the group is full (4 members)
    const [memberRows] = await db.query(
        `
        SELECT COUNT(*) AS memberCount
        FROM group_members
        WHERE g_id = ?
        `,
        [groupId]
    );

    if (Number(memberRows[0].memberCount) >= 4) {
        return null;
    }
    // Check if the user has already joined the group
    const [existingRows] = await db.query(
        `
        SELECT u_id
        FROM group_members
        WHERE u_id = ? AND g_id = ?
        LIMIT 1
        `,
        [userId, groupId]
    );

    if (existingRows.length > 0) {
        return null;
    }
    // Add the user to the group
    await db.query(
        `
        INSERT INTO group_members (u_id, g_id, next_payment_date)
        VALUES (?, ?, DATE_ADD(CURDATE(), INTERVAL 1 MONTH))
        `,
        [userId, groupId]
    );

    return {
        id: Number(groupId),
        joined: true,
    };
}
module.exports = {
    getGroupSub,
    createGroup,
    joinGroup
};

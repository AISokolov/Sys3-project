const db = require('../db/db');

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
        currentUserJoined: Number(row.currentUserJoined) > 0,
        capacity: Number(row.capacity),
    }));
}

async function createGroup(userId, name, typeId) {
    const [groupResult] = await db.query(
        `
        INSERT INTO \`group\` (name)
        VALUES (?)
        `,
        [name]
    );

    const groupId = groupResult.insertId;

    await db.query(
        `
        INSERT INTO group_members (u_id, g_id)
        VALUES (?, ?)
        `,
        [userId, groupId]
    );

    await db.query(
        `
        INSERT INTO subscription (owner_id, group_id, type_id)
        VALUES (?, ?, ?)
        `,
        [userId, groupId, typeId]
    );

    return {
        id: groupId,
        name,
        typeId,
        memberCount: 1,
        capacity: 4,
    };
}

async function joinGroup(userId, groupId) {
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

    await db.query(
        `
        INSERT INTO group_members (u_id, g_id)
        VALUES (?, ?)
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

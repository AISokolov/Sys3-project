const express = require('express');
const { getGroupSub, createGroup, joinGroup } = require('../services/groupService');
const { cleanupExpiredMemberships } = require('../services/profileService');

const group = express.Router();

// get groups for a specific service type
group.get('/service/:typeId', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const typeId = req.params.typeId;
    const userId = req.session.user.u_id;

    try {
        await cleanupExpiredMemberships(userId);
        const groups = await getGroupSub(typeId, userId);
        return res.json(groups);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to load groups' });
    }
});

// Create a new subscription group
group.post('/', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.session.user.u_id;
    const { name, typeId, serviceLink } = req.body;

    if (!name || !typeId || !serviceLink) {
        return res.status(400).json({ message: 'Group name, service type, and service link are required' });
    }

    try {
        const newGroup = await createGroup(userId, name, typeId, serviceLink);
        return res.status(201).json(newGroup);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create group' });
    }
});

// Join an existing subscription group
group.post('/:groupId/join', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.session.user.u_id;
    const groupId = req.params.groupId;

    try {
        const joinedGroup = await joinGroup(userId, groupId);

        if (!joinedGroup) {
            return res.status(400).json({ message: 'Group is full or you already joined it' });
        }

        return res.json(joinedGroup);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to join group' });
    }
});

module.exports = group;

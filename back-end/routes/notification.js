const express = require('express');
const { getNotifications, deleteNotification } = require('../services/notificationService');

const notification = express.Router();

// Get notifications for the current user
notification.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.session.user.u_id;

    try {
        const notifications = await getNotifications(userId);
        return res.json(notifications);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to load notifications' });
    }
});

// Delete a notification for the current user
notification.delete('/:notificationId', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.session.user.u_id;
    const notificationId = req.params.notificationId;

    try {
        const deleted = await deleteNotification(userId, notificationId);

        if (!deleted) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        return res.json({ message: 'Notification deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete notification' });
    }
});

module.exports = notification;

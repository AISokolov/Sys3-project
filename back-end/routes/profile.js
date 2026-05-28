const express = require('express');
const { updateProfile, getUserSubscriptions, unsubscribe } = require('../services/profileService');

const profile = express.Router();

profile.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json(req.session.user);
});

profile.put('/', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { username, email, password } = req.body;
    const userId = req.session.user.id || req.session.user.u_id;

    if (!username || !email) {
        return res.status(400).json({ message: 'Username and email are required' });
    }

    try {
        const updatedUser = await updateProfile(userId, username, email, password);
        req.session.user = updatedUser; // Update session with new user data
        return res.json(updatedUser);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update profile' });
    }
});

profile.get('/subscriptions', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const id = req.session.user.id || req.session.user.u_id;

    try {
        const subscriptions = await getUserSubscriptions(id)
        return res.json(subscriptions)
    } catch (error) {
        return res.status(500).json({ message: 'Failed to get subscriptions' });
    }
})

profile.delete('/subscriptions/:subId', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const id = req.session.user.id || req.session.user.u_id;
    const subId = req.params.subId

    try {
        const unsubscribeResult = await unsubscribe(id, subId)
        if (!unsubscribeResult) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        return res.json({
            message: 'Unsubscribed successfully',
            groupDeleted: unsubscribeResult.groupDeleted,
        })
    } catch (error) {
        return res.status(500).json({ message: 'Failed to unsubscribe' });
    }
})

module.exports = profile;

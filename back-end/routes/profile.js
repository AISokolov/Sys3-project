const express = require('express');
const { updateProfile, getUserSubscriptions, unsubscribe, renewSubscription } = require('../services/profileService');

const profile = express.Router();

// Get current user's profile information
profile.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json(req.session.user);
});

// Update user profile information
profile.put('/', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { username, email, password } = req.body;
    const userId = req.session.user.u_id;

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

// Get current user's subscriptions
profile.get('/subscriptions', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const id = req.session.user.u_id;

    try {
        const subscriptions = await getUserSubscriptions(id)
        return res.json(subscriptions)
    } catch (error) {
        return res.status(500).json({ message: 'Failed to get subscriptions' });
    }
})

// Leave a subscription group
profile.delete('/subscriptions/:subId', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const id = req.session.user.u_id;
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

// Renew a subscription
profile.post('/subscriptions/:subId/pay', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const id = req.session.user.u_id;
    const subId = req.params.subId

    try {
        const renewResult = await renewSubscription(id, subId)
        if (!renewResult) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        return res.json({ message: 'Subscription renewed' })
    } catch (error) {
        return res.status(500).json({ message: 'Failed to renew subscription' });
    }
})

module.exports = profile;

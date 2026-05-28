const express = require('express');
const { getPaymentMethods, savePaymentMethod } = require('../services/paymentService');

const payment = express.Router();

payment.get('/methods', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.session.user.id || req.session.user.u_id;

    try {
        const methods = await getPaymentMethods(userId);
        return res.json(methods);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to load payment methods' });
    }
});

payment.post('/methods', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.session.user.id || req.session.user.u_id;
    const { cardHolder, cardNumber, expirationDate } = req.body;

    try {
        const method = await savePaymentMethod(userId, cardHolder, cardNumber, expirationDate);

        if (!method) {
            return res.status(400).json({ message: 'Card holder, card number, and expiration date are required' });
        }

        return res.status(201).json(method);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to save payment method' });
    }
});

module.exports = payment;

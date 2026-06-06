const db = require('../db/db');

function onlyDigits(value) {
    return String(value || '').replace(/\D/g, '');
}

function formatExpiry(expiry) {
    const expiryDigits = String(expiry).padStart(4, '0');
    return `${expiryDigits.slice(0, 2)}/${expiryDigits.slice(2)}`;
}

// Get all payment methods for a user
async function getPaymentMethods(userId) {
    const [rows] = await db.query(
        `
        SELECT payment_id, card_holder, card_number, card_experity_date
        FROM payment_method
        WHERE user_id = ?
        ORDER BY payment_id DESC
        `,
        [userId]
    );

    return rows.map((row) => ({
        id: row.payment_id,
        cardHolder: row.card_holder,
        cardLastFour: String(row.card_number).padStart(4, '0'),
        expirationDate: formatExpiry(row.card_experity_date),
    }));
}

// Save a new payment method for a user
async function savePaymentMethod(userId, cardHolder, cardNumber, expirationDate) {
    const cardDigits = onlyDigits(cardNumber);
    const expiryDigits = onlyDigits(expirationDate);

    if (!cardHolder || cardDigits.length < 4 || expiryDigits.length !== 4) {
        return null;
    }

    const cardLastFour = cardDigits.slice(-4);

    const [result] = await db.query(
        `
        INSERT INTO payment_method (user_id, card_holder, card_number, card_experity_date)
        VALUES (?, ?, ?, ?)
        `,
        [userId, cardHolder, Number(cardLastFour), Number(expiryDigits)]
    );

    return {
        id: result.insertId,
        cardHolder,
        cardLastFour,
        expirationDate: formatExpiry(expiryDigits),
    };
}

module.exports = {
    getPaymentMethods,
    savePaymentMethod,
};

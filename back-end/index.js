const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const servicesRoutes = require('./routes/services');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const groupRoutes = require('./routes/group');
const paymentRoutes = require('./routes/payment');
const notificationRoutes = require('./routes/notification');
const session = require('express-session')

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
//allowing cross-origin requests from the frontend
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    }),
);

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    rolling: true, // after the last activity
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 15, // 15 minutes timeout
    },
}));

app.use(express.json());

app.use('/services', servicesRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/groups', groupRoutes);
app.use('/payments', paymentRoutes);
app.use('/notifications', notificationRoutes);

app.listen(process.env.PORT || 3001, () => {
    console.log(`Backend server is running on port ${process.env.PORT || 3001}`);
});

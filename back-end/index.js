const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const servicesRoutes = require('./routes/services');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const session = require('express-session')

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

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
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 15, // 15 minutes timeout
    },
}));

app.use(express.json());

app.use('/services', servicesRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

app.listen(process.env.PORT || 3001, () => {
    console.log(`Backend server is running on port ${process.env.PORT || 3001}`);
});

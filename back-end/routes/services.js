const express = require('express');
const { getAllServices } = require('../services/servicesService');

const services = express.Router();

services.get('/', async (req, res) => {
  try {
    const services = await getAllServices();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load services.' });
  }
});

module.exports = services;
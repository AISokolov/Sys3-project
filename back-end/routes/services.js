const express = require('express');
const { addService, getAllServices } = require('../services/servicesService');

const services = express.Router();

// Get all available subscription services
services.get('/', async (req, res) => {
  try {
    const services = await getAllServices();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load services.' });
  }
});

// Add a new subscription service
services.post('/', async (req, res) => {
  const { name, description, icon, cost } = req.body;
  if (!name || !cost) {
    return res.status(400).json({ message: 'Name and cost are required.' });
  }
  try {
    const newService = await addService(name, description || null, icon, cost);
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add service.' });
  }
});

module.exports = services;

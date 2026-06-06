const db = require('../db/db');

// Get all available subscription services
async function getAllServices() {
  const [rows] = await db.query(`
    SELECT
      type_id,
      service_name,
      description,
      icon_image,
      cost
    FROM subscription_type_list
    ORDER BY service_name
  `);

  return rows.map((row) => ({
    id: row.type_id,
    name: row.service_name,
    description: row.description,
    cost: Number(row.cost),
    image: row.icon_image
      ? `data:image/png;base64,${Buffer.from(row.icon_image).toString('base64')}`
      : null,
  }));
}

// add a new subscription service
async function addService(name, description, icon, cost) {
  const imageBuffer = icon ? Buffer.from(icon, 'base64') : null;

  const [result] = await db.query(`
    INSERT INTO subscription_type_list (service_name, description, icon_image, cost)
    VALUES (?, ?, ?, ?)
  `, [name, description, imageBuffer, cost]);

  return {
    id: result.insertId,
    name,
    description,
    cost: Number(cost),
    image: icon ? `data:image/png;base64,${icon}` : null,
  };
}

module.exports = {
  addService,
  getAllServices,
};

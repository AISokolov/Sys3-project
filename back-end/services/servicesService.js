const db = require('../db/db');

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

module.exports = {
  getAllServices,
};

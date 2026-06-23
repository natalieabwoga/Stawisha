module.exports = async function (fastify, opts) {
  
  // GET /api/physiotherapists
  // Fetch list of verified physiotherapists
  fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { q, location, specialty } = request.query;
    
    let query = 'SELECT id, first_name, last_name, email, phone, license_number, role, clinic FROM physiotherapists WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (q) {
      query += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR clinic ILIKE $${paramIndex})`;
      values.push(`%${q}%`);
      paramIndex++;
    }

    if (specialty) {
      query += ` AND role ILIKE $${paramIndex}`;
      values.push(`%${specialty}%`);
      paramIndex++;
    }
    
    try {
      const client = await fastify.pg.connect();
      const { rows } = await client.query(query, values);
      client.release();
      
      // Map database rows to what the frontend expects
      const providers = rows.map(row => {
        // Since 'location' and 'availability' aren't in the DB schema, we provide defaults for the UI.
        const mockLocation = row.id % 2 === 0 ? 'Nairobi' : 'Mombasa';
        const mockAvailability = row.id % 3 === 0 ? 'Limited' : 'Available';
        
        return {
          ...row,
          location: mockLocation,
          availability: mockAvailability,
          specialty: row.role
        };
      });

      // Simple location filter in memory since it's mocked
      const filteredProviders = location 
        ? providers.filter(p => p.location.toLowerCase() === location.toLowerCase())
        : providers;

      return { providers: filteredProviders };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch physiotherapists' });
    }
  });

};

module.exports = async function (fastify, opts) {
  
  // GET /api/physiotherapists
  // Fetch list of verified physiotherapists
  fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { q, location, specialty } = request.query;
    
    let query = "SELECT id, first_name, last_name, email, phone, license_number, role, gender, clinic, location, availability, verification_status FROM physiotherapists WHERE 1=1";
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

    if (location) {
      query += ` AND location ILIKE $${paramIndex}`;
      values.push(`%${location}%`);
      paramIndex++;
    }
    
    try {
      const client = await fastify.pg.connect();
      const { rows } = await client.query(query, values);
      client.release();
      
      const providers = rows.map(row => ({
        ...row,
        specialty: row.role
      }));

      return { providers };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch physiotherapists' });
    }
  });
  // PUT /api/physiotherapists/me
  // Update physiotherapist profile
  fastify.put('/me', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'physiotherapist' && request.user.role !== 'physio') {
      return reply.code(403).send({ error: 'Only physiotherapists can update their profile here.' });
    }

    const { 
      first_name, 
      last_name, 
      phone, 
      license_number, 
      gender, 
      role, 
      clinic, 
      location 
    } = request.body;
    
    const physioId = request.user.id;

    const client = await fastify.pg.connect();
    try {
      const { rows } = await client.query(
        `UPDATE physiotherapists 
         SET first_name = $1, 
             last_name = $2, 
             phone = $3, 
             license_number = $4, 
             gender = $5, 
             role = $6, 
             clinic = $7, 
             location = $8
         WHERE id = $9 
         RETURNING id, email, first_name, last_name, phone, license_number, role, gender, clinic, location, availability, verification_status`,
        [first_name, last_name, phone, license_number, gender, role, clinic, location, physioId]
      );

      if (rows.length === 0) {
        return reply.code(404).send({ error: 'Physiotherapist not found' });
      }

      // Generate a new JWT token with updated info just in case
      const token = fastify.jwt.sign({ 
        id: rows[0].id, 
        email: rows[0].email, 
        role: 'physiotherapist' 
      });

      return reply.send({ message: 'Profile updated successfully', user: rows[0], token });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to update profile' });
    } finally {
      client.release();
    }
  });

};

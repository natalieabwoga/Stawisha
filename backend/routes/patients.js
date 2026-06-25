module.exports = async function (fastify, opts) {
  // PUT /api/patients/me
  fastify.put('/me', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'patient' && request.user.userType !== 'patient') {
      return reply.code(403).send({ error: 'Only patients can update their profile.' });
    }

    const { first_name, last_name, phone, gender, address } = request.body;
    let { date_of_birth } = request.body;
    const patientId = request.user.id;

    if (date_of_birth === '') {
      date_of_birth = null;
    }

    try {
      const client = await fastify.pg.connect();
      const { rows } = await client.query(
        `UPDATE patients 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             phone = COALESCE($3, phone),
             date_of_birth = COALESCE($4, date_of_birth),
             gender = COALESCE($5, gender),
             address = COALESCE($6, address)
         WHERE id = $7
         RETURNING id, email, first_name, last_name, phone, date_of_birth, gender, address`,
        [first_name, last_name, phone, date_of_birth, gender, address, patientId]
      );
      client.release();

      if (rows.length === 0) {
        return reply.code(404).send({ error: 'Patient not found' });
      }

      // Generate a new token with updated details so the frontend can stay in sync
      const user = { ...rows[0], role: 'patient' };
      const token = fastify.jwt.sign(user);

      return { success: true, user, token };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to update profile' });
    }
  });

  // GET /api/patients
  fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'physiotherapist') {
      return reply.code(403).send({ error: 'Only physiotherapists can view patients.' });
    }
    try {
      const client = await fastify.pg.connect();
      const { rows } = await client.query('SELECT id, first_name, last_name, email, phone FROM patients ORDER BY last_name ASC');
      client.release();
      return { patients: rows };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch patients' });
    }
  });
};

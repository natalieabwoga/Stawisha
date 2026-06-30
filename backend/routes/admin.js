module.exports = async function (fastify, opts) {
  // Middleware to ensure the user is an admin
  const verifyAdmin = async (request, reply) => {
    try {
      await fastify.authenticate(request, reply);
      if (request.user.role !== 'admin') {
        return reply.code(403).send({ error: 'Forbidden: Admins only' });
      }
    } catch (err) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  };

  // GET /api/admin/stats
  fastify.get('/stats', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const patientCount = await client.query('SELECT COUNT(*) FROM patients');
      const physioCount = await client.query('SELECT COUNT(*) FROM physiotherapists');
      const referralCount = await client.query('SELECT COUNT(*) FROM referrals');
      
      return {
        stats: {
          patients: parseInt(patientCount.rows[0].count),
          physiotherapists: parseInt(physioCount.rows[0].count),
          referrals: parseInt(referralCount.rows[0].count)
        }
      };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch stats' });
    } finally {
      client.release();
    }
  });

  // GET /api/admin/patients
  fastify.get('/patients', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const { rows } = await client.query('SELECT id, first_name, last_name, email, phone, gender, created_at FROM patients ORDER BY created_at DESC');
      return { patients: rows };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch patients' });
    } finally {
      client.release();
    }
  });

  // GET /api/admin/physiotherapists
  fastify.get('/physiotherapists', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const { rows } = await client.query('SELECT id, first_name, last_name, email, phone, license_number, clinic, verification_status, created_at FROM physiotherapists ORDER BY created_at DESC');
      return { physiotherapists: rows };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch physiotherapists' });
    } finally {
      client.release();
    }
  });

  // GET /api/admin/referrals
  fastify.get('/referrals', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const query = `
        SELECT 
          r.id, r.status, r.urgency, r.created_at, r.reason,
          p.first_name AS patient_first, p.last_name AS patient_last,
          ph.first_name AS physio_first, ph.last_name AS physio_last
        FROM referrals r
        LEFT JOIN patients p ON r.patient_id = p.id
        LEFT JOIN physiotherapists ph ON r.receiving_physio_id = ph.id
        ORDER BY r.created_at DESC
      `;
      const { rows } = await client.query(query);
      return { referrals: rows };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch referrals' });
    } finally {
      client.release();
    }
  });
  // DELETE /api/admin/patients/:id
  fastify.delete('/patients/:id', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const { id } = request.params;
      const res = await client.query('DELETE FROM patients WHERE id = $1 RETURNING id', [id]);
      if (res.rows.length === 0) {
        return reply.code(404).send({ error: 'Patient not found' });
      }
      return { success: true, message: 'Patient deleted successfully' };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to delete patient' });
    } finally {
      client.release();
    }
  });

  // DELETE /api/admin/physiotherapists/:id
  fastify.delete('/physiotherapists/:id', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const { id } = request.params;
      const res = await client.query('DELETE FROM physiotherapists WHERE id = $1 RETURNING id', [id]);
      if (res.rows.length === 0) {
        return reply.code(404).send({ error: 'Physiotherapist not found' });
      }
      return { success: true, message: 'Physiotherapist deleted successfully' };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to delete physiotherapist' });
    } finally {
      client.release();
    }
  });
};

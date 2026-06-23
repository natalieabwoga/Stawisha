module.exports = async function (fastify, opts) {
  
  // GET /api/referrals
  fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user;
    
    let query = `
      SELECT r.id, r.status, r.created_at,
             p.first_name AS patient_first_name, p.last_name AS patient_last_name,
             ph.first_name AS receiving_first_name, ph.last_name AS receiving_last_name,
             ph.clinic AS receiving_clinic
      FROM referrals r
      LEFT JOIN patients p ON r.patient_id = p.id
      LEFT JOIN physiotherapists ph ON r.receiving_physio_id = ph.id
    `;
    const values = [user.id];

    if (user.role === 'patient') {
      query += ` WHERE r.patient_id = $1`;
    } else {
      query += ` WHERE (r.referring_physio_id = $1 OR r.receiving_physio_id = $1)`;
    }

    try {
      const client = await fastify.pg.connect();
      const { rows } = await client.query(query, values);
      client.release();
      return { referrals: rows };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch referrals' });
    }
  });

  // GET /api/referrals/:id
  fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      const client = await fastify.pg.connect();
      const { rows } = await client.query(`
        SELECT r.*,
               p.first_name AS patient_first_name, p.last_name AS patient_last_name, p.phone AS patient_phone,
               ph.first_name AS receiving_first_name, ph.last_name AS receiving_last_name, ph.clinic AS receiving_clinic,
               cr.diagnosis, cr.treatment_plan
        FROM referrals r
        LEFT JOIN patients p ON r.patient_id = p.id
        LEFT JOIN physiotherapists ph ON r.receiving_physio_id = ph.id
        LEFT JOIN clinical_records cr ON cr.referral_id = r.id
        WHERE r.id = $1
      `, [id]);
      client.release();
      
      if (rows.length === 0) return reply.code(404).send({ error: 'Referral not found' });
      return { referral: rows[0] };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch referral' });
    }
  });

  // POST /api/referrals
  fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { patientId, receivingPhysioId, diagnosis, treatmentPlan } = request.body;
    const referringPhysioId = request.user.role === 'physiotherapist' ? request.user.id : null;
    
    const client = await fastify.pg.connect();
    try {
      await client.query('BEGIN');
      const refRes = await client.query(
        'INSERT INTO referrals (patient_id, referring_physio_id, receiving_physio_id, status) VALUES ($1, $2, $3, $4) RETURNING id',
        [patientId || request.user.id, referringPhysioId, receivingPhysioId, 'pending']
      );
      const referralId = refRes.rows[0].id;
      
      await client.query(
        'INSERT INTO clinical_records (referral_id, diagnosis, treatment_plan) VALUES ($1, $2, $3)',
        [referralId, diagnosis || 'Transfer Request', treatmentPlan || '']
      );
      
      await client.query('COMMIT');
      return { success: true, id: referralId };
    } catch (err) {
      await client.query('ROLLBACK');
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to create referral' });
    } finally {
      client.release();
    }
  });

  // POST /api/referrals/transfer
  fastify.post('/transfer', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { destinationLocation, reason, urgency } = request.body;
    const patientId = request.user.id;
    
    const client = await fastify.pg.connect();
    try {
      await client.query('BEGIN');
      const refRes = await client.query(
        'INSERT INTO referrals (patient_id, status) VALUES ($1, $2) RETURNING id',
        [patientId, 'pending']
      );
      const referralId = refRes.rows[0].id;
      
      await client.query(
        'INSERT INTO clinical_records (referral_id, diagnosis, treatment_plan) VALUES ($1, $2, $3)',
        [referralId, `Transfer to ${destinationLocation} (${urgency})`, reason]
      );
      
      await client.query('COMMIT');
      return { success: true, id: referralId };
    } catch (err) {
      await client.query('ROLLBACK');
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to create transfer request' });
    } finally {
      client.release();
    }
  });

  // PATCH /api/referrals/:id/status
  fastify.patch('/:id/status', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;
    
    try {
      const client = await fastify.pg.connect();
      await client.query('UPDATE referrals SET status = $1 WHERE id = $2', [status, id]);
      client.release();
      return { success: true };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to update status' });
    }
  });
};

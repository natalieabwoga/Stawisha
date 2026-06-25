const util = require('util');
const path = require('path');
const fs = require('fs');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);

module.exports = async function (fastify, opts) {
  
  // GET /api/referrals
  fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user;
    
    let query = `
      SELECT r.id, r.status, r.created_at, r.destination_location,
             p.first_name AS patient_first_name, p.last_name AS patient_last_name,
             ph.first_name AS receiving_first_name, ph.last_name AS receiving_last_name,
             ph.clinic AS receiving_clinic,
             rph.first_name AS referring_first_name, rph.last_name AS referring_last_name
      FROM referrals r
      LEFT JOIN patients p ON r.patient_id = p.id
      LEFT JOIN physiotherapists ph ON r.receiving_physio_id = ph.id
      LEFT JOIN physiotherapists rph ON r.referring_physio_id = rph.id
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
               p.first_name AS patient_first_name, p.last_name AS patient_last_name, p.phone AS patient_phone, p.email AS patient_email, p.address AS patient_address, p.date_of_birth AS patient_dob, p.gender AS patient_gender,
               rp.first_name AS referring_first_name, rp.last_name AS referring_last_name, rp.clinic AS referring_clinic,
               ph.first_name AS receiving_first_name, ph.last_name AS receiving_last_name, ph.clinic AS receiving_clinic, ph.phone AS receiving_phone, ph.email AS receiving_email,
               cr.diagnosis, cr.treatment_plan, cr.exercise_protocol, cr.functional_assessment, cr.pain_mapping, cr.notes, cr.documents, cr.created_at as record_created_at
        FROM referrals r
        LEFT JOIN patients p ON r.patient_id = p.id
        LEFT JOIN physiotherapists rp ON r.referring_physio_id = rp.id
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
    // Determine if the request is multipart
    if (!request.isMultipart()) {
      return reply.code(400).send({ error: 'Request is not multipart' });
    }

    const parts = request.parts();
    const fields = {};
    const documents = [];

    for await (const part of parts) {
      if (part.type === 'file') {
        const filename = `${Date.now()}-${part.filename}`;
        const destPath = path.join(__dirname, '../public/uploads', filename);
        await pump(part.file, fs.createWriteStream(destPath));
        documents.push({ name: part.filename, url: `/uploads/${filename}` });
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    const { 
      referralId, patientId, receivingPhysioId, destinationLocation, reason, urgency,
      diagnosis, treatmentPlan, exerciseProtocol, functionalAssessment, painMapping, notes 
    } = fields;

    const referringPhysioId = request.user.role === 'physiotherapist' ? request.user.id : null;
    
    const client = await fastify.pg.connect();
    try {
      await client.query('BEGIN');

      let refId = referralId;
      if (referralId) {
        // Updating an existing patient request
        await client.query(
          'UPDATE referrals SET receiving_physio_id = $1, status = $2, destination_location = COALESCE($3, destination_location), reason = COALESCE($4, reason) WHERE id = $5',
          [receivingPhysioId, 'pending', destinationLocation || null, reason || null, referralId]
        );
        // Also update the clinical_records that might exist (though it should be empty for a patient request, we'll insert or update)
        // Check if a clinical record exists
        const crCheck = await client.query('SELECT id, documents FROM clinical_records WHERE referral_id = $1', [referralId]);
        let existingDocs = [];
        if (crCheck.rows.length > 0) {
           existingDocs = crCheck.rows[0].documents || [];
           const mergedDocs = [...existingDocs, ...documents];
           await client.query(
             `UPDATE clinical_records SET diagnosis = $1, treatment_plan = $2, exercise_protocol = $3, functional_assessment = $4, pain_mapping = $5, notes = $6, documents = $7 WHERE referral_id = $8`,
             [diagnosis || 'Transfer Request', treatmentPlan || '', exerciseProtocol || '', functionalAssessment || '', painMapping || '', notes || '', JSON.stringify(mergedDocs), referralId]
           );
        } else {
           await client.query(
             `INSERT INTO clinical_records 
              (referral_id, diagnosis, treatment_plan, exercise_protocol, functional_assessment, pain_mapping, notes, documents) 
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
             [referralId, diagnosis || 'Transfer Request', treatmentPlan || '', exerciseProtocol || '', functionalAssessment || '', painMapping || '', notes || '', JSON.stringify(documents)]
           );
        }
      } else {
        // Creating a brand new referral from physiotherapist
        const refRes = await client.query(
          'INSERT INTO referrals (patient_id, referring_physio_id, receiving_physio_id, status, destination_location, reason, urgency) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          [patientId || request.user.id, referringPhysioId, receivingPhysioId, 'pending', destinationLocation || null, reason || null, urgency || 'standard']
        );
        refId = refRes.rows[0].id;
        
        await client.query(
          `INSERT INTO clinical_records 
           (referral_id, diagnosis, treatment_plan, exercise_protocol, functional_assessment, pain_mapping, notes, documents) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            refId, 
            diagnosis || 'Transfer Request', 
            treatmentPlan || '',
            exerciseProtocol || '',
            functionalAssessment || '',
            painMapping || '',
            notes || '',
            JSON.stringify(documents)
          ]
        );
      }
      
      // Notify the receiving physio
      if (receivingPhysioId) {
        await client.query(
          'INSERT INTO notifications (user_id, user_type, message, type) VALUES ($1, $2, $3, $4)',
          [receivingPhysioId, 'physiotherapist', `You have received a new referral (REF${String(refId).padStart(3, '0')}).`, 'new_referral']
        );
      }

      await client.query('COMMIT');
      return { success: true, id: refId };
    } catch (err) {
      await client.query('ROLLBACK');
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to process referral submission' });
    } finally {
      client.release();
    }
  });

  // POST /api/referrals/transfer
  fastify.post('/transfer', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { destinationLocation, reason, urgency, referringPhysioId } = request.body;
    const patientId = request.user.id;
    
    const client = await fastify.pg.connect();
    try {
      await client.query('BEGIN');
      const refRes = await client.query(
        'INSERT INTO referrals (patient_id, referring_physio_id, status, destination_location, reason, urgency) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [patientId, referringPhysioId || null, 'patient_request', destinationLocation, reason, urgency || 'standard']
      );
      const referralId = refRes.rows[0].id;
      
      // Create an empty clinical record so it can be updated later
      await client.query(
        'INSERT INTO clinical_records (referral_id, diagnosis, treatment_plan) VALUES ($1, $2, $3)',
        [referralId, 'Patient Request', '']
      );
      
      if (referringPhysioId) {
        await client.query(
          'INSERT INTO notifications (user_id, user_type, message, type) VALUES ($1, $2, $3, $4)',
          [referringPhysioId, 'physiotherapist', `You have received a new patient transfer request (REF${String(referralId).padStart(3, '0')}).`, 'patient_request']
        );
      }
      
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
      
      // Get referral to find parties for notification
      const { rows } = await client.query('SELECT patient_id, referring_physio_id, receiving_physio_id FROM referrals WHERE id = $1', [id]);
      if (rows.length === 0) {
        client.release();
        return reply.code(404).send({ error: 'Referral not found' });
      }
      const ref = rows[0];

      await client.query('UPDATE referrals SET status = $1 WHERE id = $2', [status, id]);
      
      // Notify parties
      const msg = `Referral REF${String(id).padStart(3, '0')} status updated to ${status}.`;
      await client.query('INSERT INTO notifications (user_id, user_type, message, type) VALUES ($1, $2, $3, $4)', [ref.patient_id, 'patient', msg, 'status_update']);
      if (ref.referring_physio_id) {
        await client.query('INSERT INTO notifications (user_id, user_type, message, type) VALUES ($1, $2, $3, $4)', [ref.referring_physio_id, 'physiotherapist', msg, 'status_update']);
      }

      client.release();
      return { success: true };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to update status' });
    }
  });
};

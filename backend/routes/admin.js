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

  // PUT /api/admin/physiotherapists/:id/verify
  fastify.put('/physiotherapists/:id/verify', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const client = await fastify.pg.connect();
    try {
      const { id } = request.params;
      const res = await client.query(
        "UPDATE physiotherapists SET verification_status = 'verified' WHERE id = $1 RETURNING id, first_name, email",
        [id]
      );
      if (res.rows.length === 0) {
        return reply.code(404).send({ error: 'Physiotherapist not found' });
      }

      const physio = res.rows[0];

      // Send verification email
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      try {
        await transporter.sendMail({
          from: `"Stawisha Admin" <${process.env.EMAIL_USER}>`,
          to: physio.email,
          subject: 'Stawisha - Account Verified!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
              <h2 style="color: #10B981;">Account Verified</h2>
              <p style="color: #4B5563; font-size: 16px;">Hello Dr. ${physio.first_name},</p>
              <p style="color: #4B5563; font-size: 16px;">Great news! Your professional credentials have been successfully verified by our administration team.</p>
              <p style="color: #4B5563; font-size: 16px;">You can now log in to your Stawisha dashboard and begin receiving patient referrals.</p>
              <a href="http://localhost:3002/login" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Log In Now</a>
            </div>
          `
        });
      } catch (emailErr) {
        fastify.log.error('Failed to send verification email:', emailErr);
        // Continue even if email fails, so we don't return an error to the admin
      }

      return { success: true, message: 'Physiotherapist verified successfully' };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to verify physiotherapist' });
    } finally {
      client.release();
    }
  });
};

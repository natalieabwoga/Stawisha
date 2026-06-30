// backend/routes/auth.js
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function authRoutes(fastify, options) {
  
  // 1. REGISTRATION ENDPOINT
  fastify.post('/register', async (request, reply) => {
    const { 
      userType, 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      licenseNumber, 
      role, 
      clinic, 
      dateOfBirth, 
      gender, 
      address 
    } = request.body;

    // Validate password strength
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password || '');
    const hasLowercase = /[a-z]/.test(password || '');
    const hasNumber = /[0-9]/.test(password || '');

    if (!password || password.length < minLength || !hasUppercase || !hasLowercase || !hasNumber) {
      return reply.code(400).send({ 
        error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.' 
      });
    }

    try {
      // Hash the password for security
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const client = await fastify.pg.connect();
      try {
        let rows = [];
        if (userType === 'patient') {
          const result = await client.query(
            'INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address, password_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, first_name, last_name, phone, date_of_birth, gender, address',
            [firstName, lastName, email, phone, dateOfBirth, gender, address, passwordHash]
          );
          rows = result.rows;
        } else {
          // Default to physiotherapist
          const result = await client.query(
            'INSERT INTO physiotherapists (first_name, last_name, email, phone, license_number, role, clinic, gender, password_hash, verification_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, email, first_name, last_name, phone, license_number, role, clinic, gender, verification_status',
            [firstName, lastName, email, phone, licenseNumber, role, clinic, gender, passwordHash, 'pending']
          );
          rows = result.rows;
        }
        
        reply.code(201).send({ message: 'User registered successfully', user: rows[0] });
      } finally {
        client.release();
      }
    } catch (error) {
      // Handle duplicate email errors
      if (error.code === '23505') {
        reply.code(400).send({ error: 'Email already exists' });
      } else {
        reply.code(500).send({ error: 'Internal Server Error' });
      }
    }
  });

  // 2. LOGIN ENDPOINT
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;

    const client = await fastify.pg.connect();
    try {
      let user = null;
      let userRole = null;

      // First check admins
      const adminRes = await client.query('SELECT * FROM admins WHERE email = $1', [email]);
      if (adminRes.rows.length > 0) {
        user = adminRes.rows[0];
        userRole = 'admin';
      } else {
        // Then check physiotherapists
        const physioRes = await client.query('SELECT * FROM physiotherapists WHERE email = $1', [email]);
        if (physioRes.rows.length > 0) {
          user = physioRes.rows[0];
          userRole = 'physiotherapist';
        } else {
          // If not found, check patients
          const patientRes = await client.query('SELECT * FROM patients WHERE email = $1', [email]);
          if (patientRes.rows.length > 0) {
            user = patientRes.rows[0];
            userRole = 'patient';
          }
        }
      }

      if (!user) {
        return reply.code(401).send({ error: 'Invalid email or password' });
      }

      // Check verification status for physiotherapists
      if (userRole === 'physiotherapist' && user.verification_status !== 'verified') {
        return reply.code(403).send({ error: 'Your account is pending verification by an administrator.' });
      }

      // Compare the provided password with the stored hash
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return reply.code(401).send({ error: 'Invalid email or password' });
      }

      // Generate a JWT containing the user's ID and role
      const token = fastify.jwt.sign({ 
        id: user.id, 
        email: user.email, 
        role: userRole 
      });

      // Remove password hash before sending user object
      const { password_hash, ...safeUser } = user;

      reply.send({ message: 'Login successful', token, role: userRole, user: safeUser });
    } finally {
      client.release();
    }
  });

  // Configure the email sender
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // 3. FORGOT PASSWORD ENDPOINT
  fastify.post('/forgot-password', async (request, reply) => {
    const { email } = request.body;
    if (!email) {
      return reply.code(400).send({ error: 'Email is required' });
    }

    const client = await fastify.pg.connect();
    try {
      // 1. Check if user exists in either table
      let user = null;
      const physioRes = await client.query('SELECT id, first_name FROM physiotherapists WHERE email = $1', [email]);
      if (physioRes.rows.length > 0) {
        user = physioRes.rows[0];
      } else {
        const patientRes = await client.query('SELECT id, first_name FROM patients WHERE email = $1', [email]);
        if (patientRes.rows.length > 0) {
          user = patientRes.rows[0];
        }
      }

      if (!user) {
        // Return success even if user doesn't exist to prevent email enumeration
        return reply.send({ message: 'If an account exists for that email, a reset link has been sent.' });
      }

      // 2. Generate a secure token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // 3. Set expiration for 15 minutes
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // 4. Store in password_resets table
      await client.query(
        'INSERT INTO password_resets (email, token, expires_at) VALUES ($1, $2, $3)',
        [email, resetToken, expiresAt]
      );

      // 5. Construct the link to your Next.js frontend (Next.js is running on 3002)
      const resetLink = `http://localhost:3002/reset-password?token=${resetToken}&email=${email}`;

      // 6. Send the actual email
      // To help with local testing, log the link to the console
      fastify.log.info(`PASSWORD RESET LINK: ${resetLink}`);

      await transporter.sendMail({
        from: `"Stawisha Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Stawisha - Reset Your Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
            <h2 style="color: #111827;">Password Reset Request</h2>
            <p style="color: #4B5563; font-size: 16px;">Hello ${user.first_name},</p>
            <p style="color: #4B5563; font-size: 16px;">We received a request to reset the password for your Stawisha account. Click the button below to choose a new password.</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Reset My Password</a>
            <p style="color: #6B7280; font-size: 14px;">This link will expire in 15 minutes. If you did not request this, you can safely ignore this email.</p>
          </div>
        `
      });

      reply.send({ message: 'If an account exists for that email, a reset link has been sent.' });
    } catch (error) {
      fastify.log.error('Email sending failed:', error);
      // For local development, still return success so the frontend doesn't show an error,
      // as the link was already logged to the console.
      reply.send({ message: 'If an account exists for that email, a reset link has been sent. (Check server logs if email did not arrive)' });
    } finally {
      client.release();
    }
  });

  // 4. RESET PASSWORD ENDPOINT
  fastify.post('/reset-password', async (request, reply) => {
    const { token, newPassword } = request.body;
    
    if (!token || !newPassword) {
      return reply.code(400).send({ error: 'Token and new password are required' });
    }

    // Validate password strength
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (newPassword.length < minLength || !hasUppercase || !hasLowercase || !hasNumber) {
      return reply.code(400).send({ 
        error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.' 
      });
    }

    const client = await fastify.pg.connect();
    try {
      // Find the token
      const resetRes = await client.query(
        'SELECT email FROM password_resets WHERE token = $1 AND expires_at > NOW()',
        [token]
      );

      if (resetRes.rows.length === 0) {
        return reply.code(400).send({ error: 'Invalid or expired reset token' });
      }

      const email = resetRes.rows[0].email;

      // Check existing password hash to ensure new password is different
      let existingHash = null;
      const physioRes = await client.query('SELECT password_hash FROM physiotherapists WHERE email = $1', [email]);
      if (physioRes.rows.length > 0) {
        existingHash = physioRes.rows[0].password_hash;
      } else {
        const patientRes = await client.query('SELECT password_hash FROM patients WHERE email = $1', [email]);
        if (patientRes.rows.length > 0) {
          existingHash = patientRes.rows[0].password_hash;
        }
      }

      if (existingHash) {
        const isSamePassword = await bcrypt.compare(newPassword, existingHash);
        if (isSamePassword) {
          return reply.code(400).send({ error: 'New password cannot be the same as the previous password.' });
        }
      }

      // Hash the new password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      await client.query('BEGIN');

      // Update password in whichever table the user belongs to
      const physioUpdate = await client.query(
        'UPDATE physiotherapists SET password_hash = $1 WHERE email = $2',
        [passwordHash, email]
      );
      
      if (physioUpdate.rowCount === 0) {
        await client.query(
          'UPDATE patients SET password_hash = $1 WHERE email = $2',
          [passwordHash, email]
        );
      }

      // Delete the used token
      await client.query('DELETE FROM password_resets WHERE email = $1', [email]);

      await client.query('COMMIT');
      reply.send({ message: 'Password has been reset successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    } finally {
      client.release();
    }
  });
}

module.exports = authRoutes;
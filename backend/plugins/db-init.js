// backend/plugins/db-init.js
const fp = require('fastify-plugin');

async function dbInit(fastify, options) {
  // Register the fastify-postgres plugin
  fastify.register(require('@fastify/postgres'), {
    connectionString: process.env.STAWISHA_DB_URL
  });

  // Once the database is connected, create the table
  fastify.ready(async (err) => {
    if (err) throw err;
    
    const client = await fastify.pg.connect();
    try {
      // Check if legacy table refers to patient_name (needs migration)
      const migrationCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='referrals' AND column_name='patient_name'
      `).catch(() => ({ rows: [] }));

      if (migrationCheck.rows.length > 0) {
        fastify.log.info('Migrating legacy database tables...');
        await client.query(`
          DROP TABLE IF EXISTS clinical_records CASCADE;
          DROP TABLE IF EXISTS referrals CASCADE;
          DROP TABLE IF EXISTS physiotherapists CASCADE;
          DROP TABLE IF EXISTS patients CASCADE;
        `);
      }

      await client.query(`
        CREATE TABLE IF NOT EXISTS patients (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          date_of_birth DATE,
          gender VARCHAR(50),
          phone VARCHAR(50),
          email VARCHAR(255) UNIQUE NOT NULL,
          address TEXT,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS physiotherapists (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(50),
          license_number VARCHAR(100),
          role VARCHAR(100),
          clinic VARCHAR(255),
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS referrals (
          id SERIAL PRIMARY KEY,
          patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
          referring_physio_id INTEGER REFERENCES physiotherapists(id) ON DELETE SET NULL,
          receiving_physio_id INTEGER REFERENCES physiotherapists(id) ON DELETE SET NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS clinical_records (
          id SERIAL PRIMARY KEY,
          referral_id INTEGER REFERENCES referrals(id) ON DELETE CASCADE,
          diagnosis TEXT,
          treatment_plan TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS password_resets (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          token VARCHAR(255) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS appointments (
          id SERIAL PRIMARY KEY,
          patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
          physio_id INTEGER REFERENCES physiotherapists(id) ON DELETE CASCADE,
          appointment_date DATE NOT NULL,
          appointment_time TIME NOT NULL,
          status VARCHAR(50) DEFAULT 'scheduled',
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      fastify.log.info('Database tables initialized successfully.');
    } catch (error) {
      fastify.log.error('Error initializing database tables:', error);
    } finally {
      client.release();
    }
  });
}

module.exports = fp(dbInit);
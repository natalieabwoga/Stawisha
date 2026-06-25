const { Client } = require('pg');

async function dropTables() {
  const client = new Client({
    connectionString: 'postgres://stawisha_user:stawisha_password@127.0.0.1:5434/stawisha_db'
  });

  try {
    await client.connect();
    console.log('Connected to DB. Dropping tables...');
    await client.query(`
      DROP TABLE IF EXISTS clinical_records CASCADE;
      DROP TABLE IF EXISTS referrals CASCADE;
      DROP TABLE IF EXISTS physiotherapists CASCADE;
      DROP TABLE IF EXISTS patients CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS password_resets CASCADE;
      DROP TABLE IF EXISTS appointments CASCADE;
    `);
    console.log('Tables dropped successfully.');
  } catch (err) {
    console.error('Error dropping tables:', err);
  } finally {
    await client.end();
  }
}

dropTables();

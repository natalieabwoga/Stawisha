// backend/server.js
// Load environment variables first
require('dotenv').config();

// Initialize Fastify with logging enabled
const fastify = require('fastify')({ logger: true });

// Register CORS plugin
fastify.register(require('@fastify/cors'), {
  origin: true
});

// Register the JWT plugin securely
fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET
});

// Register our custom database initialization plugin
fastify.register(require('./plugins/db-init'));

// Register the authentication routes with a prefix
fastify.register(require('./routes/auth'), { prefix: '/api/auth' });

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
// backend/server.js
// Load environment variables first
require('dotenv').config();

// Initialize Fastify with logging enabled
const fastify = require('fastify')({ logger: true });

// Allow empty JSON bodies to prevent FST_ERR_CTP_EMPTY_JSON_BODY errors
fastify.removeContentTypeParser('application/json');
fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
  try {
    var json = body ? JSON.parse(body) : {};
    done(null, json);
  } catch (err) {
    err.statusCode = 400;
    done(err, undefined);
  }
});

fastify.register(require('@fastify/cors'), {
  origin: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Register the JWT plugin securely
fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET
});

// Register multipart support for file uploads
fastify.register(require('@fastify/multipart'), {
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const path = require('path');
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/', // Serve at root so /uploads maps directly
});

// Decorate fastify with authenticate method
fastify.decorate('authenticate', async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Register our custom database initialization plugin
fastify.register(require('./plugins/db-init'));

// Register the authentication routes with a prefix
fastify.register(require('./routes/auth'), { prefix: '/api/auth' });

// Register the physiotherapists routes with a prefix
fastify.register(require('./routes/physiotherapists'), { prefix: '/api/physiotherapists' });

// Register the referrals routes with a prefix
fastify.register(require('./routes/referrals'), { prefix: '/api/referrals' });

// Register the notifications routes with a prefix
fastify.register(require('./routes/notifications'), { prefix: '/api/notifications' });

// Register the patients routes with a prefix
fastify.register(require('./routes/patients'), { prefix: '/api/patients' });

// Register the admin routes with a prefix
fastify.register(require('./routes/admin'), { prefix: '/api/admin' });

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
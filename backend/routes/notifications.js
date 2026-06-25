module.exports = async function (fastify, opts) {
  // GET /api/notifications
  fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user;
    
    try {
      const client = await fastify.pg.connect();
      const { rows } = await client.query(
        'SELECT * FROM notifications WHERE user_id = $1 AND user_type = $2 ORDER BY created_at DESC LIMIT 50',
        [user.id, user.role]
      );
      client.release();
      return { notifications: rows };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch notifications' });
    }
  });

  // PATCH /api/notifications/read
  fastify.patch('/read', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user;
    
    try {
      const client = await fastify.pg.connect();
      await client.query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND user_type = $2 AND is_read = FALSE',
        [user.id, user.role]
      );
      client.release();
      return { success: true };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to mark notifications as read' });
    }
  });
};

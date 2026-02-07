import { createRouter } from "next-connect";
import database from "infra/database.js";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller);

async function getHandler(req, res) {
  const updatedAt = new Date().toISOString();

  const version = (await database.query("SHOW server_version;")).rows[0]
    .server_version;

  const maxConnections = (await database.query("SHOW max_connections;")).rows[0]
    .max_connections;

  const openConnections = (
    await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [process.env.POSTGRES_DB],
    })
  ).rows[0].count;

  res.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: version,
        max_connections: parseInt(maxConnections),
        open_connections: openConnections,
      },
    },
  });
}

const app = require('./app');
const pool = require('./database/pool');
const { port } = require('./config');

const server = app.listen(port, () => console.log(`PlanYourFit działa na http://localhost:${port}`));

async function shutdown() {
  server.close(async () => { await pool.end(); process.exit(0); });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const v = await c.query('select version()');
  console.log('SERVER:', v.rows[0].version.split(',')[0]);
  const t = await c.query(`
    select table_name from information_schema.tables
    where table_schema='public' order by table_name`);
  console.log('TABLES (public):', t.rows.length ? t.rows.map(r=>r.table_name).join(', ') : '(none)');
  const e = await c.query(`select typname from pg_type where typtype='e'`);
  console.log('ENUM TYPES:', e.rows.length ? e.rows.map(r=>r.typname).join(', ') : '(none)');
  await c.end();
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });

import pg from "pg";
const { Client } = pg;

const connectionString = "postgresql://postgres.fgibppypgdhigifccenm:Jyothsna%4022@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function check() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected!");
    
    const res = await client.query("SELECT count(*) FROM users");
    console.log("Users count:", res.rows[0].count);
    
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("Tables found:", tables.rows.map(r => r.table_name).join(", "));
    
    await client.end();
  } catch (err) {
    console.error("DATABASE INSPECTION ERROR:", err.message);
    if (err.detail) console.log("Detail:", err.detail);
    if (err.hint) console.log("Hint:", err.hint);
  }
}

check();

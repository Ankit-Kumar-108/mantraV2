import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("TURSO_DATABASE_URL is not defined in env");
  process.exit(1);
}

async function main() {
  const client = createClient({ url: url!, authToken: authToken || "" });
  
  console.log("Connecting to Turso database...");
  
  // Disable foreign key constraints temporarily to allow dropping tables in any order
  await client.execute("PRAGMA foreign_keys = OFF;");
  
  // Get all tables
  const res = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
  );
  
  const tables = res.rows.map(row => row.name as string);
  console.log(`Found tables: ${tables.join(", ")}`);
  
  if (tables.length === 0) {
    console.log("No tables found to drop.");
  } else {
    for (const table of tables) {
      console.log(`Dropping table ${table}...`);
      await client.execute(`DROP TABLE IF EXISTS \`${table}\`;`);
    }
  }
  
  await client.execute("PRAGMA foreign_keys = ON;");
  console.log("All tables dropped successfully!");
  
  client.close();
}

main().catch(console.error);

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
  
  console.log("Connecting to Turso database to clear old seed data...");
  
  // Disable foreign key constraints temporarily to allow clean deletes in any order
  await client.execute("PRAGMA foreign_keys = OFF;");
  
  console.log("Clearing playlist_tracks...");
  await client.execute("DELETE FROM playlist_tracks;");
  
  console.log("Clearing track_artists...");
  await client.execute("DELETE FROM track_artists;");
  
  console.log("Clearing tracks...");
  await client.execute("DELETE FROM tracks;");
  
  console.log("Clearing playlists...");
  await client.execute("DELETE FROM playlists;");
  
  console.log("Clearing artists...");
  await client.execute("DELETE FROM artists;");
  
  await client.execute("PRAGMA foreign_keys = ON;");
  
  console.log("All data cleared successfully! Database is now empty and ready for fresh dynamic uploads.");
  
  client.close();
}

main().catch((err) => {
  console.error("❌ Failed to clear database:", err);
  process.exit(1);
});

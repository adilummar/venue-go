import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { sql } from "drizzle-orm";
import * as fs from "fs";

async function checkSchema() {
  try {
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    
    fs.writeFileSync("schema_output.json", JSON.stringify(result.rows, null, 2));
    console.log("Schema check written to schema_output.json");
    process.exit(0);
  } catch (err) {
    fs.writeFileSync("schema_error.txt", String(err));
    process.exit(1);
  }
}

checkSchema();

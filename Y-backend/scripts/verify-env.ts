import { config } from "dotenv";
import { resolve } from "path";
import { getEnv } from "../lib/env";

function main() {
  // Load local env file
  config({ path: resolve(process.cwd(), ".env") });

  try {
    const env = getEnv();
    console.log("Y-backend env OK. Loaded keys:");
    console.log(Object.keys(env).sort().join(", "));
  } catch (e) {
    console.error(String(e));
    process.exit(1);
  }
}

main();

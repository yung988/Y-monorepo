import { config } from "dotenv";
import { resolve } from "path";
import { getPublicEnv } from "../src/lib/env";

function main() {
  // Load local env file
  config({ path: resolve(process.cwd(), ".env") });

  try {
    const env = getPublicEnv();
    console.log("Y-frontend env OK. Loaded keys:");
    console.log(Object.keys(env).sort().join(", "));
  } catch (e) {
    console.error(String(e));
    process.exit(1);
  }
}

main();

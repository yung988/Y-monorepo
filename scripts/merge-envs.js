const { readFileSync, writeFileSync, existsSync, mkdirSync } = require("fs");
const { resolve } = require("path");

function parseEnv(content) {
  const result = {};
  const lines = content.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
}

function stringifyEnv(env) {
  const keys = Object.keys(env).sort();
  return keys.map((k) => `${k}="${env[k]}"`).join("\n") + "\n";
}

function main() {
  const repoRoot = process.cwd();
  const frontEnvPath = resolve(repoRoot, ".env front");
  const backEnvPath = resolve(repoRoot, ".env.local back");

  if (!existsSync(frontEnvPath) && !existsSync(backEnvPath)) {
    console.error("No source env files found (.env front, .env.local back). Nothing to merge.");
    process.exit(1);
  }

  const frontRaw = existsSync(frontEnvPath) ? readFileSync(frontEnvPath, "utf8") : "";
  const backRaw = existsSync(backEnvPath) ? readFileSync(backEnvPath, "utf8") : "";

  const frontVars = parseEnv(frontRaw);
  const backVars = parseEnv(backRaw);

  // Prepare frontend .env.local containing only NEXT_PUBLIC_* variables.
  const combinedPublic = {};
  for (const [k, v] of Object.entries(backVars)) {
    if (k.startsWith("NEXT_PUBLIC_")) combinedPublic[k] = v;
  }
  for (const [k, v] of Object.entries(frontVars)) {
    if (k.startsWith("NEXT_PUBLIC_")) combinedPublic[k] = v; // frontend wins
  }

  // Prepare backend .env.local: take backVars base, and ensure public vars are present (prefer frontend if provided)
  const combinedBack = { ...backVars };
  for (const [k, v] of Object.entries(combinedPublic)) {
    combinedBack[k] = v;
  }

  // Ensure folders exist
  const feDir = resolve(repoRoot, "Y-frontend");
  const beDir = resolve(repoRoot, "Y-backend");
  if (!existsSync(feDir)) mkdirSync(feDir, { recursive: true });
  if (!existsSync(beDir)) mkdirSync(beDir, { recursive: true });

  // Write files
  const feOut = resolve(feDir, ".env.local");
  const beOut = resolve(beDir, ".env.local");
  writeFileSync(feOut, stringifyEnv(combinedPublic), "utf8");
  writeFileSync(beOut, stringifyEnv(combinedBack), "utf8");

  // Summary
  const pubKeys = Object.keys(combinedPublic).length;
  const backKeys = Object.keys(combinedBack).length;
  console.log(`Merged ${pubKeys} public vars to Y-frontend/.env.local and ${backKeys} vars to Y-backend/.env.local`);
}

main();

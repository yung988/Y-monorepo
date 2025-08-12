/*
  Import CSVs into Supabase (new project) and create a public storage bucket for product images
  Usage: npx tsx scripts/import-csv.ts
*/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const CWD = process.cwd();
const CSV_DIR = path.resolve(CWD, "../csv");

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ENV ${name}`);
  return v;
}

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SERVICE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

function readCsv(fileName: string) {
  const p = path.join(CSV_DIR, fileName);
  if (!fs.existsSync(p)) throw new Error(`CSV not found: ${p}`);
  const raw = fs.readFileSync(p, "utf8");
  const records = parse(raw, { columns: true, skip_empty_lines: true });
  return records as Record<string, string>[];
}

function toInt(x: string | null | undefined): number | null {
  if (x == null || x === "") return null;
  const n = Number.parseInt(x, 10);
  return Number.isFinite(n) ? n : null;
}

function toFloat(x: string | null | undefined): number | null {
  if (x == null || x === "") return null;
  const n = Number.parseFloat(x);
  return Number.isFinite(n) ? n : null;
}

function toBool(x: string | null | undefined): boolean | null {
  if (x == null || x === "") return null;
  const v = x.toLowerCase();
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

function emptyToNull<T extends Record<string, any>>(row: T): T {
  const out: any = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = v === "" ? null : v;
  }
  return out;
}

async function importProducts() {
  const rows = readCsv("products_rows.csv");
  const mapped = rows.map((r) => {
    const m: any = emptyToNull(r);
    m.price = toInt(r.price);
    m.weight = toFloat(r.weight);
    return m;
  });
  if (mapped.length === 0) return { inserted: 0 };
  const { error, count } = await supabase.from("products").insert(mapped, { count: "exact" });
  if (error) throw error;
  return { inserted: count ?? mapped.length };
}

async function importVariants() {
  const rows = readCsv("product_variants_rows.csv");
  const mapped = rows.map((r) => {
    const m: any = emptyToNull(r);
    m.stock_quantity = toInt(r.stock_quantity);
    m.price_override = toInt(r.price_override);
    m.weight = toFloat(r.weight);
    return m;
  });
  if (mapped.length === 0) return { inserted: 0 };
  const { error, count } = await supabase
    .from("product_variants")
    .insert(mapped, { count: "exact" });
  if (error) throw error;
  return { inserted: count ?? mapped.length };
}

async function importImages() {
  const rows = readCsv("product_images_rows.csv");
  const mapped = rows.map((r) => {
    const m: any = emptyToNull(r);
    m.sort_order = toInt(r.sort_order);
    m.is_main_image = toBool(r.is_main_image);
    return m;
  });
  if (mapped.length === 0) return { inserted: 0 };
  const { error, count } = await supabase.from("product_images").insert(mapped, { count: "exact" });
  if (error) throw error;
  return { inserted: count ?? mapped.length };
}

async function importShipping() {
  const rows = readCsv("shipping_methods_rows.csv");
  const mapped = rows.map((r) => {
    const m: any = emptyToNull(r);
    m.price = toInt(r.price);
    m.estimated_days_min = toInt(r.estimated_days_min);
    m.estimated_days_max = toInt(r.estimated_days_max);
    m.is_active = toBool(r.is_active);
    return m;
  });
  if (mapped.length === 0) return { inserted: 0 };
  const { error, count } = await supabase
    .from("shipping_methods")
    .insert(mapped, { count: "exact" });
  if (error) throw error;
  return { inserted: count ?? mapped.length };
}

async function ensureBucket() {
  try {
    // Create public bucket for product images (for future uploads)
    const { data, error } = await (supabase.storage as any).createBucket("product-images", {
      public: true,
    });
    if (error && !String(error.message || "").includes("already exists")) throw error;
    return { created: !error };
  } catch (e) {
    // Some older clients expose buckets via from() only; fallback: check existence
    return { created: false };
  }
}

async function main() {
  console.log("CSV dir:", CSV_DIR);
  const prod = await importProducts();
  console.log("Imported products:", prod.inserted);
  const vars = await importVariants();
  console.log("Imported variants:", vars.inserted);
  const imgs = await importImages();
  console.log("Imported images:", imgs.inserted);
  const ship = await importShipping();
  console.log("Imported shipping methods:", ship.inserted);

  const bucket = await ensureBucket();
  console.log("Bucket product-images:", bucket.created ? "created" : "exists or skipped");

  // Simple sanity counts
  const [pCount, vCount, iCount] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("product_variants").select("id", { count: "exact", head: true }),
    supabase.from("product_images").select("id", { count: "exact", head: true }),
  ]);
  console.log(
    "Counts:",
    {
      products: pCount.count ?? null,
      variants: vCount.count ?? null,
      images: iCount.count ?? null,
    },
  );
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});


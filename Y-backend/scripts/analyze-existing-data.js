import { createClient } from "@supabase/supabase-js"

// Skript pro analýzu existujících dat v Supabase
async function analyzeExistingData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase credentials not found")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log("🔍 Analyzing existing Supabase data...\n")

  // Získání seznamu všech tabulek
  const { data: tables, error: tablesError } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_schema", "public")

  if (tablesError) {
    console.error("Error fetching tables:", tablesError)
    return
  }

  console.log("📊 Existing tables:")
  tables?.forEach((table) => {
    console.log(`  - ${table.table_name}`)
  })
  console.log()

  // Analýza každé tabulky
  for (const table of tables || []) {
    const tableName = table.table_name

    // Přeskočit systémové tabulky
    if (tableName.startsWith("_") || tableName.includes("schema")) {
      continue
    }

    console.log(`📋 Table: ${tableName}`)

    // Získání struktury tabulky
    const { data: columns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable")
      .eq("table_name", tableName)
      .eq("table_schema", "public")

    if (!columnsError && columns) {
      console.log("  Columns:")
      columns.forEach((col) => {
        console.log(
          `    - ${col.column_name}: ${col.data_type} ${col.is_nullable === "YES" ? "(nullable)" : "(required)"}`,
        )
      })
    }

    // Získání počtu záznamů
    const { count, error: countError } = await supabase.from(tableName).select("*", { count: "exact", head: true })

    if (!countError) {
      console.log(`  Records: ${count}`)
    }

    // Ukázka dat (prvních 3 záznamů)
    const { data: sampleData, error: sampleError } = await supabase.from(tableName).select("*").limit(3)

    if (!sampleError && sampleData && sampleData.length > 0) {
      console.log("  Sample data:")
      sampleData.forEach((record, index) => {
        console.log(`    Record ${index + 1}:`, JSON.stringify(record, null, 6))
      })
    }

    console.log()
  }

  // Specifické analýzy pro klíčové tabulky
  await analyzeSpecificTables(supabase)
}

async function analyzeSpecificTables(supabase) {
  console.log("🎯 Specific table analysis:\n")

  // Analýza produktů
  const { data: products, error: productsError } = await supabase.from("products").select("*").limit(5)

  if (!productsError && products) {
    console.log("🛍️ Products analysis:")
    console.log(`  Total products: ${products.length}`)
    if (products.length > 0) {
      console.log("  Sample product structure:")
      console.log("  ", JSON.stringify(products[0], null, 4))
    }
    console.log()
  }

  // Analýza objednávek
  const { data: orders, error: ordersError } = await supabase.from("orders").select("*").limit(5)

  if (!ordersError && orders) {
    console.log("📦 Orders analysis:")
    console.log(`  Total orders: ${orders.length}`)
    if (orders.length > 0) {
      console.log("  Sample order structure:")
      console.log("  ", JSON.stringify(orders[0], null, 4))
    }
    console.log()
  }

  // Analýza zákazníků
  const { data: customers, error: customersError } = await supabase.from("customers").select("*").limit(5)

  if (!customersError && customers) {
    console.log("👥 Customers analysis:")
    console.log(`  Total customers: ${customers.length}`)
    if (customers.length > 0) {
      console.log("  Sample customer structure:")
      console.log("  ", JSON.stringify(customers[0], null, 4))
    }
    console.log()
  }
}

// Spuštění analýzy
analyzeExistingData().catch(console.error)

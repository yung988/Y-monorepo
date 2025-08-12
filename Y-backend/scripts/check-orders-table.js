const { createClient } = require("@supabase/supabase-js");

// Check if access_token column exists in orders table
async function checkOrdersTable() {
  try {
    console.log("Checking orders table structure...");

    const supabaseUrl = "https://kxynznhyolibcjdyopdt.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW56bmh5b2xpYmNqZHlvcGR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI1NjYxNSwiZXhwIjoyMDY3ODMyNjE1fQ.uHh2ccKlZ8uJArBahhF5S37CnroWWF5HUMJTcWCXPYU";

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to query the access_token column
    const { data, error } = await supabase.from("orders").select("access_token").limit(1);

    if (error) {
      console.error("Error querying access_token column:", error.message);
      console.error("This might indicate the column does not exist yet");

      // Let's check the table structure by querying all columns
      const { data: sampleData, error: sampleError } = await supabase
        .from("orders")
        .select("*")
        .limit(1);

      if (sampleError) {
        console.error("Error querying orders table:", sampleError.message);
        return;
      }

      console.log("Orders table columns:", Object.keys(sampleData[0] || {}));
      return;
    }

    console.log("access_token column exists in orders table!");
    console.log("Sample data:", data);
  } catch (error) {
    console.error("Failed to check orders table:", error.message);
  }
}

checkOrdersTable();

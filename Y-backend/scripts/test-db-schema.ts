import { createClient } from "@supabase/supabase-js";

// Test database connection and schema
async function testDBSchema() {
  try {
    console.log("Testing database connection and schema...");

    // Use the same connection details as in your .env
    const supabaseUrl = "https://kxynznhyolibcjdyopdt.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW56bmh5b2xpYmNqZHlvcGR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI1NjYxNSwiZXhwIjoyMDY3ODMyNjE1fQ.uHh2ccKlZ8uJArBahhF5S37CnroWWF5HUMJTcWCXPYU";

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test if the access_token column exists in orders table
    const { data, error } = await supabase.from("orders").select("id, access_token").limit(1);

    if (error) {
      console.error("Database query error:", error);
      // Try to add the access_token column if it doesn't exist
      console.log("Attempting to add access_token column to orders table...");

      // Note: In Supabase, you would typically add columns through the dashboard
      // or by using SQL commands directly
      return;
    }

    console.log("Database schema test successful!");
    console.log("Sample data with access_token:", data);
  } catch (error) {
    console.error("Database schema test failed:", error);
  }
}

testDBSchema();

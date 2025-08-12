import { createClient } from "@supabase/supabase-js";

// Test database connection
async function testDBConnection() {
  try {
    console.log("Testing database connection...");

    // Use the same connection details as in your .env
    const supabaseUrl = "https://kxynznhyolibcjdyopdt.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW56bmh5b2xpYmNqZHlvcGR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI1NjYxNSwiZXhwIjoyMDY3ODMyNjE1fQ.uHh2ccKlZ8uJArBahhF5S37CnroWWF5HUMJTcWCXPYU";

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test a simple query
    const { data, error } = await supabase.from("orders").select("id").limit(1);

    if (error) {
      console.error("Database query error:", error);
      return;
    }

    console.log("Database connection successful!");
    console.log("Sample data:", data);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

testDBConnection();

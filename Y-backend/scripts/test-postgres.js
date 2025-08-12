const { Client } = require("pg");

// Test direct PostgreSQL connection
async function testPostgresConnection() {
  try {
    console.log("Testing PostgreSQL connection...");

    const client = new Client({
      host: "aws-0-us-east-1.pooler.supabase.com",
      port: 5432,
      user: "prisma.kxynznhyolibcjdyopdt",
      password: "ar5xJyz3hp79jfFt",
      database: "postgres",
    });

    await client.connect();
    console.log("PostgreSQL connection successful!");

    // Test a simple query
    const res = await client.query("SELECT NOW() as current_time");
    console.log("Current time from database:", res.rows[0].current_time);

    await client.end();
    console.log("Connection closed.");
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
    console.error("Error code:", error.code);
  }
}

testPostgresConnection();

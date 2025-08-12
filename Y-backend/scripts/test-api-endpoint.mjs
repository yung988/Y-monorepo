import { createClient } from "@supabase/supabase-js";

// Test the actual API endpoint logic
async function testAPIEndpoint() {
  try {
    console.log("Testing API endpoint logic...");

    const supabaseUrl = "https://kxynznhyolibcjdyopdt.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW56bmh5b2xpYmNqZHlvcGR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI1NjYxNSwiZXhwIjoyMDY3ODMyNjE1fQ.uHh2ccKlZ8uJArBahhF5S37CnroWWF5HUMJTcWCXPYU";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create a test access token
    const testAccessToken = "test-access-token-" + Date.now();
    const orderId = "591c3717-da1d-4bfc-88bc-149597c51105";

    // Update an existing order with the test access token
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ access_token: testAccessToken })
      .eq("id", orderId);

    if (updateError) {
      console.error("Failed to update order:", updateError);
      return;
    }

    console.log("Order updated with access token");

    // Test retrieving order with access token (simulating API endpoint)
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        id,
        customer_email,
        customer_name,
        customer_phone,
        total_amount,
        currency,
        status,
        payment_status,
        shipping_address,
        packeta_pickup_point_id,
        packeta_pickup_point_name,
        packeta_pickup_point_address,
        packeta_tracking_number,
        packeta_tracking_url,
        order_number,
        created_at,
        access_token,
        order_items(
          id,
          quantity,
          price,
          products(
            id,
            name
          ),
          product_variants(
            id,
            size
          )
        )
      `)
      .eq("id", orderId)
      .eq("access_token", testAccessToken)
      .single();

    if (error) {
      console.error("Failed to retrieve order:", error);
      return;
    }

    console.log("API endpoint logic test successful!");
    console.log("Order data:", {
      id: order.id,
      customer_email: order.customer_email,
      access_token: order.access_token,
      order_items_count: order.order_items.length,
    });

    // Reset the access token to null
    await supabase.from("orders").update({ access_token: null }).eq("id", orderId);

    console.log("Access token reset to null");
  } catch (error) {
    console.error("API endpoint test failed:", error);
  }
}

testAPIEndpoint();

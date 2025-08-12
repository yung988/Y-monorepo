// Test script pro tracking endpoint
require("dotenv").config({ path: ".env" });
const axios = require("axios");

async function testTrackingEndpoint() {
  try {
    console.log("🧪 TESTING TRACKING ENDPOINT");
    console.log("============================");

    // Použij packet ID z předchozího testu
    const packetId = "1645877183";

    // Test GET method
    console.log("📤 Testing GET method...");
    const getResponse = await axios.get(
      `http://localhost:3000/api/packeta/track-shipment?packetId=${packetId}`,
    );

    console.log("✅ GET Response:");
    console.log(JSON.stringify(getResponse.data, null, 2));
    console.log("");

    // Test POST method
    console.log("📤 Testing POST method...");
    const postResponse = await axios.post("http://localhost:3000/api/packeta/track-shipment", {
      packetId: packetId,
    });

    console.log("✅ POST Response:");
    console.log(JSON.stringify(postResponse.data, null, 2));
  } catch (error) {
    console.error("💥 Error testing endpoint:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);
  }
}

// Spusť test
testTrackingEndpoint().catch(console.error);

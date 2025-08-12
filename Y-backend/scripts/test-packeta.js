// Test script pro Packeta API
require("dotenv").config({ path: ".env" });
const axios = require("axios");

const packetaApi = axios.create({
  baseURL: process.env.PACKETA_BASE_URL,
  headers: {
    "Content-Type": "application/xml",
  },
});

// Testovací údaje (FIKTIVNÍ!)
const testOrderData = {
  orderNumber: `TEST-${Date.now()}`,
  customerName: "Jan",
  customerSurname: "Testovací",
  customerEmail: "test@example.com",
  customerPhone: "+420123456789",
  pickupPointId: "79", // Praha 1 - testovací výdejní místo
  orderValue: 1500, // 15 Kč
  weight: 1.0, // 1 kg
  cashOnDelivery: 0, // bez dobírky
};

async function testCreatePacketaShipment() {
  try {
    console.log("🚀 Testování vytvoření zásilky...");
    console.log("📦 Testovací data:", testOrderData);

    // Create XML request body according to Packeta API documentation
    const xmlData = `<?xml version="1.0" encoding="utf-8"?>
<createPacket>
  <apiPassword>${process.env.PACKETA_API_PASSWORD}</apiPassword>
  <packetAttributes>
    <number>${testOrderData.orderNumber}</number>
    <name>${testOrderData.customerName}</name>
    <surname>${testOrderData.customerSurname}</surname>
    <email>${testOrderData.customerEmail}</email>
    <phone>${testOrderData.customerPhone}</phone>
    <addressId>${testOrderData.pickupPointId}</addressId>
    <cod>${testOrderData.cashOnDelivery}</cod>
    <value>${testOrderData.orderValue}</value>
    <weight>${testOrderData.weight}</weight>
    <eshop>${process.env.PACKETA_SENDER_LABEL || "default-sender"}</eshop>
  </packetAttributes>
</createPacket>`;

    console.log("📤 XML Request:");
    console.log(xmlData);
    console.log("");

    const response = await packetaApi.post("/", xmlData);

    console.log("✅ Úspěch! Odpověď API:");
    console.log(response.data);

    // Parse XML response to check for success or error
    if (typeof response.data === "string" && response.data.includes("<fault>")) {
      console.log("❌ Chyba v odpovědi - API vrátilo fault");
      return null;
    } else if (typeof response.data === "string" && response.data.includes("<id>")) {
      // Extract packet ID from XML response
      const idMatch = response.data.match(/<id>(\d+)<\/id>/);
      if (idMatch) {
        const packetId = idMatch[1];
        console.log(`🎉 Zásilka vytvořena s ID: ${packetId}`);
        return packetId;
      }
    }

    console.log("⚠️ Neočekávaná odpověď z API");
    return null;
  } catch (error) {
    console.error("💥 Chyba při volání API:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);
    return null;
  }
}

async function testGetPacketStatus(packetId) {
  try {
    console.log(`🔍 Testování stavu zásilky ${packetId}...`);

    // Použijeme XML packet info metodu přes REST API
    const xmlData = `<?xml version="1.0" encoding="utf-8"?>
<packetInfo>
  <apiPassword>${process.env.PACKETA_API_PASSWORD}</apiPassword>
  <packetId>${packetId}</packetId>
</packetInfo>`;

    console.log(`📤 XML Request pro packetInfo:`);
    console.log(xmlData);
    console.log("");

    const response = await packetaApi.post("/", xmlData);

    console.log("✅ Stav zásilky:");
    console.log(response.data);
  } catch (error) {
    console.error("💥 Chyba při kontrole stavu:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);

    // Zkusíme alternativní metodu
    console.log("\n🔄 Zkouším jinou metodu...");
    await testGetPacketTrackingHistory(packetId);
  }
}

async function testGetPacketTrackingHistory(packetId) {
  try {
    // Zkusíme přes veřejné sledování (bez API hesla)
    const publicTrackingUrl = `https://www.zasilkovna.cz/api/v4/${process.env.PACKETA_API_KEY}/packet/${packetId}`;

    console.log(`📤 Veřejné sledování URL: ${publicTrackingUrl}`);
    console.log("");

    const response = await axios.get(publicTrackingUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    console.log("✅ Veřejné info o zásilce:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("💥 Chyba při veřejném sledování:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);

    // Poslední pokus s jiným endpointem
    console.log("\n🔄 Poslední pokus s barcode...");
    await testGetPacketByBarcode(packetId);
  }
}

async function testGetPacketByBarcode(packetId) {
  try {
    // Použijeme barcode format Z + packetId
    const barcode = `Z${packetId}`;
    console.log(`🔍 Hledám zásilku podle barcode: ${barcode}`);

    // Veřejné API pro sledování podle čísla zásilky
    const trackingUrl = `https://www.zasilkovna.cz/api/v4/${process.env.PACKETA_API_KEY}/packet/${barcode}`;

    const response = await axios.get(trackingUrl);

    console.log("✅ Sledování podle barcode:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("💥 Chyba při sledování podle barcode:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);
  }
}

async function testGetPacketStatusXML(packetId) {
  try {
    // Alternativní XML endpoint pro sledování
    const xmlData = `<?xml version="1.0" encoding="utf-8"?>
<packetStatus>
  <apiPassword>${process.env.PACKETA_API_PASSWORD}</apiPassword>
  <packetId>${packetId}</packetId>
</packetStatus>`;

    console.log("📤 XML Request k REST API:");
    console.log(xmlData);
    console.log("");

    const response = await packetaApi.post("/", xmlData);

    console.log("✅ Stav zásilky (XML):");
    console.log(response.data);
  } catch (error) {
    console.error("💥 Chyba při XML kontrole stavu:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);
  }
}

async function testExistingPacketStatus() {
  // Test s existujícím packet ID z předchozího testu
  const existingPacketId = "1645877183"; // Packet ID z předchozího testu
  console.log("🔍 Test sledování existující zásilky...");
  await testGetPacketStatus(existingPacketId);
}

async function runTests() {
  console.log("🧪 PACKETA API TEST");
  console.log("==================");
  console.log(`API URL: ${process.env.PACKETA_BASE_URL}`);
  console.log(`SOAP URL: ${process.env.PACKETA_SOAP_URL}`);
  console.log(`API Key: ${process.env.PACKETA_API_KEY ? "SET" : "NOT SET"}`);
  console.log(`Sender ID: ${process.env.PACKETA_SENDER_ID}`);
  console.log(`Sender Label: ${process.env.PACKETA_SENDER_LABEL}`);
  console.log("");

  // Pokud chceš testovat jen sledování existující zásilky, odkomentuj:
  await testExistingPacketStatus();
  return;

  // Test 1: Vytvoření zásilky
  const packetId = await testCreatePacketaShipment();

  // Test 2: Kontrola stavu (pokud se zásilka vytvořila)
  if (packetId) {
    console.log("");
    await testGetPacketStatus(packetId);
  }

  console.log("");
  console.log("🏁 Test dokončen");
}

// Spusť testy
runTests().catch(console.error);

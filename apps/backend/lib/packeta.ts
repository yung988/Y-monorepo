import axios from "axios";
import { parseStringPromise } from "xml2js";

const packetaApi = axios.create({
  baseURL: process.env.PACKETA_SOAP_URL || process.env.PACKETA_BASE_URL,
  headers: {
    "Content-Type": "application/xml",
  },
});

interface OrderData {
  orderNumber: string;
  customerName: string;
  customerSurname: string;
  customerEmail: string;
  customerPhone: string;
  pickupPointId: string;
  cashOnDelivery?: number;
  orderValue: number;
  weight: number;
  width?: number;
  height?: number;
  depth?: number;
}

// Helper function to create XML from packet data
const createPacketXML = (orderData: OrderData, apiPassword: string): string => {
  return `<?xml version="1.0" encoding="utf-8"?>
<createPacket>
  <apiPassword>${apiPassword}</apiPassword>
  <packetAttributes>
    <number>${orderData.orderNumber}</number>
    <name>${orderData.customerName}</name>
    <surname>${orderData.customerSurname}</surname>
    <email>${orderData.customerEmail}</email>
    <phone>${orderData.customerPhone}</phone>
    <pickupPointId>${orderData.pickupPointId}</pickupPointId>
    <cod>${orderData.cashOnDelivery || 0}</cod>
    <value>${orderData.orderValue}</value>
    <weight>${orderData.weight}</weight>
    ${orderData.width ? `<width>${orderData.width}</width>` : ""}
    ${orderData.height ? `<height>${orderData.height}</height>` : ""}
    ${orderData.depth ? `<depth>${orderData.depth}</depth>` : ""}
    <eshop>${process.env.PACKETA_SENDER_LABEL || "default-sender"}</eshop>
  </packetAttributes>
</createPacket>`;
};

// Helper function to parse XML response (robust against minor XML issues)
const sanitizeXml = (xml: string) => {
  let out = (xml || "").toString().trim();
  // Replace stray ampersands that are not part of known entities
  out = out.replace(/&(?!amp;|lt;|gt;|apos;|quot;|#\d+;)/g, "&amp;");
  // Remove null bytes or control chars that may break XML parsers
  out = out.replace(/[\u0000-\u001F\u007F]/g, (m) => (m === "\n" || m === "\r" || m === "\t" ? m : ""));
  return out;
};

// Try to extract useful fields even if XML is malformed
const fallbackExtract = (xml: string) => {
  const safe = (xml || "").toString();
  const get = (tag: string) => {
    const m = safe.match(new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, "i"));
    return m ? m[1].trim() : undefined;
  };
  const status = get("status");
  const fault = get("fault") || get("error") || get("string");
  if (status && status.toLowerCase() === "fault") {
    throw new Error(`Packeta API Error: ${fault || "Unknown fault"}`);
  }
  return {
    PacketIdDetail: {
      id: get("id"),
      barcode: get("barcode"),
      barcodeText: get("barcodeText") || get("barcode-text") || get("barcode_text"),
    },
    response: {
      id: get("id"),
      barcode: get("barcode"),
      barcodeText: get("barcodeText") || get("barcode-text") || get("barcode_text"),
      status,
      fault,
    },
  };
};

const parsePacketaResponse = async (xmlResponse: string): Promise<any> => {
  const sanitized = sanitizeXml(xmlResponse);
  try {
    const result = await parseStringPromise(sanitized, { explicitArray: false, trim: true });
    return result;
  } catch (error) {
    console.error("XML parsing error:", error);
    // Fallback to regex extraction to avoid failing the whole flow
    try {
      const fallback = fallbackExtract(xmlResponse);
      return fallback;
    } catch (inner) {
      console.error("Fallback XML extraction failed:", inner);
      throw new Error("Failed to parse XML response");
    }
  }
};

export const createPacketaShipment = async (orderData: OrderData) => {
  try {
    const xmlData = createPacketXML(orderData, process.env.PACKETA_API_PASSWORD!);

    const response = await packetaApi.post("/", xmlData);

    // Parse XML response
    const parsedResponse = await parsePacketaResponse(response.data);

    // Check if response contains error
    if (parsedResponse.response?.status === "fault") {
      throw new Error(
        `Packeta API Error: ${parsedResponse.response.fault} - ${parsedResponse.response.string}`,
      );
    }

    // Return the packet details
    return {
      id: parsedResponse.PacketIdDetail?.id || parsedResponse.response?.id,
      barcode: parsedResponse.PacketIdDetail?.barcode || parsedResponse.response?.barcode,
      barcodeText:
        parsedResponse.PacketIdDetail?.barcodeText || parsedResponse.response?.barcodeText,
    };
  } catch (error: any) {
    console.error("Packeta API Error:", error.response?.data || error.message);
    throw error;
  }
};

// Helper function to create XML for packet label PDF
const createPacketLabelXML = (
  packetIds: string[],
  apiPassword: string,
  format: string = "A6",
): string => {
  const packetIdsXml = packetIds.map((id) => `<id>${id}</id>`).join("\n    ");
  return `<?xml version="1.0" encoding="utf-8"?>
<packetLabelsPdf>
  <apiPassword>${apiPassword}</apiPassword>
  <packetIds>
    ${packetIdsXml}
  </packetIds>
  <format>${format}</format>
</packetLabelsPdf>`;
};

export const generatePacketaLabel = async (packetId: string) => {
  try {
    const xmlData = createPacketLabelXML([packetId], process.env.PACKETA_API_PASSWORD!, "A6");

    const response = await packetaApi.post("/", xmlData);

    // Parse XML response
    const parsedResponse = await parsePacketaResponse(response.data);

    // Check if response contains error
    if (parsedResponse.response?.status === "fault") {
      throw new Error(
        `Packeta API Error: ${parsedResponse.response.fault} - ${parsedResponse.response.string}`,
      );
    }

    return {
      pdf: parsedResponse.response || response.data, // Base64 PDF data
    };
  } catch (error: any) {
    console.error("Label generation error:", error);
    throw error;
  }
};

export const generateMultipleLabels = async (packetIds: string[]) => {
  try {
    const xmlData = createPacketLabelXML(packetIds, process.env.PACKETA_API_PASSWORD!, "A4");

    const response = await packetaApi.post("/", xmlData);

    // Parse XML response
    const parsedResponse = await parsePacketaResponse(response.data);

    // Check if response contains error
    if (parsedResponse.response?.status === "fault") {
      throw new Error(
        `Packeta API Error: ${parsedResponse.response.fault} - ${parsedResponse.response.string}`,
      );
    }

    return {
      pdf: parsedResponse.response || response.data, // Base64 PDF data
    };
  } catch (error: any) {
    console.error("Multiple labels generation error:", error);
    throw error;
  }
};

// Helper function to create XML for packet status
const createPacketStatusXML = (packetId: string, apiPassword: string): string => {
  return `<?xml version="1.0" encoding="utf-8"?>
<packetStatus>
  <apiPassword>${apiPassword}</apiPassword>
  <packetId>${packetId}</packetId>
</packetStatus>`;
};

export const getPacketaStatus = async (packetId: string) => {
  try {
    const xmlData = createPacketStatusXML(packetId, process.env.PACKETA_API_PASSWORD!);

    const response = await packetaApi.post("/", xmlData);

    // Parse XML response
    const parsedResponse = await parsePacketaResponse(response.data);

    // Check if response contains error
    if (parsedResponse.response?.status === "fault") {
      throw new Error(
        `Packeta API Error: ${parsedResponse.response.fault} - ${parsedResponse.response.string}`,
      );
    }

    return parsedResponse;
  } catch (error: any) {
    console.error("Status check error:", error);
    throw error;
  }
};

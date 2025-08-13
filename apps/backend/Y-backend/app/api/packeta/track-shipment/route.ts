import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

interface _PacketaTrackingResponse {
  status: "ok" | "fault";
  result?: {
    branchId: string;
    invoicedWeightGrams: string;
    courierInfo: unknown;
    services: unknown;
  };
  fault?: string;
  string?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const packetId = searchParams.get("packetId");

    if (!packetId) {
      return NextResponse.json({ error: "Packet ID is required" }, { status: 400 });
    }

    console.log(`🔍 Sledování zásilky ${packetId}...`);

    // XML request pro packetInfo
    const xmlData = `<?xml version="1.0" encoding="utf-8"?>
<packetInfo>
  <apiPassword>${process.env.PACKETA_API_PASSWORD}</apiPassword>
  <packetId>${packetId}</packetId>
</packetInfo>`;

    const response = await axios.post(process.env.PACKETA_BASE_URL!, xmlData, {
      headers: {
        "Content-Type": "application/xml",
      },
    });

    console.log("📦 Packeta API odpověď:", response.data);

    // Parse XML response
    if (typeof response.data === "string") {
      // Zkontroluj, jestli je odpověď úspěšná
      if (response.data.includes("<status>ok</status>")) {
        // Extract information from XML
        const branchIdMatch = response.data.match(/<branchId>([^<]*)<\/branchId>/);
        const weightMatch = response.data.match(
          /<invoicedWeightGrams>([^<]*)<\/invoicedWeightGrams>/,
        );

        return NextResponse.json({
          success: true,
          data: {
            packetId,
            branchId: branchIdMatch ? branchIdMatch[1] : null,
            invoicedWeightGrams: weightMatch ? weightMatch[1] : null,
            status: "found",
            raw: response.data,
          },
        });
      } else if (response.data.includes("<status>fault</status>")) {
        // Extract error message
        const faultMatch = response.data.match(/<fault>([^<]*)<\/fault>/);
        const stringMatch = response.data.match(/<string>([^<]*)<\/string>/);

        return NextResponse.json(
          {
            success: false,
            error: faultMatch ? faultMatch[1] : "Unknown fault",
            message: stringMatch ? stringMatch[1] : "No error message",
            raw: response.data,
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unexpected response format",
        raw: response.data,
      },
      { status: 500 },
    );
  } catch (error: unknown) {
    console.error("💥 Chyba při sledování zásilky:", error);
    const message = error instanceof Error ? error.message : String(error);
    const details = (error as any)?.response?.data;

    return NextResponse.json(
      {
        success: false,
        error: "Failed to track shipment",
        message,
        details,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { packetId } = await request.json();

    if (!packetId) {
      return NextResponse.json({ error: "Packet ID is required" }, { status: 400 });
    }

    // Redirect to GET method
    const url = new URL(request.url);
    url.searchParams.set("packetId", packetId);

    return GET(new NextRequest(url));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request body",
        message,
      },
      { status: 400 },
    );
  }
}

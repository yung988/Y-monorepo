import PDFDocument from "pdfkit";

export interface InvoiceItem {
  name: string;
  sku?: string;
  size?: string;
  quantity: number;
  price: number; // in cents
}

export interface InvoiceData {
  orderNumber: string;
  createdAt: Date;
  customerName?: string;
  customerEmail: string;
  customerPhone?: string;
  items: InvoiceItem[];
  totalAmount: number; // in cents
  currency: string; // e.g., CZK
  note?: string;
  seller?: {
    name: string;
    email?: string;
    address?: string;
    ico?: string;
    dic?: string;
  };
  shipping?: {
    method?: string;
    pickupPointName?: string | null;
  };
}

export async function generateInvoicePdfBuffer(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Uint8Array[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Header
      doc
        .fontSize(20)
        .text("Potvrzení objednávky / Faktura", { align: "left" })
        .moveDown(0.5);
      doc.fontSize(10).fillColor("#666").text("Nejsme plátci DPH").fillColor("#000");

      // Meta
      doc.moveDown();
      doc.fontSize(12).text(`Objednávka: #${data.orderNumber}`);
      doc.text(`Datum: ${data.createdAt.toLocaleDateString("cs-CZ")}`);

      // Parties
      doc.moveDown();
      doc.fontSize(12).text("Prodávající:");
      doc.fontSize(10).text(data.seller?.name || "Váš e‑shop");
      if (data.seller?.email) doc.text(`Email: ${data.seller.email}`);
      if (data.seller?.address) doc.text(data.seller.address);
      if (data.seller?.ico) doc.text(`IČO: ${data.seller.ico}`);
      if (data.seller?.dic) doc.text(`DIČ: ${data.seller.dic}`);

      doc.moveDown();
      doc.fontSize(12).text("Zákazník:");
      doc.fontSize(10).text(data.customerName || "—");
      doc.text(data.customerEmail);
      if (data.customerPhone) doc.text(data.customerPhone);
      if (data.shipping?.pickupPointName) doc.text(`Výdejní místo: ${data.shipping.pickupPointName}`);

      // Items table header
      doc.moveDown();
      doc.fontSize(12).text("Položky");
      doc.moveDown(0.5);
      doc.fontSize(10);

      const currency = data.currency.toUpperCase();
      const lineYStart = doc.y;

      // Table header
      doc.text("Položka", 50, lineYStart);
      doc.text("SKU", 220, lineYStart);
      doc.text("Velikost", 300, lineYStart);
      doc.text("Množství", 370, lineYStart);
      doc.text("Cena", 450, lineYStart, { align: "right" });

      doc.moveTo(50, lineYStart + 15).lineTo(545, lineYStart + 15).strokeColor("#ddd").stroke();

      // Items
      let y = lineYStart + 25;
      data.items.forEach((item) => {
        doc.text(item.name, 50, y);
        doc.text(item.sku || "—", 220, y);
        doc.text(item.size || "—", 300, y);
        doc.text(String(item.quantity), 370, y);
        doc.text(`${(item.price / 100).toLocaleString("cs-CZ")} ${currency}`, 450, y, { align: "right" });
        y += 18;
      });

      // Total
      doc.moveDown();
      doc.fontSize(12).text(`Celkem: ${(data.totalAmount / 100).toLocaleString("cs-CZ")} ${currency}`, { align: "right" });
      doc.fontSize(9).fillColor("#666").text("Včetně všech poplatků. Nejsme plátci DPH.", { align: "right" }).fillColor("#000");

      if (data.note) {
        doc.moveDown();
        doc.fontSize(10).text(data.note);
      }

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}


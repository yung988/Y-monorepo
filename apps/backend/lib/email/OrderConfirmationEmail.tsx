import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  items: Array<{
    name: string;
    variant?: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  isPacketa?: boolean;
  packetaPickupPoint?: string;
}

export const OrderConfirmationEmail = ({
  orderNumber,
  customerName,
  orderDate,
  items,
  subtotal,
  shipping,
  total,
  shippingAddress,
  isPacketa,
  packetaPickupPoint,
}: OrderConfirmationEmailProps) => {
  const previewText = `Potvrzení objednávky #${orderNumber} - Yeezuz Store`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoContainer}>
            <Heading style={h1}>YEEZUZ</Heading>
          </Section>

          {/* Header */}
          <Section style={header}>
            <Heading style={h2}>Děkujeme za vaši objednávku!</Heading>
            <Text style={paragraph}>Dobrý den {customerName},</Text>
            <Text style={paragraph}>
              Vaše objednávka #{orderNumber} byla úspěšně přijata a zaplacena. Zboží vám připravíme
              a odešleme co nejdříve.
            </Text>
          </Section>

          {/* Order Info */}
          <Section style={orderInfo}>
            <Row>
              <Column>
                <Text style={label}>Číslo objednávky:</Text>
                <Text style={value}>{orderNumber}</Text>
              </Column>
              <Column>
                <Text style={label}>Datum objednávky:</Text>
                <Text style={value}>{orderDate}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Items */}
          <Section>
            <Heading style={h3}>Objednané položky</Heading>
            {items.map((item, index) => (
              <Row key={index} style={productRow}>
                <Column style={productImageColumn}>
                  {item.image ? (
                    <Img
                      src={item.image}
                      width="80"
                      height="80"
                      alt={item.name}
                      style={productImage}
                    />
                  ) : (
                    <div style={placeholderImage} />
                  )}
                </Column>
                <Column style={productDetailsColumn}>
                  <Text style={productName}>{item.name}</Text>
                  {item.variant && <Text style={productVariant}>Velikost: {item.variant}</Text>}
                  <Text style={productQuantity}>Množství: {item.quantity}</Text>
                </Column>
                <Column style={productPriceColumn}>
                  <Text style={productPrice}>{(item.price / 100).toFixed(2)} Kč</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Totals */}
          <Section style={totals}>
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Mezisoučet:</Text>
              </Column>
              <Column align="right">
                <Text style={totalValue}>{(subtotal / 100).toFixed(2)} Kč</Text>
              </Column>
            </Row>
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Doprava:</Text>
              </Column>
              <Column align="right">
                <Text style={totalValue}>
                  {shipping === 0 ? "ZDARMA" : `${(shipping / 100).toFixed(2)} Kč`}
                </Text>
              </Column>
            </Row>
            <Hr style={hr} />
            <Row style={totalRow}>
              <Column>
                <Text style={finalTotalLabel}>Celkem:</Text>
              </Column>
              <Column align="right">
                <Text style={finalTotalValue}>{(total / 100).toFixed(2)} Kč</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Shipping Info */}
          <Section>
            <Heading style={h3}>Doručovací informace</Heading>
            {isPacketa && packetaPickupPoint ? (
              <Text style={paragraph}>
                <strong>Výdejní místo Packeta:</strong>
                <br />
                {packetaPickupPoint}
              </Text>
            ) : shippingAddress ? (
              <Text style={paragraph}>
                {shippingAddress.line1}
                <br />
                {shippingAddress.line2 && (
                  <>
                    {shippingAddress.line2}
                    <br />
                  </>
                )}
                {shippingAddress.postalCode} {shippingAddress.city}
                <br />
                {shippingAddress.country}
              </Text>
            ) : null}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Máte dotazy? Kontaktujte nás na{" "}
              <Link href="mailto:info@yeezuz2020.store" style={link}>
                info@yeezuz2020.store
              </Link>
            </Text>
            <Text style={footerText}>
              Sledujte stav vaší objednávky na{" "}
              <Link href={`https://yeezuz2020.store/order-status/${orderNumber}`} style={link}>
                yeezuz2020.store
              </Link>
            </Text>
            <Hr style={hr} />
            <Text style={copyright}> 2024 Yeezuz Store. Všechna práva vyhrazena.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const logoContainer = {
  padding: "32px 20px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#000",
  fontSize: "36px",
  fontWeight: "700",
  letterSpacing: "2px",
  lineHeight: "40px",
  margin: "0",
};

const header = {
  padding: "0 48px",
};

const h2 = {
  color: "#000",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "32px",
  margin: "0 0 20px",
};

const h3 = {
  color: "#000",
  fontSize: "18px",
  fontWeight: "600",
  lineHeight: "28px",
  margin: "20px 0 16px",
  padding: "0 48px",
};

const paragraph = {
  color: "#444",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
};

const orderInfo = {
  padding: "20px 48px",
  backgroundColor: "#f6f9fc",
  margin: "20px 0",
};

const label = {
  color: "#666",
  fontSize: "14px",
  margin: "0",
};

const value = {
  color: "#000",
  fontSize: "16px",
  fontWeight: "600",
  margin: "4px 0 0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 48px",
};

const productRow = {
  padding: "16px 48px",
  borderBottom: "1px solid #e6ebf1",
};

const productImageColumn = {
  width: "80px",
  paddingRight: "16px",
};

const productImage = {
  borderRadius: "8px",
  objectFit: "cover" as const,
};

const placeholderImage = {
  width: "80px",
  height: "80px",
  backgroundColor: "#f0f0f0",
  borderRadius: "8px",
};

const productDetailsColumn = {
  paddingRight: "16px",
};

const productName = {
  color: "#000",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 4px",
};

const productVariant = {
  color: "#666",
  fontSize: "14px",
  margin: "0 0 4px",
};

const productQuantity = {
  color: "#666",
  fontSize: "14px",
  margin: "0",
};

const productPriceColumn = {
  textAlign: "right" as const,
  verticalAlign: "top" as const,
};

const productPrice = {
  color: "#000",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
};

const totals = {
  padding: "0 48px",
};

const totalRow = {
  marginBottom: "8px",
};

const totalLabel = {
  color: "#666",
  fontSize: "16px",
  margin: "0",
};

const totalValue = {
  color: "#000",
  fontSize: "16px",
  margin: "0",
  textAlign: "right" as const,
};

const finalTotalLabel = {
  color: "#000",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
};

const finalTotalValue = {
  color: "#000",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
  textAlign: "right" as const,
};

const footer = {
  padding: "32px 48px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 8px",
};

const link = {
  color: "#000",
  textDecoration: "underline",
};

const copyright = {
  color: "#999",
  fontSize: "12px",
  margin: "16px 0 0",
};

export default OrderConfirmationEmail;

import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface OrderStatusUpdateEmailProps {
  orderNumber: string;
  customerName: string;
  newStatus: "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  message?: string;
}

const statusMessages = {
  processing: {
    title: "Vaše objednávka se zpracovává",
    description: "Právě připravujeme vaši objednávku k odeslání.",
    icon: "📦",
  },
  shipped: {
    title: "Vaše objednávka byla odeslána",
    description: "Vaše objednávka je na cestě k vám!",
    icon: "🚚",
  },
  delivered: {
    title: "Vaše objednávka byla doručena",
    description: "Děkujeme za váš nákup!",
    icon: "✅",
  },
  cancelled: {
    title: "Vaše objednávka byla zrušena",
    description: "Vaše objednávka byla bohužel zrušena.",
    icon: "❌",
  },
};

export const OrderStatusUpdateEmail = ({
  orderNumber,
  customerName,
  newStatus,
  trackingNumber,
  trackingUrl,
  estimatedDelivery,
  message,
}: OrderStatusUpdateEmailProps) => {
  const statusInfo = statusMessages[newStatus];
  const previewText = `${statusInfo.title} - Objednávka #${orderNumber}`;

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

          {/* Status Icon */}
          <Section style={iconSection}>
            <Text style={statusIcon}>{statusInfo.icon}</Text>
          </Section>

          {/* Header */}
          <Section style={header}>
            <Heading style={h2}>{statusInfo.title}</Heading>
            <Text style={paragraph}>Dobrý den {customerName},</Text>
            <Text style={paragraph}>{statusInfo.description}</Text>
          </Section>

          {/* Order Info */}
          <Section style={orderInfo}>
            <Text style={label}>Číslo objednávky:</Text>
            <Text style={value}>{orderNumber}</Text>
          </Section>

          {/* Tracking Info (if shipped) */}
          {newStatus === "shipped" && trackingNumber && (
            <>
              <Hr style={hr} />
              <Section style={trackingSection}>
                <Heading style={h3}>Informace o doručení</Heading>
                <Row style={trackingRow}>
                  <Column>
                    <Text style={label}>Sledovací číslo:</Text>
                    <Text style={value}>{trackingNumber}</Text>
                  </Column>
                  {estimatedDelivery && (
                    <Column>
                      <Text style={label}>Předpokládané doručení:</Text>
                      <Text style={value}>{estimatedDelivery}</Text>
                    </Column>
                  )}
                </Row>
                {trackingUrl && (
                  <Button style={trackButton} href={trackingUrl}>
                    Sledovat zásilku
                  </Button>
                )}
              </Section>
            </>
          )}

          {/* Custom Message */}
          {message && (
            <>
              <Hr style={hr} />
              <Section style={messageSection}>
                <Text style={paragraph}>{message}</Text>
              </Section>
            </>
          )}

          {/* CTA Button */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={`https://yeezuz2020.store/order-status/${orderNumber}`}>
              Zobrazit detaily objednávky
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Máte dotazy? Kontaktujte nás na{" "}
              <Link href="mailto:info@yeezuz2020.store" style={link}>
                info@yeezuz2020.store
              </Link>
            </Text>
            <Hr style={hr} />
            <Text style={copyright}>© 2024 Yeezuz Store. Všechna práva vyhrazena.</Text>
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

const iconSection = {
  textAlign: "center" as const,
  padding: "0 20px",
};

const statusIcon = {
  fontSize: "64px",
  lineHeight: "1",
  margin: "0",
};

const header = {
  padding: "0 48px",
  textAlign: "center" as const,
};

const h2 = {
  color: "#000",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "32px",
  margin: "20px 0",
};

const h3 = {
  color: "#000",
  fontSize: "18px",
  fontWeight: "600",
  lineHeight: "28px",
  margin: "0 0 16px",
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
  textAlign: "center" as const,
};

const label = {
  color: "#666",
  fontSize: "14px",
  margin: "0",
};

const value = {
  color: "#000",
  fontSize: "18px",
  fontWeight: "600",
  margin: "4px 0 0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 48px",
};

const trackingSection = {
  padding: "0 48px",
};

const trackingRow = {
  marginBottom: "20px",
};

const trackButton = {
  backgroundColor: "#000",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 20px",
  margin: "20px auto 0",
};

const messageSection = {
  padding: "0 48px",
  backgroundColor: "#f6f9fc",
  margin: "0 48px",
  borderRadius: "8px",
};

const ctaSection = {
  padding: "32px 48px",
};

const ctaButton = {
  backgroundColor: "#000",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 32px",
  margin: "0 auto",
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

export default OrderStatusUpdateEmail;

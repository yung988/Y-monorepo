"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { adminApi } from "@/lib/admin-api";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
console.log("🔑 Stripe key:", stripeKey ? `${stripeKey.substring(0, 20)}...` : "NOT DEFINED");
if (!stripeKey) {
  console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined");
}
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export interface BillingData {
  email: string;
  name?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  [key: string]: string | undefined;
}

export interface PickupPoint {
  id: string;
  name?: string;
  street?: string;
  zip?: string;
  city?: string;
  [key: string]: string | undefined;
}

export default function StripePaymentElement({
  billingData,
  pickupPoint,
}: {
  billingData: BillingData;
  pickupPoint: PickupPoint | null;
}) {
  const { items } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntentCreated, setPaymentIntentCreated] = useState(false);
  const isCreatingPaymentIntent = useRef(false);

  console.log("🛒 Cart items:", items);
  console.log("📝 Billing data:", billingData);
  console.log("📍 Pickup point:", pickupPoint);
  console.log(
    "🔄 Component render - items length:",
    items.length,
    "has billingData:",
    !!billingData,
  );

  // Use ref to store idempotency key so it remains stable across renders
  const idempotencyKeyRef = useRef<string | null>(null);

  // Generate idempotency key only once when billing data is available
  const idempotencyKey = useMemo(() => {
    if (!billingData?.email) {
      idempotencyKeyRef.current = null;
      return null;
    }

    // Only generate new key if we don't have one or email changed
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `${billingData.email}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log("🔑 Generated new idempotency key:", idempotencyKeyRef.current);
    }

    return idempotencyKeyRef.current;
  }, [billingData?.email]);

  // Memoize the request data to prevent unnecessary re-renders
  const requestData = useMemo(() => {
    if (!billingData || items.length === 0 || !idempotencyKey) return null;

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryPrice = 79; // Zasilkovna delivery price
    const finalAmount = (totalAmount + deliveryPrice) * 100; // Convert to cents

    const orderItems = items.map((item) => ({
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      price: item.price,
    }));

    return {
      amount: finalAmount,
      currency: "czk",
      customerEmail: billingData.email || "",
      customerName: billingData.firstName
        ? `${billingData.firstName} ${billingData.lastName}`
        : billingData.name || "",
      customerPhone: billingData.phone || "",
      shippingAddress: {
        street: billingData.street,
        city: billingData.city,
        postalCode: billingData.postalCode,
      },
      packetaPickupPointId: pickupPoint?.id ? String(pickupPoint.id) : null,
      packetaPickupPointName: pickupPoint?.name || "",
      packetaPickupPointAddress: pickupPoint
        ? `${pickupPoint.street}, ${pickupPoint.zip} ${pickupPoint.city}`
        : "",
      orderData: {
        items: orderItems,
        notes: null,
      },
      idempotencyKey,
    };
  }, [items, billingData, pickupPoint, idempotencyKey]);

  // Memoized function to create payment intent
  const createPaymentIntent = useCallback(async () => {
    if (!requestData || isCreatingPaymentIntent.current || paymentIntentCreated) {
      console.log("⏭️ Skipping payment intent creation:", {
        hasRequestData: !!requestData,
        isCreating: isCreatingPaymentIntent.current,
        alreadyCreated: paymentIntentCreated,
        idempotencyKey: requestData?.idempotencyKey,
      });
      return;
    }

    isCreatingPaymentIntent.current = true;
    setLoading(true);
    setError(null);

    console.log("🚀 Creating payment intent with idempotency key:", requestData.idempotencyKey);

    try {
      const data = await adminApi.createPaymentIntent(requestData);
      console.log("✅ Payment intent created successfully:", {
        clientSecret: data.clientSecret ? "RECEIVED" : "MISSING",
        paymentIntentId: data.paymentIntentId,
      });

      if (!data.clientSecret || !data.orderId || !data.accessToken) {
        throw new Error("Incomplete payment intent data from server");
      }

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setAccessToken(data.accessToken);
      setPaymentIntentCreated(true);
      console.log("✅ Payment intent state updated successfully with orderId:", data.orderId);
    } catch (e: unknown) {
      console.error("❌ Payment intent creation failed:", e);

      let errorMessage = "Chyba při vytváření platby";
      if (e instanceof Error) {
        errorMessage = e.message;
        // Handle specific error cases
        if (e.message.includes("Failed to fetch")) {
          errorMessage = "Chyba sítě - zkuste to prosím znovu";
        } else if (e.message.includes("500")) {
          errorMessage = "Chyba serveru - zkuste to prosím znovu";
        }
      }

      setError(errorMessage);
      // Reset payment intent created flag on error so user can retry
      setPaymentIntentCreated(false);
    } finally {
      setLoading(false);
      isCreatingPaymentIntent.current = false;
    }
  }, [requestData, paymentIntentCreated]);

  // Memoize Stripe options to prevent unnecessary re-renders - moved to top to avoid conditional hooks
  const options = useMemo(() => {
    return clientSecret
      ? {
          clientSecret,
          appearance: { theme: "stripe" as const },
          // Remove defaultValues to avoid Stripe warnings
          loader: "auto" as const,
        }
      : {
          appearance: { theme: "stripe" as const },
          loader: "auto" as const,
        };
  }, [clientSecret]);

  useEffect(() => {
    console.log(
      "📋 useEffect check - requestData:",
      !!requestData,
      "paymentIntentCreated:",
      paymentIntentCreated,
    );
    if (requestData && !paymentIntentCreated && !isCreatingPaymentIntent.current) {
      console.log("✅ Triggering payment intent creation...");
      createPaymentIntent();
    }
  }, [requestData, paymentIntentCreated, createPaymentIntent]);

  console.log("💳 Client secret:", clientSecret ? "SET" : "NOT SET");
  console.log("🌐 Stripe promise:", stripePromise ? "LOADED" : "NOT LOADED");

  // Handle error states without early returns to avoid conditional hook issues
  if (!stripePromise) {
    return <div className="text-red-600">Stripe klíč není nakonfigurován</div>;
  }

  if (loading) {
    return <div>Načítání platebního formuláře…</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-red-600">{error}</div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setPaymentIntentCreated(false);
            createPaymentIntent();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Zkouším znovu..." : "Zkusit znovu"}
        </button>
      </div>
    );
  }

  // Always render Elements component to avoid conditional hook usage
  return (
    <div>
      {!clientSecret ? (
        <div className="text-yellow-600">Čekám na payment intent...</div>
      ) : (
        <Elements stripe={stripePromise} options={options}>
          <StripePaymentForm
            billingData={billingData}
            orderId={orderId}
            accessToken={accessToken}
          />
        </Elements>
      )}
    </div>
  );
}

function StripePaymentForm({
  billingData,
  orderId,
  accessToken,
}: {
  billingData: BillingData;
  orderId: string | null;
  accessToken: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error("💳 Stripe or elements not ready");
      setError("Stripe není připraven");
      return;
    }

    // Ověření, zda jsou vyplněna všechna povinná pole
    const requiredFields = ["email", "firstName", "lastName", "street", "city", "postalCode"];
    const missingFields = requiredFields.filter((field) => !billingData[field]);

    if (missingFields.length > 0) {
      console.error("❌ Chybějící povinné údaje:", missingFields);
      setError("Vyplňte prosím všechna povinná pole fakturačních údajů");
      return;
    }

    // Ověření formátu e-mailu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingData.email || "")) {
      setError("Zadejte platný e-mail");
      return;
    }

    setIsProcessing(true);
    setError(null);

    console.log("💳 Confirming payment...");

    try {
      if (!orderId || !accessToken) {
        console.error("❌ Missing orderId or accessToken for redirection");
        setError("Chybí informace o objednávce pro přesměrování.");
        setIsProcessing(false);
        try {
          localStorage.setItem("cart", JSON.stringify([]));
        } catch {}
        try {
          const event = new StorageEvent("storage", { key: "cart", newValue: JSON.stringify([]) });
          window.dispatchEvent(event);
        } catch {}
        return;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success?order_id=${orderId}&token=${accessToken}`,
        },
      });

      if (error) {
        console.error("💳 Payment confirmation error:", error);
        setError(error.message || "Chyba při zpracování platby");
      } else {
        console.log("✅ Payment confirmed successfully");
        try {
          localStorage.setItem("cart", JSON.stringify([]));
        } catch {}
        try {
          const event = new StorageEvent("storage", { key: "cart", newValue: JSON.stringify([]) });
          window.dispatchEvent(event);
        } catch {}
      }
    } catch (e) {
      console.error("💳 Unexpected payment error:", e);
      setError("Neočekávaná chyba při platbě");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement
        options={{
          defaultValues: {
            billingDetails: {
              email: billingData?.email,
              name: billingData?.firstName
                ? `${billingData.firstName} ${billingData.lastName}`
                : billingData?.name,
              phone: billingData?.phone,
              address: {
                postal_code: billingData?.postalCode,
                country: "CZ",
              },
            },
          },
        }}
        onReady={() => {
          console.log("💳 PaymentElement is ready");
          setIsReady(true);
        }}
        onFocus={() => setError(null)}
        onLoadError={(error) => {
          console.error("💳 PaymentElement load error:", error);
          setError("Chyba při načítání platebního formuláře");
        }}
      />
      {error && <div className="text-red-600">{error}</div>}
      <button
        onClick={handleSubmit}
        disabled={!isReady || isProcessing || !stripe || !elements}
        className="w-full bg-black text-white p-3 text-xs font-medium tracking-wide hover:bg-gray-900 transition-colors disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed uppercase"
        type="button"
      >
        {isProcessing
          ? "Zpracovávám platbu..."
          : isReady
            ? "Zaplatit objednávku"
            : "Načítám platební formulář..."}
      </button>
    </div>
  );
}

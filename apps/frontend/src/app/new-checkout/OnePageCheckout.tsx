"use client";

import { ChevronDown, ChevronUp, Minus, Package, Plus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ZasilkovnaWidget from "@/components/checkout/ZasilkovnaWidget";
import { useCart } from "@/context/CartContext";
import { adminApi } from "@/lib/admin-api";

// Import the ZasilkovnaPoint type from the widget
interface ZasilkovnaPoint {
  id: string;
  name: string;
  city: string;
  street: string;
  zip: string;
  country: string;
  photo?: string;
  openingHours?: string;
  [key: string]: string | undefined;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
}

interface CartSummaryProps {
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  subtotal: number;
  deliveryPrice: number;
  total: number;
  isMobile?: boolean;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

// Komponenta košíku
const CartSummary = ({
  cartItems,
  updateQuantity,
  removeItem,
  subtotal,
  deliveryPrice,
  total,
  isMobile = false,
  isCollapsed = false,
  toggleCollapse,
}: CartSummaryProps) => {
  if (isMobile && isCollapsed) {
    return (
      <div className="sticky top-0 z-50 bg-white border-b border-gray-300">
        <button
          type="button"
          onClick={toggleCollapse}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <div>
            <p className="text-xs font-medium tracking-wide uppercase">
              Zobrazit souhrn objednávky
            </p>
            <p className="text-xs text-gray-600 mt-1">{total.toLocaleString("cs-CZ")} Kč</p>
          </div>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-white ${isMobile ? "border-b border-gray-300" : "border border-gray-300"} ${!isMobile ? "sticky top-0 h-screen overflow-y-auto" : ""}`}
    >
      {isMobile && (
        <div className="sticky top-0 bg-white border-b border-gray-300 p-4">
          <button
            type="button"
            onClick={toggleCollapse}
            className="w-full flex items-center justify-between text-left"
          >
            <p className="text-xs font-medium tracking-wide uppercase">Souhrn objednávky</p>
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="p-6">
        {!isMobile && (
          <h2 className="text-xs font-medium tracking-wide uppercase mb-6">Souhrn objednávky</h2>
        )}

        {/* Položky košíku */}
        <div className="space-y-4 mb-6">
          {cartItems.map((item, index) => (
            <div
              key={`${item.id}-${item.size || "no-size"}-${index}`}
              className="flex items-start gap-4 pb-4 border-b border-gray-200"
            >
              <div className="relative w-16 h-16 bg-gray-100 flex-shrink-0">
                <Image
                  src={item.image || "/placeholder.jpg"}
                  alt={item.name}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-medium truncate">{item.name}</h3>
                {item.size && <p className="text-xs text-gray-600 mt-1">Velikost: {item.size}</p>}
                <p className="text-xs font-medium mt-1">{item.price.toLocaleString("cs-CZ")} Kč</p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 hover:bg-gray-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 hover:bg-gray-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-medium">
                  {(item.price * item.quantity).toLocaleString("cs-CZ")} Kč
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Souhrn cen */}
        <div className="border-t border-gray-300 pt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span>Mezisoučet</span>
            <span>{subtotal.toLocaleString("cs-CZ")} Kč</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Doprava</span>
            <span>{deliveryPrice.toLocaleString("cs-CZ")} Kč</span>
          </div>
          <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-300">
            <span>Celkem</span>
            <span>{total.toLocaleString("cs-CZ")} Kč</span>
          </div>
        </div>

        {cartItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-xs">Váš košík je prázdný</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Komponenta checkout formuláře
function CheckoutForm() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [isCompany, setIsCompany] = useState(false);
  const [differentShipping, setDifferentShipping] = useState(false);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<ZasilkovnaPoint | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCartCollapsed, setIsCartCollapsed] = useState(true);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "CZ",
    companyName: "",
    ico: "",
    dic: "",
    shippingStreet: "",
    shippingCity: "",
    shippingPostalCode: "",
    shippingCountry: "CZ",
  });

  // Detekce mobilního zařízení
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveItem = (id: string) => {
    if (confirm("Opravdu chcete odstranit tuto položku z košíku?")) {
      removeItem(id);
    }
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
  };

  const subtotal = totalPrice;
  const deliveryPrice = 79; // Zásilkovna fixed price
  const total = subtotal + deliveryPrice;

  // Funkce pro uložení objednávky do Supabase
  const saveOrderToSupabase = async (orderData: any) => {
    try {
      console.log("Objednávka by byla uložena do Supabase:", orderData);

      // Simulace úspěšného uložení - nahraďte skutečným API callem
      return {
        success: true,
        orderId: Date.now().toString(),
        token: "sample-token-" + Date.now()
      };
    } catch (error) {
      console.error("Chyba při ukládání objednávky:", error);
      return { success: false, error: (error as Error).message };
    }
  };

  const handleSuccessfulPayment = async () => {
    setIsSubmitting(true);

    try {
      // Základní validace
      if (
        !formData.email ||
        !formData.firstName ||
        !formData.lastName ||
        !formData.phone ||
        !formData.street ||
        !formData.city ||
        !formData.postalCode
      ) {
        alert("Prosím vyplňte všechny povinné údaje");
        return;
      }

      if (!selectedPickupPoint) {
        alert("Prosím vyberte výdejní místo Zásilkovny");
        return;
      }

      if (items.length === 0) {
        alert("Váš košík je prázdný");
        return;
      }

      // Příprava dat pro uložení
      const orderData = {
        status: "pending",
        payment_status: "paid",
        total_price: total * 100, // Convert to cents
        subtotal: subtotal * 100,
        delivery_price: deliveryPrice * 100,
        currency: "CZK",
        created_at: new Date().toISOString(),

        customer_email: formData.email,
        customer_first_name: formData.firstName,
        customer_last_name: formData.lastName,
        customer_phone: formData.phone,

        billing_street: formData.street,
        billing_city: formData.city,
        billing_postal_code: formData.postalCode,
        billing_country: formData.country,

        is_company: isCompany,
        company_name: isCompany ? formData.companyName : null,
        company_ico: isCompany ? formData.ico : null,
        company_dic: isCompany ? formData.dic : null,

        different_delivery: differentShipping,
        delivery_street: differentShipping ? formData.shippingStreet : formData.street,
        delivery_city: differentShipping ? formData.shippingCity : formData.city,
        delivery_postal_code: differentShipping ? formData.shippingPostalCode : formData.postalCode,
        delivery_country: differentShipping ? formData.shippingCountry : formData.country,

        delivery_method: "zasilkovna",
        pickup_point_id: selectedPickupPoint.id,
        pickup_point_name: selectedPickupPoint.name,
        pickup_point_street: selectedPickupPoint.street,
        pickup_point_city: selectedPickupPoint.city,
        pickup_point_zip: selectedPickupPoint.zip,
        pickup_point_country: selectedPickupPoint.country,

        items: items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          product_size: item.size,
          quantity: item.quantity,
          unit_price: item.price * 100,
          total_price: item.price * item.quantity * 100,
          image: item.image,
        })),
      };

      const result = await saveOrderToSupabase(orderData);

      if (result.success) {
        // DŮLEŽITÉ: Vyčistit košík před přesměrováním
        clearCart();

        // Přesměrovat na success stránku
        router.push(`/success?order_id=${result.orderId}&token=${result.token}`);
      } else {
        alert("Došlo k chybě při zpracování objednávky. Zkuste to znovu.");
      }
    } catch (error) {
      console.error("Chyba při zpracování objednávky:", error);
      alert("Došlo k chybě při zpracování objednávky.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSuccessfulPayment();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Cart Summary */}
      {isMobile && (
        <CartSummary
          cartItems={items}
          updateQuantity={handleQuantityChange}
          removeItem={handleRemoveItem}
          subtotal={subtotal}
          deliveryPrice={deliveryPrice}
          total={total}
          isMobile={true}
          isCollapsed={isCartCollapsed}
          toggleCollapse={() => setIsCartCollapsed(!isCartCollapsed)}
        />
      )}

      <div className="lg:grid lg:grid-cols-2 lg:gap-0">
        {/* Levá strana - Formulář */}
        <div className="lg:overflow-y-auto lg:h-screen p-6 lg:p-12">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-2xl font-medium tracking-wide uppercase">YEEZUZ2020</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Kontaktní informace */}
              <div>
                <h2 className="text-xs font-medium tracking-wide uppercase mb-6">
                  Kontaktní informace
                </h2>

                <div className="space-y-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-3 text-xs focus:border-black focus:outline-none"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Jméno"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 p-3 text-xs focus:border-black focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Příjmení"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 p-3 text-xs focus:border-black focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex items-center border border-gray-300">
                    <div className="flex items-center px-3 border-r border-gray-300">
                      <span className="text-xs mr-2">🇨🇿</span>
                      <span className="text-xs">+420</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Telefonní číslo"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="flex-1 p-3 text-xs border-0 outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Fakturační adresa */}
              <div>
                <h2 className="text-xs font-medium tracking-wide uppercase mb-6">
                  Fakturační adresa
                </h2>

                <div className="space-y-4">
                  <input
                    type="text"
                    name="street"
                    placeholder="Ulice a číslo popisné"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-3 text-xs focus:border-black focus:outline-none"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="Město"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 p-3 text-xs focus:border-black focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="PSČ"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 p-3 text-xs focus:border-black focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isCompany"
                      checked={isCompany}
                      onChange={(e) => setIsCompany(e.target.checked)}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300"
                    />
                    <label
                      htmlFor="isCompany"
                      className="ml-2 block text-xs text-black cursor-pointer"
                    >
                      NAKUPUJI NA FIRMU
                    </label>
                  </div>

                  {isCompany && (
                    <div className="space-y-4 mt-4 p-4 border border-gray-300">
                      <input
                        type="text"
                        name="companyName"
                        placeholder="Název firmy"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 p-3 text-xs focus:border-black focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="ico"
                          placeholder="IČO"
                          value={formData.ico}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 p-3 text-xs focus:border-black focus:outline-none"
                        />
                        <input
                          type="text"
                          name="dic"
                          placeholder="DIČ"
                          value={formData.dic}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 p-3 text-xs focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="differentShipping"
                      checked={differentShipping}
                      onChange={(e) => setDifferentShipping(e.target.checked)}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300"
                    />
                    <label
                      htmlFor="differentShipping"
                      className="ml-2 block text-xs text-black cursor-pointer"
                    >
                      DORUČIT NA JINOU ADRESU
                    </label>
                  </div>

                  {differentShipping && (
                    <div className="space-y-4 mt-4 p-4 border border-gray-300">
                      <p className="text-xs font-medium tracking-wide uppercase">
                        Doručovací adresa
                      </p>
                      <input
                        type="text"
                        name="shippingStreet"
                        placeholder="Ulice a číslo popisné"
                        value={formData.shippingStreet}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 p-3 text-xs focus:border-black focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="shippingCity"
                          placeholder="Město"
                          value={formData.shippingCity}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 p-3 text-xs focus:border-black focus:outline-none"
                        />
                        <input
                          type="text"
                          name="shippingPostalCode"
                          placeholder="PSČ"
                          value={formData.shippingPostalCode}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 p-3 text-xs focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Doprava - Zásilkovna */}
              <div>
                <h2 className="text-xs font-medium tracking-wide uppercase mb-6">Způsob dopravy</h2>

                <div className="border-2 border-black p-6">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-black" />
                    <div className="flex-1">
                      <h3 className="font-medium text-xs tracking-wide uppercase">Zásilkovna</h3>
                      <p className="text-xs text-gray-600">Výdejní místo dle vašeho výběru</p>
                      <p className="text-xs text-gray-500">Doručení: 1-2 dny</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-xs">79 KČ</p>
                    </div>
                  </div>
                </div>

                <ZasilkovnaWidget
                  onPointSelect={setSelectedPickupPoint}
                  country="cz"
                  language="cs"
                />
              </div>

              {/* Platba */}
              {formData.email &&
                formData.firstName &&
                formData.lastName &&
                formData.phone &&
                formData.street &&
                formData.city &&
                formData.postalCode &&
                selectedPickupPoint ? (
                <div className="pt-6">
                  <h2 className="text-xs font-medium tracking-wide uppercase mb-6">Platba</h2>

                  <button
                    type="button"
                    className="w-full bg-black text-white p-3 text-xs font-medium tracking-wide hover:bg-gray-900 transition-colors disabled:bg-zinc-300 disabled:text-zinc-500 uppercase"
                    onClick={async () => {
                      try {
                        const resp = await adminApi.createCheckout({
                          items: items.map((it) => ({
                            productId: it.productId,
                            variantId: it.variantId,
                            quantity: it.quantity,
                          })),
                          shipping: {
                            email: formData.email,
                            name: `${formData.firstName} ${formData.lastName}`.trim(),
                            address: formData.street,
                            city: formData.city,
                            postalCode: formData.postalCode,
                            country: formData.country || "CZ",
                            phone: formData.phone,
                          },
                          totalCents: total * 100,
                          shippingCents: deliveryPrice * 100,
                          zasilkovnaPointId: selectedPickupPoint.id,
                          zasilkovnaPointName: selectedPickupPoint.name,
                        });
                        const url = resp.url || resp.checkout_url;
                        if (url) {
                          // Tip: před redirectem můžeme uložit případný state
                          window.location.href = url;
                        } else {
                          alert("Nepodařilo se vytvořit checkout session");
                        }
                      } catch (e: any) {
                        alert(e?.message || "Chyba při vytváření checkoutu");
                      }
                    }}
                  >
                    Zaplatit
                  </button>

                  <p className="text-[9px] mt-4 leading-tight text-gray-600">
                    Odesláním platby souhlasíte s našimi obchodními podmínkami a zásadami ochrany
                    osobních údajů.
                  </p>
                </div>
              ) : (
                <div className="pt-6">
                  <div className="w-full bg-gray-200 text-gray-500 p-3 text-xs font-medium tracking-wide text-center uppercase">
                    {!formData.email ||
                      !formData.firstName ||
                      !formData.lastName ||
                      !formData.phone ||
                      !formData.street ||
                      !formData.city ||
                      !formData.postalCode
                      ? "Vyplňte všechny povinné údaje"
                      : !selectedPickupPoint
                        ? "Vyberte výdejní místo Zásilkovny"
                        : "Připravujeme platbu..."}
                  </div>
                  <p className="text-[9px] mt-4 leading-tight text-gray-600">
                    Po vyplnění všech údajů se zobrazí platební formulář.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Pravá strana - Košík (pouze desktop) */}
        {!isMobile && (
          <div className="bg-gray-50">
            <CartSummary
              cartItems={items}
              updateQuantity={handleQuantityChange}
              removeItem={handleRemoveItem}
              subtotal={subtotal}
              deliveryPrice={deliveryPrice}
              total={total}
              isMobile={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Hlavní komponenta
export default function UnifiedCheckout() {
  return <CheckoutForm />;
}
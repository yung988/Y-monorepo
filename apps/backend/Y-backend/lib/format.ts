/**
 * Formátování částek pro admin rozhraní
 * Částky v databázi jsou uložené v centech/haléřích, proto je třeba dělit 100
 */

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export function formatCurrency(amount: number): string {
  return formatPrice(amount);
}

/**
 * Převod ceny z string na number pro uložení do databáze
 */
export function parsePrice(priceString: string): number {
  const price = parseFloat(priceString);
  return isNaN(price) ? 0 : price;
}

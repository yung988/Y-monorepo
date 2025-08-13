export interface BillingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  [key: string]: string | undefined;
}

export interface ShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  country?: string;
  pickupPointId?: string;
}

export interface SessionData {
  id: string;
  payment_status: string;
  customer_details?: {
    email: string;
    name: string;
  };
  amount_total?: number;
  currency?: string;
}

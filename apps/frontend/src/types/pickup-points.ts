export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  street?: string;
  zip?: string;
  [key: string]: string | undefined;
}

export interface PickupPointAvailability {
  pickup_point_id: string;
  order_id: string;
  available: boolean;
}

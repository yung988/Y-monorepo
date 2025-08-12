export const mockProducts = [
  {
    id: "1",
    name: "Bavlněné tričko Basic",
    sku: "TSH-001",
    category: "Trička",
    price: 599,
    stock: 45,
    status: "active",
    image: "/placeholder.svg?height=64&width=64",
    variants: [
      { size: "S", stock: 10 },
      { size: "M", stock: 15 },
      { size: "L", stock: 12 },
      { size: "XL", stock: 8 },
    ],
  },
  {
    id: "2",
    name: "Džínové kalhoty Slim",
    sku: "JNS-002",
    category: "Kalhoty",
    price: 1299,
    stock: 23,
    status: "active",
    image: "/placeholder.svg?height=64&width=64",
    variants: [
      { size: "S", stock: 5 },
      { size: "M", stock: 8 },
      { size: "L", stock: 6 },
      { size: "XL", stock: 4 },
    ],
  },
  {
    id: "3",
    name: "Zimní bunda Parka",
    sku: "JCK-003",
    category: "Bundy",
    price: 2499,
    stock: 12,
    status: "inactive",
    image: "/placeholder.svg?height=64&width=64",
    variants: [
      { size: "S", stock: 2 },
      { size: "M", stock: 4 },
      { size: "L", stock: 4 },
      { size: "XL", stock: 2 },
    ],
  },
];

export const mockOrders = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    customer: {
      name: "Jan Novák",
      email: "jan.novak@email.cz",
      phone: "+420 123 456 789",
    },
    total: 1898,
    status: "delivered",
    items: [
      { product: "Bavlněné tričko Basic", quantity: 2, price: 599 },
      { product: "Džínové kalhoty Slim", quantity: 1, price: 1299 },
    ],
    shippingAddress: {
      street: "Václavské náměstí 1",
      city: "Praha",
      postalCode: "110 00",
      country: "Česká republika",
    },
  },
  {
    id: "ORD-002",
    date: "2024-01-14",
    customer: {
      name: "Marie Svobodová",
      email: "marie.svobodova@email.cz",
      phone: "+420 987 654 321",
    },
    total: 2499,
    status: "shipped",
    items: [{ product: "Zimní bunda Parka", quantity: 1, price: 2499 }],
    shippingAddress: {
      street: "Náměstí Míru 5",
      city: "Brno",
      postalCode: "602 00",
      country: "Česká republika",
    },
  },
];

export const mockCustomers = [
  {
    id: "1",
    name: "Jan Novák",
    email: "jan.novak@email.cz",
    phone: "+420 123 456 789",
    orders: 5,
    totalSpent: 8450,
    registeredAt: "2023-06-15",
  },
  {
    id: "2",
    name: "Marie Svobodová",
    email: "marie.svobodova@email.cz",
    phone: "+420 987 654 321",
    orders: 3,
    totalSpent: 4200,
    registeredAt: "2023-08-22",
  },
  {
    id: "3",
    name: "Petr Dvořák",
    email: "petr.dvorak@email.cz",
    phone: "+420 555 123 456",
    orders: 8,
    totalSpent: 12300,
    registeredAt: "2023-03-10",
  },
];

export const mockMetrics = {
  totalRevenue: 125000,
  todayOrders: 12,
  monthlyOrders: 245,
  totalProducts: 156,
  lowStock: 8,
};

export const mockSalesData = [
  { date: "2024-01-01", sales: 2400 },
  { date: "2024-01-02", sales: 1800 },
  { date: "2024-01-03", sales: 3200 },
  { date: "2024-01-04", sales: 2800 },
  { date: "2024-01-05", sales: 4100 },
  { date: "2024-01-06", sales: 3600 },
  { date: "2024-01-07", sales: 2900 },
];

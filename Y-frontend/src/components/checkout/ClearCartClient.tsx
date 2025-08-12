"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function ClearCartClient() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Vyčistit košík při načtení success stránky – jen jednou
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // Tato komponenta nevykresluje nic
}
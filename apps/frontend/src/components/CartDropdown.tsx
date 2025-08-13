"use client";

import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";

export function CartDropdown() {
  const {
    items,
    totalItems,
    totalPrice,
    removeItem,
    updateQuantity,
    isDropdownOpen,
    setIsDropdownOpen,
  } = useCart();
  const [open, setOpen] = React.useState(false);

  // React na změnu isDropdownOpen z kontextu
  React.useEffect(() => {
    if (isDropdownOpen) {
      setOpen(true);
      // Zavřít dropdown po 3 sekundách
      const timer = setTimeout(() => {
        setOpen(false);
        setIsDropdownOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isDropdownOpen, setIsDropdownOpen]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button type="button" className="relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-10 w-10">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-zinc-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Váš košík</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">Váš košík je prázdný</div>
        ) : (
          <>
            <div className="max-h-80 overflow-y-auto">
              {items.map((item, index) => (
                <div
                  key={`${item.id}-${item.size || "no-size"}-${index}`}
                  className="p-3 flex gap-3"
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    {item.size && (
                      <p className="text-xs text-muted-foreground">Velikost: {item.size}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.quantity === 1) {
                            removeItem(item.id);
                          } else {
                            updateQuantity(item.id, item.quantity - 1);
                          }
                        }}
                        className="text-xs px-2 py-1 border rounded hover:bg-muted"
                      >
                        -
                      </button>
                      <span className="text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-xs px-2 py-1 border rounded hover:bg-muted"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-destructive ml-auto"
                      >
                        Odebrat
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <DropdownMenuSeparator />
            <div className="p-3">
              <div className="flex justify-between font-medium mb-3">
                <span>Celkem:</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <Link href="/cart" onClick={() => setOpen(false)}>
                <button type="button" className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Zobrazit košík
                </button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

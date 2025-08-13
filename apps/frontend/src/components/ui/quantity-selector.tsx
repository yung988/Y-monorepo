"use client";

import { Button } from "@/components/ui/button";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  maxQuantity?: number;
}

export const QuantitySelector = ({
  quantity,
  onQuantityChange,
  maxQuantity = 10, // Default max quantity
}: QuantitySelectorProps) => {
  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="quantity" className="text-sm font-medium text-gray-700 sr-only">
        Počet kusů
      </label>
      <div className="flex items-center border border-gray-200 rounded-md">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDecrement}
          disabled={quantity <= 1}
          className="h-9 w-9 rounded-r-none text-lg font-light"
        >
          -
        </Button>
        <span className="w-10 text-center text-sm font-medium tabular-nums">{quantity}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleIncrement}
          disabled={quantity >= maxQuantity}
          className="h-9 w-9 rounded-l-none text-lg font-light"
        >
          +
        </Button>
      </div>
    </div>
  );
};

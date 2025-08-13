"use client";


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
        <button
          type="button"
          onClick={handleDecrement}
          disabled={quantity <= 1}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 rounded-r-none text-lg font-light"
        >
          -
        </button>
        <span className="w-10 text-center text-sm font-medium tabular-nums">{quantity}</span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={quantity >= maxQuantity}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 rounded-l-none text-lg font-light"
        >
          +
        </button>
      </div>
    </div>
  );
};

// components/ProductGrid.tsx
import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-1 sm:gap-2 md:gap-2 lg:gap-2">
      {products.map((product) => (
        <div key={product.id} className="group flex flex-col">
          <Link href={product.slug ? `/product/${product.slug}` : "/"} className="block">
            <div className="mb-1 sm:mb-2 md:mb-3 aspect-square bg-white relative overflow-hidden">
              <Image
                src={
                  product.product_images?.find((img) => img.is_main_image)?.url ||
                  product.product_images?.[0]?.url ||
                  "/placeholder.jpg"
                }
                alt={product.name}
                width={400}
                height={400}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                priority={false}
                loading="lazy"
              />
            </div>
            <div className="flex flex-col px-0.5 sm:px-1">
              <h3 className="text-black font-medium leading-tight mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-base line-clamp-2">
                {product.name}
              </h3>
              <div className="text-black font-medium text-xs sm:text-sm md:text-base">
                {(product.price / 100).toLocaleString("cs-CZ")} Kč
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

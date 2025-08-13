import { Container } from "@/components/Container";
import ProductGrid from "@/components/ProductGrid";
import { adminApi } from "@/lib/admin-api";
import type { Product } from "@/types/product";

async function getProducts(): Promise<Product[]> {
  const maxRetries = 3;
  let _lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const products = await adminApi.getProducts();
      return products as Product[];
    } catch (error) {
      _lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const delay = 2 ** (attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return [];
}

export default async function Home() {
  const products = await getProducts();

  // Backend already returns only active products with prices

  return (
    <Container>
      <div className="text-center mb-8 sm:mb-12 md:mb-16">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4">
          YEEZUZ2020
        </h1>
        <p className="text-zinc-600 mx-auto max-w-2xl text-sm sm:text-base md:text-lg">
          Oficiální e-shop YEEZUZ2020
        </p>
      </div>

      <ProductGrid products={products} />
    </Container>
  );
}

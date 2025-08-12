import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyButton } from "@/components/BuyButton";
import { ProductGallery } from "@/components/ProductGallery";
import { RelatedProducts } from "@/components/RelatedProducts";
import type { Product, ProductImage, ProductVariant } from "@/types/product";

// Interface for transformed product data used by components
interface TransformedProduct {
  id: string;
  name: string;
  description: string;
  images: {
    id: string;
    url: string;
    altText?: string;
  }[];
  price: string;
  priceAmount: number;
  priceId: string;
  isClothing: boolean;
  priceInCents: number;
  variants: {
    id: string;
    size: string;
    stockQuantity: number;
  }[];
}

// Funkce pro načtení produktu z API
async function getProduct(slug: string): Promise<TransformedProduct | null> {
  try {
    const { adminApi } = await import("@/lib/admin-api");
    const productWithDetails = await adminApi.getProductBySlug(slug);

    if (!productWithDetails) {
      return null;
    }

    if (!productWithDetails) {
      return null;
    }

    // Seřadíme obrázky podle sort_order
    const sortedImages =
      productWithDetails.product_images?.sort(
        (a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order,
      ) || [];

    // Zjistíme, zda má produkt varianty velikostí (oblečení)
    const isClothing =
      productWithDetails.product_variants && productWithDetails.product_variants.length > 0;

    const amount = productWithDetails.price / 100 || 0;
    const priceFormatted = amount
      ? `${amount.toLocaleString("cs-CZ")} Kč`
      : "Cena není k dispozici";

    return {
      id: productWithDetails.id,
      name: productWithDetails.name,
      description: productWithDetails.description ?? "",
      images: sortedImages.map((img: ProductImage) => ({
        id: img.id,
        url: img.url,
        altText: img.alt_text,
      })),
      price: priceFormatted,
      priceAmount: amount,
      priceId: productWithDetails.stripe_product_id ?? "",
      isClothing,
      priceInCents: productWithDetails.price, // cena je už v haléřích v databázi
      variants:
        productWithDetails.product_variants?.map((variant: ProductVariant) => ({
          id: variant.id,
          size: variant.size,
          stockQuantity: variant.stock_quantity,
        })) || [],
    };
  } catch (error) {
    console.error("Error loading product:", error);
    return null;
  }
}

// Funkce pro načtení všech produktů z API
async function getAllProducts() {
  try {
    const { adminApi } = await import("@/lib/admin-api");
    const allProducts = await adminApi.getProducts();

    return allProducts
      .filter((product: Product) => product?.status === "active" && !!product?.slug)
      .map((product: Product) => product.slug as string);
  } catch (error) {
    console.error("Error loading products:", error);
    return [];
  }
}

// Generování statických stránek při buildu
export async function generateStaticParams() {
  const productSlugs = await getAllProducts(); // This function now needs to return slugs

  return productSlugs.map((slug: string) => ({
    slug: slug,
  }));
}

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="relative">
      {/* Sticky navigation na levé straně */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10 hidden lg:block">
        <div className="bg-white shadow-lg rounded-full p-3 border">
          <Link
            href="/"
            className="flex items-center justify-center w-12 h-12 text-zinc-600 hover:text-black hover:bg-gray-50 rounded-full transition-all duration-200 group"
            title="Zpět do obchodu"
          >
            <svg
              className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Zpět"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 max-w-[1400px] py-12">
        {/* Mobile navigation - high fashion style */}
        <nav className="mb-16 lg:hidden text-center">
          <Link href="/" className="inline-block group">
            <div className="text-xs font-medium tracking-[0.2em] uppercase text-gray-600 group-hover:text-gray-900 transition-colors duration-300 mb-2">
              ← ZPĚT DO OBCHODU
            </div>
            <div className="w-16 h-px bg-gray-300 group-hover:bg-gray-900 transition-colors duration-300 mx-auto"></div>
          </Link>
        </nav>

        {/* Main content - High Fashion Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Levý sloupec - Image Gallery */}
          <div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Pravý sloupec - Product info (sticky) */}
          <div className="lg:sticky lg:top-30 lg:self-start">
            {/* Product header */}
            <div className="text-center lg:text-left space-y-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-light tracking-[0.1em] uppercase text-gray-900 mb-6">
                  {product.name}
                </h1>
                <div className="text-lg font-light tracking-wide text-gray-900 mb-8">
                  {product.price}
                </div>
              </div>

              {product.description && (
                <div className="border-t border-gray-200 pt-8">
                  <p className="text-sm leading-relaxed text-gray-700 font-light tracking-wide max-w-md mx-auto lg:mx-0">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Buy section */}
            <div className="border-t border-gray-200 mt-12 pt-12">
              <div className="space-y-8">
                <BuyButton
                  priceId={product.priceId}
                  isClothing={product.isClothing}
                  productName={product.name}
                  productId={product.id}
                  price={product.priceInCents}
                  image={product.images?.[0]?.url || "/placeholder.jpg"}
                  variants={product.variants}
                />

                <div className="text-center lg:text-left">
                  <div className="space-y-3 text-xs tracking-wide text-gray-600 font-light">
                    <p className="flex items-center justify-center lg:justify-start">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>
                      SKLADEM A ODESÍLÁME DO 3–5 PRACOVNÍCH DNŮ
                    </p>
                    <p className="flex items-center justify-center lg:justify-start">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>
                      OMEZENÉ MNOŽSTVÍ KUSŮ NA OSOBU
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <RelatedProducts currentProductId={product.id} limit={4} />
    </div>
  );
}

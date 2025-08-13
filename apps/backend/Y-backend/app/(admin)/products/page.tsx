import { AlertTriangle, Package, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AdminHeader } from "@/components/admin-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProductActionsMenu } from "@/components/ui/product-actions-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/format";
import { getProducts } from "@/lib/supabase-queries-adapted";

export default async function ProductsPage() {
  const products = await getProducts();

  // Vykalkuluji statistiky
  const totalProducts = products?.length || 0;
  const activeProducts = products?.filter((p) => p.status === "active").length || 0;
  const lowStockProducts =
    products?.filter((p) => {
      const totalStock =
        p.product_variants?.reduce(
          (sum: number, variant: { stock_quantity?: number }) =>
            sum + (variant.stock_quantity || 0),
          0,
        ) || 0;
      return totalStock < 10;
    }).length || 0;
  const variantsCount =
    products?.reduce((sum, p) => sum + (p.product_variants?.length || 0), 0) || 0;

  return (
    <>
      <AdminHeader
        title="Produkty"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Produkty" }]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Statistiky */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Celkem produktů</span>
              </div>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Badge className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Aktivní</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{activeProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Nízký sklad</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Variant</span>
              </div>
              <div className="text-2xl font-bold">{variantsCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 md:flex md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Hledat produkty..." className="pl-8" />
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny kategorie</SelectItem>
                  <SelectItem value="obleceni">Oblečení</SelectItem>
                  <SelectItem value="doplnky">Doplňky</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny</SelectItem>
                  <SelectItem value="active">Aktivní</SelectItem>
                  <SelectItem value="inactive">Neaktivní</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between md:justify-end">
            <Button asChild>
              <Link href="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Přidat produkt
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Seznam produktů ({totalProducts})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Obrázek</TableHead>
                  <TableHead>Název</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Cena</TableHead>
                  <TableHead>Varianty</TableHead>
                  <TableHead>Skladem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products && products.length > 0 ? (
                  products.map((product) => {
                    const totalStock =
                      product.product_variants?.reduce(
                        (sum: number, variant: { stock_quantity?: number }) =>
                          sum + (variant.stock_quantity || 0),
                        0,
                      ) || 0;
                    const mainImage =
                      product.product_images?.find(
                        (img: { sort_order?: number }) => img.sort_order === 0,
                      ) || product.product_images?.[0];
                    const variantsCount = product.product_variants?.length || 0;
                    return (
                      <TableRow
                        key={product.id}
                        className="hover:bg-muted/50"
                        style={{ cursor: "pointer" }}
                      >
                        <TableCell className="relative">
                          <Link href={`/products/${product.id}`} className="absolute inset-0" aria-label={`Otevřít produkt ${product.name}`}></Link>
                          <div className="relative">
                            <Image
                              src={mainImage?.url || "/placeholder.svg"}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="rounded-md object-cover border"
                            />
                            {product.product_images && product.product_images.length > 1 && (
                              <Badge
                                variant="secondary"
                                className="absolute -top-2 -right-2 text-xs px-1"
                              >
                                +{product.product_images.length - 1}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/products/${product.id}`} className="block">
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {product.description.substring(0, 50)}...
                                </div>
                              )}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/products/${product.id}`} className="block">
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {product.sku || "—"}
                            </code>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/products/${product.id}`} className="block">
                            {product.category ? (
                              <Badge variant="outline">{product.category}</Badge>
                            ) : (
                              "—"
                            )}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono">
                          <Link href={`/products/${product.id}`} className="block">
                            {formatPrice((product.price || 0) * 100)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/products/${product.id}`} className="block">
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{variantsCount}</span>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/products/${product.id}`} className="block">
                            <div className="flex items-center gap-1">
                              {totalStock < 10 && totalStock > 0 && (
                                <AlertTriangle className="h-3 w-3 text-orange-500" />
                              )}
                              {totalStock === 0 && (
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                              )}
                              <span
                                className={`text-sm ${
                                  totalStock === 0
                                    ? "text-red-600 font-semibold"
                                    : totalStock < 10
                                      ? "text-orange-600"
                                      : "text-green-600"
                                }`}
                              >
                                {totalStock} ks
                              </span>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/products/${product.id}`} className="block">
                            <Badge variant={product.status === "active" ? "default" : "secondary"}>
                              {product.status === "active" ? "Aktivní" : "Neaktivní"}
                            </Badge>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <ProductActionsMenu productId={product.id} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Žádné produkty nenalezeny</p>
                        <Button asChild variant="outline" size="sm">
                          <Link href="/products/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Přidat první produkt
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

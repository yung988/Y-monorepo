"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PencilIcon, TrashIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  stock: number
  status: "available" | "out_of_stock" | "discontinued"
  created_at: string
}

type ProductDetailProps = {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Opravdu chcete smazat tento produkt?")) {
      return
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      toast({
        title: "Úspěch",
        description: "Produkt byl úspěšně smazán.",
      })
      router.push("/products") // Redirect to products list after deletion
      router.refresh() // Refresh the products list
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se smazat produkt.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: Product["status"]) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500 hover:bg-green-500/80 text-white">Dostupné</Badge>
      case "out_of_stock":
        return <Badge variant="destructive">Vyprodáno</Badge>
      case "discontinued":
        return <Badge variant="outline">Ukončeno</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStockBadge = (stock: number) => {
    if (stock > 10) {
      return <Badge className="bg-green-500 hover:bg-green-500/80 text-white">Skladem ({stock})</Badge>
    } else if (stock > 0) {
      return <Badge variant="secondary">Nízký stav ({stock})</Badge>
    } else {
      return <Badge variant="destructive">Vyprodáno</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">{product.name}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <PencilIcon className="h-4 w-4" />
            <span className="sr-only">Upravit</span>
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <TrashIcon className="h-4 w-4" />
            <span className="sr-only">Smazat</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">ID produktu</p>
            <p className="text-lg">{product.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Kategorie</p>
            <p className="text-lg">{product.category}</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Popis</p>
          <p className="text-lg">{product.description || "Není k dispozici"}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Cena</p>
            <p className="text-lg">
              {new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(product.price)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Skladem</p>
            {getStockBadge(product.stock)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Stav</p>
            {getStatusBadge(product.status)}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Vytvořeno</p>
            <p className="text-lg">{new Date(product.created_at).toLocaleDateString("cs-CZ")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

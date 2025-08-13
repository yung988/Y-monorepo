"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export function ProductForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [stock, setStock] = useState("")
  const [isActive, setIsActive] = useState(true)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (!name || !price || !category || !stock) {
      toast({
        title: "Chyba",
        description: "Prosím vyplňte všechna povinná pole.",
        variant: "destructive",
      })
      return
    }

    const productData = {
      name,
      description,
      price: Number.parseFloat(price),
      category,
      stock: Number.parseInt(stock),
      isActive,
    }

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error("Failed to create product")
      }

      toast({
        title: "Úspěch",
        description: "Produkt byl úspěšně vytvořen.",
      })
      // Clear form
      setName("")
      setDescription("")
      setPrice("")
      setCategory("")
      setStock("")
      setIsActive(true)
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se vytvořit produkt.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 p-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Název produktu</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Popis</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">Cena (Kč)</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            step="0.01"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Kategorie</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Vyberte kategorii" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electronics">Elektronika</SelectItem>
              <SelectItem value="clothing">Oblečení</SelectItem>
              <SelectItem value="home">Domácnost</SelectItem>
              <SelectItem value="books">Knihy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="stock">Skladem</Label>
          <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
          <Label htmlFor="active">Aktivní</Label>
        </div>
      </div>
      <Button type="submit" className="w-full">
        Uložit produkt
      </Button>
    </form>
  )
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await context.params

  const { data: variants, error } = await supabase.from("product_variants").select("*").eq("product_id", id)

  if (error) {
    console.error("Error fetching product variants:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(variants)
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id: productId } = await context.params
  const variantData = await request.json()

  const { data, error } = await supabase
    .from("product_variants")
    .insert([{ ...variantData, product_id: productId }])
    .select()

  if (error) {
    console.error("Error creating product variant:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0], { status: 201 })
}

"use client"

import * as React from "react"
import { SearchForm } from "@/components/search-form"
import { NavMain } from "@/components/nav-main"
import { NavDocuments } from "@/components/nav-documents"
import { NavUser } from "@/components/nav-user"
import { NavSecondary } from "@/components/nav-secondary"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { createBrowserClient } from "@/lib/supabase"

const data = {
  user: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: "LayoutDashboard",
      isActive: true,
    },
    {
      title: "Objednávky",
      url: "/orders",
      icon: "ShoppingCart",
    },
    {
      title: "Produkty",
      url: "/products",
      icon: "Package",
    },
    {
      title: "Zákazníci",
      url: "/customers",
      icon: "Users",
    },
    {
      title: "Analytika",
      url: "/analytics",
      icon: "BarChart3",
    },
    {
      title: "Nastavení",
      url: "/settings",
      icon: "Settings",
    },
  ],
  navSecondary: [
    {
      title: "Podpora",
      url: "#",
      icon: "LifeBuoy",
    },
    {
      title: "Zpětná vazba",
      url: "#",
      icon: "Send",
    },
  ],
  documents: [
    {
      name: "Uživatelská příručka",
      url: "#",
      icon: "FileText",
    },
    {
      name: "API dokumentace",
      url: "#",
      icon: "Code",
    },
    {
      name: "Changelog",
      url: "#",
      icon: "History",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [stats, setStats] = React.useState({
    orders: 0,
    products: 0,
    customers: 0,
  })

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createBrowserClient()

        // Fetch orders count
        const { count: ordersCount } = await supabase.from("orders").select("*", { count: "exact", head: true })

        // Fetch products count
        const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true })

        // Fetch customers count
        const { count: customersCount } = await supabase.from("customers").select("*", { count: "exact", head: true })

        setStats({
          orders: ordersCount || 0,
          products: productsCount || 0,
          customers: customersCount || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments documents={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

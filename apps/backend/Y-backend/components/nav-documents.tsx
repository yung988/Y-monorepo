"use client"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import * as Icons from "lucide-react"

export function NavDocuments({
  documents,
}: {
  documents: {
    name: string
    url: string
    icon: string
  }[]
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Dokumentace</SidebarGroupLabel>
      <SidebarMenu>
        {documents.map((item) => {
          const IconComponent = (Icons as any)[item.icon]

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  {IconComponent && <IconComponent />}
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

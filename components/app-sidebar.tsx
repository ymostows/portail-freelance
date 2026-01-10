"use client"

import {
  LayoutDashboard,
  Settings,
  FileText,
  LogOut,
  User,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoutAlertDialog } from "@/components/auth/logout-alert-dialog"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

// Configuration du menu
const items = [
  {
    title: "Tableau de bord",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Projets",
    url: "/dashboard/projects",
    icon: FileText,
  },
  {
    title: "Paramètres",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* HEADER : Le Logo ou le nom de l'app */}
      <SidebarHeader className="py-4 px-4 border-b group-data-[collapsible=icon]:px-2">
            {/* On ajoute un petit carré de couleur ou on colore juste le texte */}
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight ">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                    {/* F pour Freelance (ou ton logo SVG plus tard) */}
                    F
                </div>
                <span className="group-data-[collapsible=icon]:hidden">Freelance SaaS</span>
            </div>
        </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    // 👇 AJOUT DE CETTE PROPRIÉTÉ TOOLTIP (Bonus UX)
                    tooltip={item.title}
                    // 👇 ON MODIFIE LE STYLE ICI
                    className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary font-medium transition-all duration-200"
                    >
                    <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER : Le profil utilisateur */}
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton variant="outline" className="w-full justify-start gap-2">
                    <User className="h-4 w-4" />
                    <span>Mon Profil</span>
                </SidebarMenuButton>
                <LogoutAlertDialog />
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
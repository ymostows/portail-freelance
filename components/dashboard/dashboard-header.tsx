"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DashboardHeader() {
  const pathname = usePathname()

  // Mapping des chemins vers les titres
  const getPageTitle = (path: string): string => {
    // Routes exactes
    if (path === "/dashboard") {
      return "Tableau de bord"
    }
    if (path === "/dashboard/projects") {
      return "Projets"
    }
    if (path === "/dashboard/settings") {
      return "Paramètres"
    }
    
    // Routes dynamiques
    if (path.startsWith("/dashboard/projects/") && path.includes("/roadmap")) {
      return "Roadmap"
    }
    if (path.startsWith("/dashboard/projects/")) {
      return "Projet"
    }
    
    // Par défaut
    return "Tableau de bord"
  }

  const pageTitle = getPageTitle(pathname)

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="font-medium leading-none">{pageTitle}</h1>
      </div>
    </header>
  )
}

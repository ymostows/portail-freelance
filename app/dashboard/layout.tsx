import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server" // ou ton chemin correct
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const cookieStore = await cookies()
  const sidebarCookie = cookieStore.get("sidebar:state")
  const defaultOpen = sidebarCookie ? sidebarCookie.value === "true" : true

  return (
    // On passe l'état par défaut (cookie) pour éviter le flash
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen" suppressHydrationWarning>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-auto min-h-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
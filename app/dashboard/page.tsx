import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Grille de statistiques simple */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Card className="bg-muted/50">
           <CardHeader>
             <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">0,00 €</div>
           </CardContent>
        </Card>
        
        <Card className="bg-muted/50">
           <CardHeader>
             <CardTitle className="text-sm font-medium">Projets actifs</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">+12</div>
           </CardContent>
        </Card>

        <Card className="bg-muted/50">
           <CardHeader>
             <CardTitle className="text-sm font-medium">Clients</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">4</div>
           </CardContent>
        </Card>
      </div>

      {/* Zone principale */}
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
        <h2 className="text-lg font-semibold mb-2">Bienvenue, {user.email}</h2>
        <p className="text-muted-foreground">
          Ceci est un test de layout. Si tu vois ce texte correctement décalé à droite de la barre latérale, c&apos;est gagné.
        </p>
      </div>
    </div>
  )
}
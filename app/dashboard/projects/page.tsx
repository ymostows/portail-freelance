import { CreateProjectDialog } from "@/components/dashboard/projects/create-project-dialog"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma" // ✅ On importe Prisma
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function ProjectsPage() {
  // 1. Auth Check (Toujours via Supabase Auth)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 2. Récupération via PRISMA
  // On récupère uniquement les projets où je suis le freelancer
  const projects = await prisma.project.findMany({
    where: {
      freelancerId: user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
            <p className="text-muted-foreground">Gérez et suivez vos missions freelances.</p>
        </div>
        <CreateProjectDialog />
      </div>

      {/* 4. Gestion de l'état vide */}
      {(!projects || projects.length === 0) ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-lg bg-muted/50">
           <div className="mb-4 rounded-full bg-primary/10 p-3">
             <Calendar className="h-6 w-6 text-primary" />
           </div>
           <h3 className="text-lg font-semibold">Aucun projet</h3>
           <p className="text-sm text-muted-foreground mb-4">
             Commencez par créer votre premier projet pour activer le suivi.
           </p>
        </div>
      ) : (
        /* 5. Affichage de la grille de projets */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="block transition-transform hover:-translate-y-1">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        {/* ⚠️ Attention: C'est 'name' maintenant, pas 'title' */}
                        <CardTitle className="text-base font-semibold truncate pr-2">
                            {project.name}
                        </CardTitle>
                        
                        {/* Gestion des couleurs de badge selon l'Enum */}
                        <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {project.status}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground line-clamp-2 h-10">
                            {project.description || "Aucune description"}
                        </div>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground pt-4 border-t bg-muted/20">
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                                Mis à jour {formatDistanceToNow(new Date(project.updatedAt), { 
                                    addSuffix: true, 
                                    locale: fr       
                                })}
                            </span>
                        </div>
                    </CardFooter>
                </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
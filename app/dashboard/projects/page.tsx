import { CreateProjectDialog } from "@/components/projects/create-project-dialog"
import { createClient } from "@/lib/supabase/server"
import { formatDistanceToNow } from "date-fns" // Optionnel: pour le "il y a 2 jours" (sinon utilise une date simple)
import { fr } from "date-fns/locale"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import Link from "next/link"

export default async function ProjectsPage() {
  // 1. Connexion à la base de données
  const supabase = await createClient()

  // 2. Récupération de l'utilisateur (pour la sécurité RLS)
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Récupération des projets
  // On trie par date de création décroissante (le plus récent en haut)
  const { data: projects } = await supabase
    .from("Project")
    .select("*")
    .order("createdAt", { ascending: false })

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
           {/* On pourrait remettre le bouton ici aussi */}
        </div>
      ) : (
        /* 5. Affichage de la grille de projets */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="block transition-transform hover:-translate-y-1">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold">
                            {project.title}
                        </CardTitle>
                        {/* Badge dynamique selon le status */}
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                            {project.status}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                            {project.description || "Aucune description"}
                        </div>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground pt-4 border-t bg-muted/20">
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                                Mis à jour {formatDistanceToNow(new Date(project.updatedAt), { 
                                    addSuffix: true, // Ajoute "il y a"
                                    locale: fr       // Met en français
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
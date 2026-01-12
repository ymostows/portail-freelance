import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface ProjectPageProps {
  params: Promise<{
    projectid: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  // 1. On récupère l'ID depuis l'URL (Next.js 15 demande un await sur params)
  const { projectid } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 2. On récupère le projet unique
  // RLS s'assure toujours qu'on ne voit que NOS projets
  const { data: project } = await supabase
    .from("Project")
    .select("*")
    .eq("id", projectid) // On filtre par l'ID de l'URL
    .single() // On dit à Supabase : "Je n'attends qu'un seul résultat, pas une liste"

  // 3. Gestion 404 : Si l'ID n'existe pas ou n'est pas à moi
  if (!project) {
    notFound() // Affiche la page 404 standard de Next.js
  }

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <div>
        <Link 
            href="/dashboard/projects" 
            className="text-muted-foreground hover:text-primary flex items-center gap-2 text-sm mb-4 transition-colors"
        >
            <ArrowLeft className="h-4 w-4" />
            Retour aux projets
        </Link>
        
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                {project.status}
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne Principale (Infos) */}
        <div className="md:col-span-2 space-y-6">
            <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                    {project.description || "Aucune description fournie."}
                </p>
            </div>
            
            {/* C'est ICI qu'on mettra plus tard la liste des documents ou tâches */}
            <div className="p-12 border border-dashed rounded-lg text-center text-muted-foreground">
                Zone future pour les documents / tâches
            </div>
        </div>

        {/* Colonne Latérale (Métadonnées) */}
        <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-muted/30 space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Détails</h3>
                
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Créé le {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>
                        Mis à jour {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: fr })}
                    </span>
                </div>
                
                <div className="pt-4 border-t">
                     <Button className="w-full" variant="outline">
                        Modifier le projet
                     </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
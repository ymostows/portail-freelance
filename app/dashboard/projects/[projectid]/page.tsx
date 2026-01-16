import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { InviteClientDialog } from "@/components/dashboard/projects/invite-client-dialog";

interface ProjectPageProps {
  params: Promise<{
    projectid: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  // 1. Next.js 15 : On doit await params
  const resolvedParams = await params;
  const projectid = resolvedParams.projectid;

  // 2. On récupère le projet via PRISMA (et non Supabase direct)
  // Cela nous permet d'avoir les types corrects et les relations
  const project = await prisma.project.findUnique({
    where: { 
      id: projectid 
    },
    include: {
      client: true // On récupère les infos du client s'il existe
    }
  });

  // 3. Gestion 404
  if (!project) {
    notFound();
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
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            {/* Attention : ton champ s'appelle 'name' dans le nouveau schema Prisma, plus 'title' */}
            
            <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
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
            
            {/* Zone Client (Nouveau) */}
            <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                <h3 className="font-semibold mb-2">Client assigné</h3>
                {project.client ? (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            {project.client.name?.[0] || "C"}
                        </div>
                        <div>
                            <p className="font-medium">{project.client.name || "Client"}</p>
                            <p className="text-sm text-muted-foreground">{project.client.email}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Aucun client n&apos;a encore rejoint ce projet.</p>
                )}
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
                
                <div className="pt-4 border-t space-y-2">
                     {/* CORRECTION ICI : On passe l'ID du projet récupéré, pas params.id */}
                     <InviteClientDialog projectId={project.id} />
                     
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
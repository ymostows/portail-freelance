import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, Clock, Map, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { InviteClientDialog } from "@/components/dashboard/projects/invite-client-dialog";
import { BackButton } from "@/components/navigation/back-button";

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
      client: true, // On récupère les infos du client s'il existe
      _count: {
        select: { milestones: true }
      }
    }
  });

  // 3. Gestion 404
  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header avec lien retour */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
        <BackButton text="Retour aux projets" />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden w-full">
        <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne Principale (Infos) */}
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold tracking-tight">{project.name}</CardTitle>
                    <CardDescription className="font-semibold text-base">Description</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                        {project.description || "Aucune description fournie."}
                    </p>
                </CardContent>
            </Card>

            {/* Section Roadmap */}
            <Card>
                <CardHeader>
                    <CardTitle>Roadmap</CardTitle>
                    <CardDescription>
                        Gérez les jalons et la timeline de votre projet.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href={`/dashboard/projects/${project.id}/roadmap`}>
                        <Button className="w-full" variant={project._count.milestones > 0 ? "default" : "outline"}>
                            {project._count.milestones > 0 ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    {project._count.milestones} jalon{project._count.milestones > 1 ? "s" : ""} - Voir la roadmap
                                </>
                            ) : (
                                <>
                                    <Map className="mr-2 h-4 w-4" />
                                    Créer la roadmap
                                </>
                            )}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
            
            {/* Zone Client (Nouveau) */}
            <Card>
                <CardHeader>
                    <CardTitle>Client assigné</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
        </div>

        {/* Colonne Latérale (Métadonnées) */}
        <div className="space-y-6">
            <Card className="bg-muted/30">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Détails</CardTitle>
                        <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                            {project.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
                <CardFooter className="flex-col space-y-2 pt-4 border-t">
                     {/* CORRECTION ICI : On passe l'ID du projet récupéré, pas params.id */}
                     <InviteClientDialog projectId={project.id} />
                     
                     <Button className="w-full" variant="outline">
                        Modifier le projet
                     </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
        </div>
      </div>
    </div>
  )
}
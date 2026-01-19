import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { RoadmapSection } from "@/components/roadmap/roadmap-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface RoadmapPageProps {
  params: Promise<{
    projectid: string;
  }>;
}

export default async function RoadmapPage({ params }: RoadmapPageProps) {
  const resolvedParams = await params;
  const projectid = resolvedParams.projectid;

  // Vérification de l'authentification
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Récupération du projet
  const project = await prisma.project.findUnique({
    where: {
      id: projectid,
    },
    include: {
      client: true,
      milestones: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Vérification que l'utilisateur est le freelancer du projet
  if (project.freelancerId !== user.id) {
    redirect("/dashboard/projects");
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      {/* Header élégant */}
      <div className="border-b border-border bg-muted/30">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/dashboard/projects" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span>Retour</span>
            </Link>
            <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {project.status === 'ACTIVE' ? 'Actif' : 'Brouillon'}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-sm text-muted-foreground">Gérez les jalons et la timeline de votre projet</p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden w-full">
        <div className="h-full overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Colonne principale - Roadmap */}
              <div className="lg:col-span-2">
                <RoadmapSection
                  projectId={project.id}
                  projectStatus={project.status}
                  initialMilestones={project.milestones.map((m) => ({
                    id: m.id,
                    title: m.title,
                    description: m.description,
                    estimatedDuration: m.estimatedDuration,
                    order: m.order,
                    status: m.status,
                  }))}
                />
              </div>

              {/* Colonne latérale - Détails du projet */}
              <div className="space-y-4">
                {/* Statistiques */}
                <Card className="bg-muted/40 border-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Statistiques</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Jalons</p>
                        <p className="text-lg font-semibold">{project.milestones.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Infos du projet */}
                <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">À propos du projet</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                      <p className="text-foreground line-clamp-3">{project.description || "Aucune description"}</p>
                    </div>
                    
                    <div className="pt-2 border-t border-primary/20">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Créé le</p>
                      <p className="text-foreground">{new Date(project.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Dernière modification</p>
                      <p className="text-foreground text-xs">
                        {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Client assigné */}
                {project.client && (
                  <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Client assigné</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                          {project.client.name?.[0]?.toUpperCase() || "C"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{project.client.name || "Client"}</p>
                          <p className="text-xs text-muted-foreground truncate">{project.client.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

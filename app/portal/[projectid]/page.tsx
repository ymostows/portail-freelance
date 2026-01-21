import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Circle, Clock, Loader2, Info } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ClientProjectProgress } from "@/components/roadmap/client-project-progress";

interface ClientProjectPageProps {
  params: Promise<{ projectid: string }>;
}

export default async function ClientProjectPage({ params }: ClientProjectPageProps) {
  const { projectid } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Sécurité : On vérifie que c'est bien SON projet
  const project = await prisma.project.findUnique({
    where: { 
      id: projectid,
      clientId: user?.id 
    },
    include: {
      freelancer: true,
      milestones: {
        orderBy: { createdAt: 'asc' } // Ou 'dueDate' selon ta logique
      }
    }
  });

  if (!project) notFound();

  // Calculer les statistiques
  const completedMilestones = project.milestones.filter(m => m.status === "COMPLETED").length;
  const inProgressMilestones = project.milestones.filter(m => m.status === "IN_PROGRESS").length;
  const currentMilestone = project.milestones.find(m => m.status === "IN_PROGRESS" || m.status === "PENDING");

  return (
    <div className="space-y-8">
      {/* Header du Projet */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{project.name}</CardTitle>
              <CardDescription className="mt-1">
                Freelance : <span className="font-medium text-foreground">{project.freelancer.name || project.freelancer.email}</span>
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">{project.status}</Badge>
          </div>
          
          {project.dueDate && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-full text-sm font-medium">
              <Clock className="h-4 w-4" />
              Livraison estimée : {format(new Date(project.dueDate), "d MMMM yyyy", { locale: fr })}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Progress Card - Show when ACTIVE */}
      {project.status === "ACTIVE" && (
        <ClientProjectProgress
          projectName={project.name}
          totalMilestones={project.milestones.length}
          completedMilestones={completedMilestones}
          inProgressMilestones={inProgressMilestones}
          currentMilestone={currentMilestone ? {
            id: currentMilestone.id,
            title: currentMilestone.title,
            order: currentMilestone.order,
            status: currentMilestone.status,
          } : null}
        />
      )}

      {/* LA TIMELINE VERTICALE */}
      <Card>
        <CardHeader>
          <CardTitle>Avancement du projet</CardTitle>
        </CardHeader>
        <CardContent>
          {project.milestones.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Le planning n&apos;a pas encore été défini par le freelance.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4 space-y-12">
              {project.milestones.map((milestone) => (
                <div key={milestone.id} className="relative pl-8">
                  {/* L'icône sur la ligne */}
                  <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 bg-white dark:bg-slate-950
                    ${milestone.status === 'COMPLETED' ? 'border-green-500 bg-green-500' : 
                      milestone.status === 'IN_PROGRESS' ? 'border-blue-500 animate-pulse' : 'border-gray-300 dark:border-gray-600'}`} 
                  />
                  
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h3 className={`font-semibold text-lg ${milestone.status === 'COMPLETED' ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {milestone.title}
                      </h3>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                      )}
                    </div>
                    
                    {/* Badges de statut */}
                    <div>
                      {milestone.status === 'COMPLETED' && (
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Terminé
                        </Badge>
                      )}
                      {milestone.status === 'IN_PROGRESS' && (
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> En cours
                        </Badge>
                      )}
                      {milestone.status === 'PENDING' && (
                        <Badge variant="outline" className="text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 gap-1">
                          <Circle className="h-3 w-3" /> À venir
                        </Badge>
                      )}
                      {milestone.status === 'AWAITING_APPROVAL' && (
                        <Badge className="bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700">
                          Action requise : Validation
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
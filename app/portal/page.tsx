import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Briefcase, CheckCircle2, FolderOpen, Activity } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Mapping des statuts pour l'affichage
const statusConfig = {
  DRAFT: { label: "Brouillon", variant: "secondary" as const, color: "bg-gray-100 text-gray-700" },
  ACTIVE: { label: "En cours", variant: "default" as const, color: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Terminé", variant: "outline" as const, color: "bg-green-100 text-green-700" },
  ON_HOLD: { label: "En pause", variant: "secondary" as const, color: "bg-orange-100 text-orange-700" },
} as const;

export default async function ClientPortalHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userName = user.user_metadata.full_name || "Client";

  // Récupérer les projets du client
  const projects = await prisma.project.findMany({
    where: { clientId: user.id },
    include: {
      freelancer: true,
      milestones: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  // Statistiques
  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "ACTIVE").length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-8">
      {/* Header de bienvenue */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Bonjour, {userName.split(" ")[0]} !
        </h1>
        <p className="text-muted-foreground">
          Suivez l&apos;avancement de vos projets en temps réel.
        </p>
      </div>

      {/* Cartes de statistiques */}
      {projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total projets
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                En cours
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Terminés
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Separator />

      {/* Liste des projets */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Mes Projets</h2>

        {projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg mb-2">Aucun projet pour le moment</CardTitle>
              <CardDescription className="text-center max-w-sm">
                Vous n&apos;avez pas encore de projet. Un freelance vous enverra une invitation pour rejoindre un projet.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => {
              const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.DRAFT;
              const freelancerInitial = project.freelancer.name?.[0]?.toUpperCase() || "F";
              const completedMilestones = project.milestones.filter((m) => m.status === "COMPLETED").length;
              const totalMilestones = project.milestones.length;
              const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

              return (
                <Link key={project.id} href={`/portal/${project.id}`} className="group">
                  <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
                          {project.name}
                        </CardTitle>
                        <Badge className={status.color} variant={status.variant}>
                          {status.label}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {project.description || "Pas de description."}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Barre de progression */}
                      {totalMilestones > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {completedMilestones} / {totalMilestones} étapes complétées
                          </p>
                        </div>
                      )}

                      <Separator />

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                              {freelancerInitial}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {project.freelancer.name || "Freelance"}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transform transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
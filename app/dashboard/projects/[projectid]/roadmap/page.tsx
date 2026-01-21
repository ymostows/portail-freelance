import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { RoadmapSection } from "@/components/roadmap/roadmap-section";
import { BackButton } from "@/components/navigation/back-button";

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
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header avec lien retour */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
        <BackButton text="Retour aux détails du projet" />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden w-full">
        <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
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
      </div>
    </div>
  );
}

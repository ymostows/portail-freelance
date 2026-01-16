import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

  return (
    <div className="space-y-8">
      {/* Header du Projet */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <p className="text-muted-foreground mt-1">
                    Freelance : <span className="font-medium text-black">{project.freelancer.name || project.freelancer.email}</span>
                </p>
            </div>
            <Badge className="text-sm px-3 py-1">{project.status}</Badge>
        </div>
        
        {project.dueDate && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <Clock className="h-4 w-4" />
                Livraison estimée : {format(new Date(project.dueDate), "d MMMM yyyy", { locale: fr })}
            </div>
        )}
      </div>

      {/* LA TIMELINE VERTICALE */}
      <div className="bg-white p-8 rounded-xl border shadow-sm">
        <h2 className="text-xl font-bold mb-6">Avancement du projet</h2>
        
        {project.milestones.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
                Le planning n&apos;a pas encore été défini par le freelance.
            </p>
        ) : (
            <div className="relative border-l-2 border-gray-200 ml-4 space-y-12">
                {project.milestones.map((milestone) => (
                    <div key={milestone.id} className="relative pl-8">
                        {/* L'icône sur la ligne */}
                        <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 bg-white 
                            ${milestone.status === 'COMPLETED' ? 'border-green-500 bg-green-500' : 
                              milestone.status === 'IN_PROGRESS' ? 'border-blue-500 animate-pulse' : 'border-gray-300'}`} 
                        />
                        
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                                <h3 className={`font-semibold text-lg ${milestone.status === 'COMPLETED' ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {milestone.title}
                                </h3>
                                {milestone.description && (
                                    <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                                )}
                            </div>
                            
                            {/* Badges de statut */}
                            <div>
                                {milestone.status === 'COMPLETED' && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Terminé
                                    </Badge>
                                )}
                                {milestone.status === 'IN_PROGRESS' && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                                        <Loader2 className="h-3 w-3 animate-spin" /> En cours
                                    </Badge>
                                )}
                                {milestone.status === 'PENDING' && (
                                    <Badge variant="outline" className="text-gray-400 border-gray-200 gap-1">
                                        <Circle className="h-3 w-3" /> À venir
                                    </Badge>
                                )}
                                {milestone.status === 'AWAITING_APPROVAL' && (
                                    <Badge className="bg-orange-500 hover:bg-orange-600">
                                        Action requise : Validation
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
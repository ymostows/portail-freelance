// EXEMPLE D'UTILISATION - Système de Gestion de Projet

// ============================================
// 1. CÔTÉ FREELANCER - Dashboard
// ============================================

// Route: /dashboard/projects/[projectid]/roadmap
// Fichier: app/dashboard/projects/[projectid]/roadmap/page.tsx

import { RoadmapSection } from "@/components/roadmap/roadmap-section";

export default async function RoadmapPage({ params }: RoadmapPageProps) {
  const project = await prisma.project.findUnique({
    where: { id: projectid },
    include: {
      milestones: { orderBy: { order: "asc" } },
    },
  });

  return (
    <RoadmapSection
      projectId={project.id}
      projectStatus={project.status} // "DRAFT" ou "ACTIVE"
      initialMilestones={project.milestones}
    />
  );
}

// RoadmapSection automatiquement:
// 1. Affiche le RoadmapGenerator si pas de jalons
// 2. Affiche le RoadmapTimeline avec:
//    - Si DRAFT: bouton "Valider et Activer"
//    - Si ACTIVE: ProjectProgress + MilestoneControls

// ============================================
// 2. AFFICHAGE DE L'AVANCEMENT (Freelancer)
// ============================================

// Composant: ProjectProgress
// Propriétés:

<ProjectProgress
  projectStatus="ACTIVE"
  totalMilestones={5}
  completedMilestones={2}
  currentMilestone={{ id: "m3", title: "Design UI", order: 2 }}
  inProgressCount={1}
  onStartMilestone={handleStartMilestone}
  isLoading={false}
/>

// Affiche:
// ┌─────────────────────────────────┐
// │ ● Projet en cours               │ (● pulse)
// │ 2/5 étapes complétées           │
// ├─────────────────────────────────┤
// │ Progression: 40% [████░░░░]    │
// │                                 │
// │ │ 2 │ Complétées │ 1 │ En cours │
// │                                 │
// │ Étape 3: Design UI              │
// │ [Démarrer cette étape]          │
// └─────────────────────────────────┘

// ============================================
// 3. CONTRÔLES D'ÉTAPE (Freelancer)
// ============================================

// Composant: MilestoneControls
// Chaque jalon affiche un bouton selon son statut:

// État PENDING (avant démarrage):
<Button onClick={handleStart} size="sm" variant="outline">
  <Play className="h-3 w-3" /> Démarrer
</Button>

// État IN_PROGRESS (en cours):
<Button onClick={handleSubmit} size="sm" variant="default" className="animate-pulse">
  <Send className="h-3 w-3" /> Soumettre
</Button>

// État AWAITING_APPROVAL (en attente):
<Button onClick={handleComplete} size="sm" className="bg-green-600 hover:bg-green-700">
  <CheckCircle2 className="h-3 w-3" /> Valider
</Button>

// État COMPLETED (complété):
<div className="text-xs text-green-600">
  <CheckCircle2 className="h-3 w-3" /> Complétée
</div>

// ============================================
// 4. FLUX DE MISE À JOUR D'ÉTAPE
// ============================================

// ACTION: startMilestone
// Fonction: app/actions/milestone.ts
await startMilestone(milestoneId);
// Résultat: PENDING → IN_PROGRESS

// ACTION: submitMilestoneForApproval
await submitMilestoneForApproval(milestoneId);
// Résultat: IN_PROGRESS → AWAITING_APPROVAL

// ACTION: completeMilestone
await completeMilestone(milestoneId);
// Résultat: AWAITING_APPROVAL → COMPLETED

// ============================================
// 5. STATISTIQUES DU PROJET (Freelancer)
// ============================================

// ACTION: getProjectStats
const stats = await getProjectStats(projectId);

// stats.data:
{
  total: 5,
  completed: 2,
  inProgress: 1,
  pendingCount: 2,
  awaitingApprovalCount: 0,
  currentMilestone: {
    id: "m3",
    title: "Design UI",
    order: 2,
    status: "IN_PROGRESS"
  },
  progress: 40
}

// ============================================
// 6. CÔTÉ CLIENT - Portail
// ============================================

// Route: /portal/[projectid]
// Fichier: app/portal/[projectid]/page.tsx

import { ClientProjectProgress } from "@/components/roadmap/client-project-progress";

export default async function ClientProjectPage() {
  const project = await prisma.project.findUnique({
    where: { id: projectid, clientId: user?.id },
    include: { milestones: true },
  });

  if (project.status === "ACTIVE") {
    return (
      <ClientProjectProgress
        projectName={project.name}
        totalMilestones={project.milestones.length}
        completedMilestones={project.milestones.filter(m => m.status === "COMPLETED").length}
        inProgressMilestones={project.milestones.filter(m => m.status === "IN_PROGRESS").length}
        currentMilestone={project.milestones.find(m => 
          m.status === "IN_PROGRESS" || m.status === "PENDING"
        )}
      />
    );
  }
}

// ============================================
// 7. AFFICHAGE CÔTÉ CLIENT
// ============================================

// Composant: ClientProjectProgress
// Affiche:

<ClientProjectProgress
  projectName="Mon super site web"
  totalMilestones={5}
  completedMilestones={2}
  inProgressMilestones={1}
  currentMilestone={{
    id: "m3",
    title: "Design UI",
    order: 2,
    status: "IN_PROGRESS"
  }}
/>

// Rendu:
// ┌──────────────────────────────────────┐
// │ Mon super site web                   │
// │ Projet en cours                      │
// ├──────────────────────────────────────┤
// │ Progression: 40%                     │
// │ [████░░░░░░░░░░░░░░░░░░░░░░]        │
// │                                      │
// │ ┌─ 2 ─┐ ┌─ 1 ─┐ ┌─ 2 ─┐           │
// │ │Com-│ │ En  │ │À faire│           │
// │ │plé │ │cours│ │      │           │
// │ │tées│ │     │ │      │           │
// │ └────┘ └─────┘ └──────┘           │
// │                                      │
// │ 🔶 Étape 3: Design UI                │
// │  (pulsing orange circle)             │
// │                                      │
// │ Étapes du projet:                    │
// │ [✓] Étape 1                          │
// │ [✓] Étape 2                          │
// │ [●] Étape 3 (pulsing)                │
// │ [3] Étape 4                          │
// │ [5] Étape 5                          │
// └──────────────────────────────────────┘

// ============================================
// 8. ANIMATIONS
// ============================================

// Barre de progression:
<div style={{ width: `${progress}%` }}
  className="transition-all duration-700 ease-in-out"
/>

// Point indicateur (IN_PROGRESS):
<div className="animate-pulse bg-orange-500" />

// Étape complétée (slide-in):
<div className="animate-in fade-in slide-in-from-bottom-4" />

// Bouton soumettre (pulse):
<Button className="animate-pulse">Soumettre</Button>

// ============================================
// 9. ORDRE DE STATUTS
// ============================================

// Flux complet d'une étape:

1. PENDING (par défaut)
   └─ User clique "Démarrer"
        ↓
2. IN_PROGRESS (en cours)
   └─ User clique "Soumettre"
        ↓
3. AWAITING_APPROVAL (en attente de validation)
   └─ User clique "Valider"
        ↓
4. COMPLETED (terminée)
   └─ Affiche badge "Complétée"

// ============================================
// 10. VALIDATION & SÉCURITÉ
// ============================================

// Chaque action valide:
✓ User authentifié
✓ User est le freelancer du projet
✓ Statut valide (enum MilestoneStatus)
✓ Milestone existe
✓ Revalidation des routes après update

// ============================================
// 11. FLUX COMPLET D'EXEMPLE
// ============================================

// Jour 1 - Freelancer crée le projet:
const project = await prisma.project.create({
  data: {
    name: "Site web",
    status: "DRAFT", // ← Brouillon
    freelancerId: user.id
  }
});

// Jour 1 - Ajoute 3 jalons:
// 1. Maquettes (PENDING)
// 2. Design UI (PENDING)
// 3. Développement (PENDING)

// Jour 1 - Valide et active:
await validateRoadmap(projectId);
// project.status → "ACTIVE"

// Client voit une barre vide (0%)

// Jour 2 - Freelancer démarre jalon 1:
await startMilestone(m1.id);
// m1.status → "IN_PROGRESS"
// Client voit: 0% progress, 1 en cours

// Jour 3 - Freelancer termine jalon 1:
await submitMilestoneForApproval(m1.id);
// m1.status → "AWAITING_APPROVAL"

// Jour 3 - Freelancer valide:
await completeMilestone(m1.id);
// m1.status → "COMPLETED"
// Client voit: 33% progress, 1 complétée

// Jour 3 - Freelancer démarre jalon 2:
await startMilestone(m2.id);
// m2.status → "IN_PROGRESS"
// Client voit: 33% progress, 1 complétée, 1 en cours

// ... et ainsi de suite jusqu'à 100%

// ============================================
// FIN EXEMPLE
// ============================================

"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- SCHEMAS ---

const MilestoneSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  estimatedDuration: z.string().optional().nullable(),
  order: z.number().int().min(0),
});

const SaveMilestonesSchema = z.object({
  projectId: z.string().uuid(),
  milestones: z.array(MilestoneSchema),
});

const UpdateMilestoneSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  estimatedDuration: z.string().optional().nullable(),
});

const ReorderSchema = z.object({
  projectId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()),
});

export type ActionResult = {
  success?: boolean;
  error?: string;
  data?: unknown;
};

// --- HELPERS ---

async function verifyProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      freelancerId: userId,
    },
  });
  return project;
}

// --- ACTIONS ---

/**
 * Sauvegarder les milestones générés par l'IA (création en masse)
 */
export async function saveMilestones(
  projectId: string,
  milestones: Array<{
    title: string;
    description?: string;
    estimatedDuration?: string | null;
    order: number;
  }>
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non authentifié" };

  const validated = SaveMilestonesSchema.safeParse({ projectId, milestones });
  if (!validated.success) {
    return { error: "Données invalides" };
  }

  try {
    // Vérifier que le projet appartient au freelancer
    const project = await verifyProjectOwnership(projectId, user.id);
    if (!project) {
      return { error: "Projet introuvable ou accès refusé" };
    }

    // Supprimer les anciens milestones (pour une génération fraîche)
    await prisma.milestone.deleteMany({
      where: { projectId },
    });

    // Créer les nouveaux milestones
    await prisma.milestone.createMany({
      data: milestones.map((m) => ({
        title: m.title,
        description: m.description || null,
        estimatedDuration: m.estimatedDuration || null,
        order: m.order,
        projectId,
      })),
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur saveMilestones:", error);
    return { error: "Erreur lors de la sauvegarde des jalons" };
  }
}

/**
 * Réordonner les milestones après drag & drop
 */
export async function reorderMilestones(
  projectId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non authentifié" };

  const validated = ReorderSchema.safeParse({ projectId, orderedIds });
  if (!validated.success) {
    return { error: "Données invalides" };
  }

  try {
    const project = await verifyProjectOwnership(projectId, user.id);
    if (!project) {
      return { error: "Projet introuvable ou accès refusé" };
    }

    // Mettre à jour l'ordre de chaque milestone
    const updates = orderedIds.map((id, index) =>
      prisma.milestone.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur reorderMilestones:", error);
    return { error: "Erreur lors du réordonnancement" };
  }
}

/**
 * Mettre à jour un milestone (édition inline)
 */
export async function updateMilestone(
  id: string,
  data: {
    title?: string;
    description?: string;
    estimatedDuration?: string | null;
  }
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non authentifié" };

  const validated = UpdateMilestoneSchema.safeParse({ id, ...data });
  if (!validated.success) {
    return { error: "Données invalides" };
  }

  try {
    // Vérifier l'accès via le projet parent
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!milestone || milestone.project.freelancerId !== user.id) {
      return { error: "Jalon introuvable ou accès refusé" };
    }

    await prisma.milestone.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        estimatedDuration: data.estimatedDuration,
      },
    });

    revalidatePath(`/dashboard/projects/${milestone.projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur updateMilestone:", error);
    return { error: "Erreur lors de la mise à jour" };
  }
}

/**
 * Supprimer un milestone
 */
export async function deleteMilestone(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non authentifié" };

  try {
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!milestone || milestone.project.freelancerId !== user.id) {
      return { error: "Jalon introuvable ou accès refusé" };
    }

    const projectId = milestone.projectId;

    await prisma.milestone.delete({
      where: { id },
    });

    // Réordonner les milestones restants
    const remaining = await prisma.milestone.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
    });

    const reorderUpdates = remaining.map((m, index) =>
      prisma.milestone.update({
        where: { id: m.id },
        data: { order: index },
      })
    );

    await prisma.$transaction(reorderUpdates);

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur deleteMilestone:", error);
    return { error: "Erreur lors de la suppression" };
  }
}

/**
 * Ajouter un milestone manuellement
 */
export async function addMilestone(
  projectId: string,
  afterOrder?: number
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non authentifié" };

  try {
    const project = await verifyProjectOwnership(projectId, user.id);
    if (!project) {
      return { error: "Projet introuvable ou accès refusé" };
    }

    // Trouver l'ordre max actuel
    const lastMilestone = await prisma.milestone.findFirst({
      where: { projectId },
      orderBy: { order: "desc" },
    });

    const newOrder = afterOrder !== undefined 
      ? afterOrder + 1 
      : (lastMilestone?.order ?? -1) + 1;

    // Si on insère au milieu, décaler les suivants
    if (afterOrder !== undefined) {
      await prisma.milestone.updateMany({
        where: {
          projectId,
          order: { gt: afterOrder },
        },
        data: {
          order: { increment: 1 },
        },
      });
    }

    const newMilestone = await prisma.milestone.create({
      data: {
        title: "Nouveau jalon",
        description: "",
        order: newOrder,
        projectId,
      },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true, data: newMilestone };
  } catch (error) {
    console.error("Erreur addMilestone:", error);
    return { error: "Erreur lors de l'ajout" };
  }
}

/**
 * Valider la roadmap et activer le projet
 */
export async function validateRoadmap(projectId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non authentifié" };

  try {
    const project = await verifyProjectOwnership(projectId, user.id);
    if (!project) {
      return { error: "Projet introuvable ou accès refusé" };
    }

    // Vérifier qu'il y a au moins un milestone
    const milestoneCount = await prisma.milestone.count({
      where: { projectId },
    });

    if (milestoneCount === 0) {
      return { error: "Ajoutez au moins un jalon avant de valider" };
    }

    // Passer le projet en ACTIVE
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "ACTIVE" },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath(`/dashboard/projects`);
    return { success: true };
  } catch (error) {
    console.error("Erreur validateRoadmap:", error);
    return { error: "Erreur lors de la validation" };
  }
}

/**
 * Mettre à jour le statut d'un milestone
 */
export async function updateMilestoneStatus(
  id: string,
  status: "PENDING" | "IN_PROGRESS" | "AWAITING_APPROVAL" | "COMPLETED"
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non authentifié" };

  try {
    // Vérifier l'accès via le projet parent
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!milestone || milestone.project.freelancerId !== user.id) {
      return { error: "Jalon introuvable ou accès refusé" };
    }

    await prisma.milestone.update({
      where: { id },
      data: { status },
    });

    revalidatePath(`/dashboard/projects/${milestone.projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur updateMilestoneStatus:", error);
    return { error: "Erreur lors de la mise à jour du statut" };
  }
}

/**
 * Démarrer une étape (passer de PENDING à IN_PROGRESS)
 */
export async function startMilestone(id: string): Promise<ActionResult> {
  return updateMilestoneStatus(id, "IN_PROGRESS");
}

/**
 * Mettre une étape en attente de validation (IN_PROGRESS à AWAITING_APPROVAL)
 */
export async function submitMilestoneForApproval(id: string): Promise<ActionResult> {
  return updateMilestoneStatus(id, "AWAITING_APPROVAL");
}

/**
 * Valider une étape complètement (AWAITING_APPROVAL à COMPLETED)
 */
export async function completeMilestone(id: string): Promise<ActionResult> {
  return updateMilestoneStatus(id, "COMPLETED");
}

/**
 * Obtenir le prochain milestone à démarrer
 */
export async function getNextMilestone(projectId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non authentifié" };

  try {
    const project = await verifyProjectOwnership(projectId, user.id);
    if (!project) {
      return { error: "Projet introuvable ou accès refusé" };
    }

    // Récupérer le premier milestone qui n'est pas COMPLETED
    const milestone = await prisma.milestone.findFirst({
      where: {
        projectId,
        status: { not: "COMPLETED" },
      },
      orderBy: { order: "asc" },
    });

    return { success: true, data: milestone };
  } catch (error) {
    console.error("Erreur getNextMilestone:", error);
    return { error: "Erreur lors de la récupération" };
  }
}

/**
 * Obtenir les statistiques du projet
 */
export async function getProjectStats(projectId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non authentifié" };

  try {
    const project = await verifyProjectOwnership(projectId, user.id);
    if (!project) {
      return { error: "Projet introuvable ou accès refusé" };
    }

    const milestones = await prisma.milestone.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
    });

    const completed = milestones.filter(m => m.status === "COMPLETED").length;
    const inProgress = milestones.filter(m => m.status === "IN_PROGRESS").length;
    const current = milestones.find(m => m.status === "IN_PROGRESS" || m.status === "PENDING");

    return {
      success: true,
      data: {
        total: milestones.length,
        completed,
        inProgress,
        pendingCount: milestones.filter(m => m.status === "PENDING").length,
        awaitingApprovalCount: milestones.filter(m => m.status === "AWAITING_APPROVAL").length,
        currentMilestone: current,
        progress: milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0,
      },
    };
  } catch (error) {
    console.error("Erreur getProjectStats:", error);
    return { error: "Erreur lors de la récupération" };
  }
}

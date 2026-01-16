// app/actions/project.ts
"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma"; // Note les accolades ici !
import { revalidatePath } from "next/cache";

// --- SCHEMAS ---

const CreateProjectSchema = z.object({
  title: z.string().min(1, { message: "Le titre est requis" }),
  description: z.string().optional(),
});

const CreateInviteSchema = z.object({
  projectId: z.string().uuid(),
  email: z.string().email({ message: "Email invalide" }),
});

export type ActionState = {
  message?: string;
  link?: string;
  error?: string;
  success?: boolean;
};

// --- ACTIONS ---

/**
 * Créer un nouveau projet (Freelance)
 */
export async function createProject(formData: { title: string; description?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non authentifié" };

  const validated = CreateProjectSchema.safeParse(formData);
  
  if (!validated.success) {
    return { error: "Données invalides" };
  }

  try {
    // On utilise PRISMA ici
    const project = await prisma.project.create({
      data: {
        name: validated.data.title, // Attention: 'name' dans le schema, 'title' dans ton form
        description: validated.data.description,
        freelancerId: user.id, // C'est toi le freelancer !
        status: "DRAFT"
      },
    });

    revalidatePath('/dashboard/projects');
    return { success: true, project };

  } catch (error) {
    console.error("Erreur createProject:", error);
    return { error: "Erreur lors de la création du projet" };
  }
}

/**
 * Créer une invitation pour un client
 */
export async function createInvitation(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  // 1. Validation
  const validatedFields = CreateInviteSchema.safeParse({
    projectId: formData.get("projectId"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return { error: "Email invalide." };
  }

  const { projectId, email } = validatedFields.data;

  try {
    // 2. Sécurité : Vérifier que le projet appartient bien au freelancer connecté
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        freelancerId: user.id, 
      },
    });

    if (!project) {
      return { error: "Projet introuvable ou accès refusé." };
    }

    // 3. Logique d'invitation
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valide 7 jours

    // Nettoyage des anciennes invitations pour cet email/projet
    await prisma.projectInvitation.deleteMany({
      where: { projectId, email } 
    });

    // Création
    await prisma.projectInvitation.create({
      data: {
        email,
        token,
        projectId,
        expiresAt,
        status: "PENDING",
      },
    });

    // Mise à jour du statut projet si nécessaire
    if (project.status === 'DRAFT') {
       await prisma.project.update({
         where: { id: projectId },
         data: { status: 'ONBOARDING' }
       });
    }

    // 4. Génération du lien
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const link = `${baseUrl}invite/${token}`;

    revalidatePath(`/dashboard/projects/${projectId}`);

    return { 
      message: "Lien généré !", 
      link: link,
      success: true
    };

  } catch (error) {
    console.error("Erreur createInvitation:", error);
    return { error: "Erreur serveur lors de la création de l'invitation." };
  }
}
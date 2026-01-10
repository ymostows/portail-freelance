'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomUUID } from "crypto";

// Validation des données entrantes
const createProjectSchema = z.object({
  title: z.string().min(1, { message: "Le titre doit faire au moins 1 caractère" }),
  description: z.string().optional(),
});

export async function createProject(formData: { title: string; description?: string }) {
  const supabase = await createClient();

  // 1. Qui est connecté ?
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Non authentifié" };

  // 2. Validation
  const validated = createProjectSchema.safeParse(formData);
  if (!validated.success) {
    return { error: "Données invalides" };
  }

  // 3. Insertion en base
  // On utilise "Project" (majuscule) et "clientId" (camelCase) pour matcher Prisma
  const { data, error } = await supabase
    .from("Project") 
    .insert({
      id: randomUUID(),
      title: validated.data.title,
      description: validated.data.description,
      clientId: user.id, 
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Erreur création projet:", error);
    return { error: "Impossible de créer le projet." };
  }

  // 4. On rafraîchit la liste des projets
  revalidatePath('/dashboard/projects');
  
  return { success: true, project: data };
}
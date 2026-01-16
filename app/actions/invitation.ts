"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function acceptInvitationAction(token: string) {
  const supabase = await createClient();
  
  // 1. Vérifier que l'utilisateur est connecté
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté pour accepter l'invitation." };
  }

  // 2. Vérifier l'invitation
  const invitation = await prisma.projectInvitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    return { error: "Invitation introuvable ou expirée." };
  }

  // 3. Lier le projet au compte actuel
  try {
    await prisma.project.update({
      where: { id: invitation.projectId },
      data: {
        clientId: user.id, // On lie au user connecté
        status: "ACTIVE",
      },
    });

    // 4. Supprimer l'invitation
    await prisma.projectInvitation.delete({
      where: { id: invitation.id },
    });

  } catch (error) {
    console.error("Erreur acceptation invitation:", error);
    return { error: "Une erreur est survenue lors de la jonction du projet." };
  }

  // 5. Redirection et Update
  revalidatePath("/portal");
  redirect("/portal");
}
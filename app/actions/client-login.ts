"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function loginClient(formData: {
  email: string;
  password: string;
  inviteToken?: string;
}) {
  const { email, password, inviteToken } = formData;

  // 1. Validation basique
  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();

  // 2. Connexion Supabase
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // 3. Si un token d'invitation est fourni, on l'accepte
  if (inviteToken && authData.user) {
    try {
      const invitation = await prisma.projectInvitation.findUnique({
        where: { token: inviteToken },
      });

      if (invitation) {
        const isExpired = new Date() > new Date(invitation.expiresAt);

        if (!isExpired) {
          // Lier le projet au client
          await prisma.project.update({
            where: { id: invitation.projectId },
            data: {
              clientId: authData.user.id,
              status: "ACTIVE",
            },
          });

          // Supprimer l'invitation
          await prisma.projectInvitation.delete({
            where: { id: invitation.id },
          });
        }
      }
    } catch (err) {
      console.error("Erreur liaison client:", err);
      // On continue, le client est connecté
    }
  }

  // 4. Revalidation du cache
  revalidatePath("/", "layout");

  // 5. Retourner le succès
  return {
    success: true,
    redirectTo: inviteToken ? "/portal" : "/dashboard"
  };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

// Validation stricte pour le client
const clientSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  inviteToken: z.string().min(1), // Le token est OBLIGATOIRE ici
});

export async function registerClient(formData: FormData) {
  // 1. Validation des données
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    name: formData.get("name") as string,
    inviteToken: formData.get("inviteToken") as string,
  };

  const validation = clientSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: "Données invalides." };
  }

  const { email, password, name, inviteToken } = validation.data;
  const supabase = await createClient();

  // 2. Vérification de l'invitation AVANT de créer le compte
  // Si l'invitation n'existe pas, on arrête tout.
  const invitation = await prisma.projectInvitation.findUnique({
    where: { token: inviteToken },
  });

  if (!invitation) {
    return { error: "Cette invitation est invalide ou a expiré." };
  }

  // 3. Création du compte Supabase (Role: CLIENT)
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: "CLIENT", // On force le rôle CLIENT
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // 4. Liaison Client -> Projet
  if (authData.user) {
    try {
      // Mise à jour du projet
      await prisma.project.update({
        where: { id: invitation.projectId },
        data: {
          clientId: authData.user.id,
          status: "ACTIVE", // Le projet démarre
        },
      });

      // Suppression de l'invitation
      await prisma.projectInvitation.delete({
        where: { id: invitation.id },
      });
    } catch (err) {
      console.error("Erreur liaison client:", err);
      // On ne retourne pas d'erreur ici car le compte est créé, 
      // le support pourra régler le souci de liaison manuellement si besoin.
    }
  }

  // 5. Redirection vers le Portail Client
  redirect("/portal");
}
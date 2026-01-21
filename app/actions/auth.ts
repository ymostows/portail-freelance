'use server'

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function logout() {
  // 1. Initialisation du client Supabase côté serveur
  const supabase = await createClient();

  // 2. Action de déconnexion
  // C'est ici qu'on doit appeler la méthode magique de Supabase
  await supabase.auth.signOut();

  // 3. Redirection (Nettoyage du cache et retour au login)
  redirect('/login');
}

export async function login(formData: { email: string; password: string }) {
  const supabase = await createClient();

  // 1. Tentative de connexion
  const { data, error } = await supabase.auth.signInWithPassword(formData);

  if (error) {
    // On renvoie l'erreur au client pour qu'il puisse l'afficher
    return { error: error.message };
  }

  // 2. Si ça marche, on revalide le layout pour mettre à jour l'UI (ex: afficher l'avatar)
  revalidatePath('/', 'layout');

  // 3. On détermine l'URL de redirection selon le rôle de l'utilisateur
  const role = data.user?.user_metadata?.role;
  const redirectTo = role === 'CLIENT' ? '/portal' : '/dashboard';

  // 4. On retourne un succès avec l'URL de redirection
  return { success: true, redirectTo };
}

export async function register(formData: { email: string; password: string }) {
  const supabase = await createClient();

    const { error } = await supabase.auth.signUp(formData);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
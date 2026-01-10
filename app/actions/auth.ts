'use server'

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logout() {
  // 1. Initialisation du client Supabase côté serveur
  const supabase = await createClient();

  // 2. Action de déconnexion
  // C'est ici qu'on doit appeler la méthode magique de Supabase
  await supabase.auth.signOut();

  // 3. Redirection (Nettoyage du cache et retour au login)
  redirect('/login');
}
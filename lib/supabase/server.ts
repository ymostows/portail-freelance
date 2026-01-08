import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  // 1. Pour Next.js 15+, cookies() doit être "await"
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 2. Nouvelle syntaxe Supabase : getAll au lieu de get
        getAll() {
          return cookieStore.getAll()
        },
        // 3. Nouvelle syntaxe : setAll au lieu de set/remove
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Le "try/catch" est vital ici :
            // Les Server Components (Pages) n'ont pas le droit d'écrire des cookies.
            // Seul le Middleware ou les Server Actions le peuvent.
            // On ignore donc l'erreur silencieusement ici, c'est prévu.
          }
        },
      },
    }
  )
}
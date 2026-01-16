import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options })
            response = NextResponse.next({
              request: { headers: request.headers },
            })
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // --- DÉFINITION DES ZONES ---
  const path = request.nextUrl.pathname
  const isAuthPage = path.startsWith('/login') || path.startsWith('/register')
  
  // Zones protégées
  const isDashboardPage = path.startsWith('/dashboard') // Réservé Freelance
  const isPortalPage = path.startsWith('/portal')       // Réservé Client

  // --- CAS A : Protection des Routes Privées (Si pas connecté) ---
  if (!user && (isDashboardPage || isPortalPage)) {
    // On redirige vers login, mais on peut garder l'url de retour si besoin
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // --- CAS B : Redirection Intelligente (Si déjà connecté) ---
  if (user && isAuthPage) {
    // On vérifie le rôle pour savoir où rediriger
    const role = user.user_metadata?.role

    if (role === 'CLIENT') {
      return NextResponse.redirect(new URL('/portal', request.url))
    } else {
      // Par défaut (ou si Freelance), on envoie au dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
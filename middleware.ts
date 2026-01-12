import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'


export async function middleware(request: NextRequest) {

  if (request.nextUrl.pathname === '/invite') {
    const token = request.nextUrl.searchParams.get('token')
    
    // On décide où envoyer l'utilisateur (Register par défaut)
    // Astuce : request.url permet de garder le bon domaine (localhost ou prod)
    const redirectUrl = new URL('/register', request.url)
    
    // On crée la réponse de redirection
    const response = NextResponse.redirect(redirectUrl)

    // Si le token est présent, on le sauvegarde dans un cookie
    if (token) {
      response.cookies.set('invite_token', token, {
        httpOnly: true, // Invisible pour le JS client (sécurité)
        secure: process.env.NODE_ENV === 'production', // Uniquement HTTPS en prod
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // Expire dans 24h
      })
    }

    // On renvoie la réponse immédiatement, pas besoin d'aller plus loin
    return response
  }

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
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ... (Garde ta logique de redirection CAS A et CAS B ici, elle ne change pas) ...
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')

  if (!user && isDashboardPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
import { UserRegisterForm } from "@/components/auth/user-register-form";
import { ClientRegisterForm } from "@/components/auth/client-register-form";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RegisterPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { invite } = await searchParams;
  const inviteToken = typeof invite === 'string' ? invite : undefined;
  const isClientFlow = !!inviteToken;

  // Client Flow: Card simple centrée (comme le login)
  if (isClientFlow) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card>
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Invitation Projet</CardTitle>
              <p className="text-sm text-muted-foreground">
                Créez votre accès client pour voir le projet.
              </p>
            </CardHeader>

            <CardContent className="grid gap-4">
              <ClientRegisterForm inviteToken={inviteToken} />
            </CardContent>

            <CardFooter>
              <p className="px-8 text-center text-sm text-muted-foreground">
                Déjà un compte ?{" "}
                <Link
                  href={`/login?invite=${inviteToken}`}
                  className="hover:text-brand underline underline-offset-4"
                >
                  Se connecter
                </Link>
              </p>
            </CardFooter>
          </div>
        </Card>
      </div>
    );
  }

  // Freelance Flow: Layout deux colonnes
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">

      {/* Colonne de Gauche (Visuel) */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          Mon SaaS Freelance
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Gérez vos projets freelances avec simplicité et efficacité.
            </p>
          </blockquote>
        </div>
      </div>

      {/* Colonne de Droite (Formulaire) */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">

          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Créer un compte
            </h1>
            <p className="text-sm text-muted-foreground">
              Entrez vos informations pour démarrer.
            </p>
          </div>

          <UserRegisterForm />

          <p className="px-8 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from "next"
import Link from "next/link"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { UserAuthForm } from "@/components/auth/user-auth-form"

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte",
}

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { invite } = await searchParams;
  const inviteToken = typeof invite === 'string' ? invite : undefined;
  const isClientFlow = !!inviteToken;

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card>
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">
                      {isClientFlow ? "Connexion Client" : "Se connecter"}
                    </CardTitle>
                    {isClientFlow && (
                      <p className="text-sm text-muted-foreground">
                        Connectez-vous pour accepter l&apos;invitation projet
                      </p>
                    )}
                </CardHeader>

                <CardContent className="grid gap-4">
                    <UserAuthForm inviteToken={inviteToken} />
                </CardContent>
                <CardFooter>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Pas encore de compte ? {" "}
                        <Link
                          href={isClientFlow ? `/register?invite=${inviteToken}` : "/register"}
                          className="hover:text-brand underline underline-offset-4"
                        >
                            Inscrivez-vous
                        </Link>
                    </p>
                </CardFooter>
            </div>
        </Card>
    </div>
  )
}
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

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card>        
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Se connecter</CardTitle>
                </CardHeader>
                
                <CardContent className="grid gap-4">
                    <UserAuthForm />
                </CardContent>
                <CardFooter>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Pas encore de compte ? {" "}
                        <Link href="/register" className="hover:text-brand underline underline-offset-4">
                            Inscrivez-vous
                        </Link>
                    </p>
                </CardFooter>
            </div>
        </Card>
    </div>
  )
}
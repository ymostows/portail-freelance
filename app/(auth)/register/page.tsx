import { Metadata } from "next"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserRegisterForm } from "@/components/auth/user-register-form"

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez votre compte pour commencer",
}

export default function RegisterPage() {
  return (
    // 1. Le wrapper global identique au Login (centrage écran)
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card>
        {/* 2. La div de structure interne (largeur 350px) */}
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Créer un compte</CardTitle>

          </CardHeader>
          
          <CardContent className="grid gap-4">
            <UserRegisterForm />
          </CardContent>
          
          <CardFooter>
            <p className="px-8 text-center text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link href="/login" className="hover:text-brand underline underline-offset-4">
                Se connecter
              </Link>
            </p>
          </CardFooter>
          
        </div>
      </Card>
    </div>
  )
}
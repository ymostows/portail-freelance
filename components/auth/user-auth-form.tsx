"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"; // 👈 Pour les notifications
import { createClient } from "@/lib/supabase/client" //
import { PasswordInput } from "@/components/ui/password-input"
import { login } from "@/app/actions/auth"
import { loginClient } from "@/app/actions/client-login"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// 1. Schéma de validation (Sécurité)
// Zod vérifie que c'est bien un email AVANT même d'envoyer la requête.
const formSchema = z.object({
  email: z.string().email({
    message: "Email invalide.",
  }),
  password: z.string()
    .min(8, { message: "Le mot de passe doit faire au moins 8 caractères." }) // Longueur min
    .regex(/[A-Z]/, { message: "Il faut au moins une majuscule." })           // Majuscule
    .regex(/[0-9]/, { message: "Il faut au moins un chiffre." })              // Chiffre
    .regex(/[^a-zA-Z0-9]/, { message: "Il faut au moins un caractère spécial." }), // Caractère spécial
})

interface UserAuthFormProps {
  inviteToken?: string;
}

export function UserAuthForm({ inviteToken }: UserAuthFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const supabase = createClient()
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    // Si on a un token d'invitation, on utilise loginClient
    if (inviteToken) {
      const result = await loginClient({
        ...values,
        inviteToken,
      });

      if (result?.error) {
        setIsLoading(false)
        return toast.error("Erreur de connexion", {
          description: result.error,
        })
      }

      toast.success("Connexion réussie", {
        description: "Invitation acceptée ! Redirection vers votre espace...",
      })

      router.refresh()
      router.push(result.redirectTo || "/portal")
      return
    }

    // Sinon, login classique
    const result = await login(values);

    if (result?.error) {
      setIsLoading(false)
      return toast.error("Erreur de connexion", {
        description: "Email ou mot de passe incorrect.",
      })
    }

    toast.success("Connexion réussie", {
      description: "Redirection vers le dashboard...",
    })

    router.refresh()
    router.push("/dashboard")
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      placeholder="nom@exemple.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="********" {...field}
                            showPassword={showPassword}
                            onToggle={() => setShowPassword(!showPassword)}
                      />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isLoading}>
              {isLoading && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {inviteToken ? "Connexion et accepter l'invitation" : "Connexion"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
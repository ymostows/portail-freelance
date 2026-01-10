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

export function UserAuthForm() {
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

    const result = await login(values);

    if (result?.error) {
      setIsLoading(false)
      return toast.error("Erreur de connexion", {
        description: "Email ou mot de passe incorrect.", // Tu peux utiliser result.error ici si tu veux le message précis
      })
    }

    toast.success("Connexion réussie", {
      description: "Redirection vers le dashboard...",
    })
    
    // On laisse le routeur faire la navigation finale
    router.refresh() // Rafraîchit les données serveur (cookies)
    router.push("/dashboard")
    
    // Note : pas besoin de setIsLoading(false) car on change de page
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
                // Petit spinner de chargement manuel (ou via une icône Lucide)
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              Connexion
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
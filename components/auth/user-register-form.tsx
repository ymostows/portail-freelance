"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner";
import { PasswordInput } from "@/components/ui/password-input"
import { register } from "@/app/actions/auth"

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
    confirmPassword: z.string()
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  })

export function UserRegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    // 👇 CORRECTION : On extrait confirmPassword pour ne pas l'envoyer
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registrationData } = values;

    // On envoie seulement email et password
    const result = await register(registrationData);

    if (result?.error) {
      setIsLoading(false)
      return toast.error("Erreur de l'inscription", {
        description: result.error,
      })
    }

    if (result?.success) {
        toast.success("Compte créé !", {
         description: "Vérifiez vos emails pour confirmer votre inscription.",
       });
       router.push("/dashboard");
    }
    
    setIsLoading(false)
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
            <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Confirmez le mot de passe</FormLabel>
                            <FormControl>
                                <PasswordInput placeholder="********" {...field}
                                showPassword={showPassword}
                                hideToggle={true}
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
              S&apos;inscrire
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
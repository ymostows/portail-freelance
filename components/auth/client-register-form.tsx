"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { registerClient } from "@/app/actions/client-auth";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schéma de validation Zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit faire au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Email invalide.",
  }),
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit faire au moins 8 caractères." })
    .regex(/[A-Z]/, { message: "Il faut au moins une majuscule." })
    .regex(/[0-9]/, { message: "Il faut au moins un chiffre." })
    .regex(/[^a-zA-Z0-9]/, { message: "Il faut au moins un caractère spécial." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

interface ClientRegisterFormProps {
  inviteToken: string;
}

export function ClientRegisterForm({ inviteToken }: ClientRegisterFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("inviteToken", inviteToken);
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("password", values.password);

    const result = await registerClient(formData);

    if (result?.error) {
      toast.error("Erreur d'inscription", {
        description: result.error,
      });
      setIsLoading(false);
      return;
    }

    toast.success("Compte créé avec succès", {
      description: "Redirection vers votre espace projet...",
    });
    // La redirection se fait côté serveur
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder="Ex: Jean Dupont"
                      autoCapitalize="words"
                      autoComplete="name"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email professionnel</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      placeholder="client@societe.com"
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
                    <PasswordInput
                      placeholder="********"
                      {...field}
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
                  <FormLabel>Confirmer le mot de passe</FormLabel>
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
              Accepter l&apos;invitation et rejoindre le projet
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

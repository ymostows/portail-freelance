"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// On importe l'action serveur
import { createProject } from "@/app/actions/project"

const formSchema = z.object({
  title: z.string().min(2, "Le titre est trop court"),
  description: z.string().optional(),
})

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false) // Pour fermer la modale après succès
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    // Appel à l'action serveur
    const result = await createProject(values)

    setIsLoading(false)

    if (result.error) {
      toast.error("Erreur", { description: result.error })
      return
    }

    toast.success("Projet créé !", { description: "Le projet a été ajouté avec succès." })
    form.reset() // On vide le formulaire
    setOpen(false) // On ferme la modale
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nouveau Projet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un projet</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau projet pour commencer le suivi.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du projet</FormLabel>
                  <FormControl>
                    <Input placeholder="Refonte site web..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optionnel)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Détails de la mission..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                {isLoading ? "Création..." : "Créer le projet"}
                </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

"use client";

import { useActionState, useState } from "react";
import { createInvitation } from "@/app/actions/project";
import { Button } from "@/components/ui/button"; // Assure-toi d'avoir tes composants Shadcn
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Loader2 } from "lucide-react";

export function InviteClientDialog({ projectId }: { projectId: string }) {
  const [state, action, isPending] = useActionState(createInvitation, {});
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (state.link) {
      navigator.clipboard.writeText(state.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Inviter un Client</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inviter le client</DialogTitle>
          <DialogDescription>
            Générez un lien unique pour permettre à votre client de rejoindre le projet.
          </DialogDescription>
        </DialogHeader>

        {!state.link ? (
          /* Formulaire de création */
          <form action={action} className="space-y-4">
            <input type="hidden" name="projectId" value={projectId} />
            
            <div className="space-y-2">
              <Label htmlFor="email">Email du client</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="client@exemple.com"
                required
              />
            </div>

            {state.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Générer le lien
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* Affichage du lien généré */
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Lien
                </Label>
                <Input
                  id="link"
                  defaultValue={state.link}
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <Button type="button" size="sm" className="px-3" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-green-600 font-medium text-center">
              {state.message}
            </p>
            <DialogFooter>
               <Button variant="secondary" onClick={() => setIsOpen(false)}>Fermer</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
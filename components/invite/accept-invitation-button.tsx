"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { acceptInvitationAction } from "@/app/actions/invitation";
import { CheckCircle, Loader2 } from "lucide-react";

interface AcceptInvitationButtonProps {
  token: string;
  projectName: string;
}

export function AcceptInvitationButton({ token, projectName }: AcceptInvitationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleAccept() {
    setIsLoading(true);

    const result = await acceptInvitationAction(token);

    if (result?.error) {
      setIsLoading(false);
      toast.error("Erreur", {
        description: result.error,
      });
      return;
    }

    toast.success("Invitation acceptée !", {
      description: `Vous avez rejoint le projet "${projectName}"`,
    });

    // La redirection est gérée par la server action
  }

  return (
    <Button
      onClick={handleAccept}
      disabled={isLoading}
      className="w-full bg-green-600 hover:bg-green-700"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Acceptation en cours...
        </>
      ) : (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Accepter et rejoindre le projet
        </>
      )}
    </Button>
  );
}

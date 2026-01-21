"use client";

import { useState } from "react";
import { Play, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { startMilestone, submitMilestoneForApproval, completeMilestone } from "@/app/actions/milestone";
import { toast } from "sonner";

interface MilestoneControlsProps {
  milestoneId: string;
  status: string;
  isFirst: boolean;
  isActive: boolean;
  onStatusChange?: (newStatus: string) => void;
  isProjectActive: boolean;
}

export function MilestoneControls({
  milestoneId,
  status,
  isFirst,
  isActive,
  onStatusChange,
  isProjectActive,
}: MilestoneControlsProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isProjectActive) {
    return null;
  }

  const handleStart = async () => {
    setIsLoading(true);
    const result = await startMilestone(milestoneId);
    if (result.error) {
      toast.error("Erreur", { description: result.error });
    } else {
      toast.success("Étape démarrée !");
      onStatusChange?.("IN_PROGRESS");
    }
    setIsLoading(false);
  };

  const handleSubmitForApproval = async () => {
    setIsLoading(true);
    const result = await submitMilestoneForApproval(milestoneId);
    if (result.error) {
      toast.error("Erreur", { description: result.error });
    } else {
      toast.success("Étape soumise pour validation");
      onStatusChange?.("AWAITING_APPROVAL");
    }
    setIsLoading(false);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    const result = await completeMilestone(milestoneId);
    if (result.error) {
      toast.error("Erreur", { description: result.error });
    } else {
      toast.success("Étape validée !");
      onStatusChange?.("COMPLETED");
    }
    setIsLoading(false);
  };

  // PENDING: Can start
  if (status === "PENDING") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={handleStart}
        disabled={isLoading}
        className="h-8 text-xs gap-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300"
      >
        <Play className="h-3.5 w-3.5" />
        Démarrer
      </Button>
    );
  }

  // IN_PROGRESS: Can submit for approval
  if (status === "IN_PROGRESS") {
    return (
      <Button
        size="sm"
        variant="default"
        onClick={handleSubmitForApproval}
        disabled={isLoading}
        className={cn(
          "h-8 text-xs gap-1.5",
          "bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700",
          "animate-pulse"
        )}
      >
        <Send className="h-3.5 w-3.5" />
        {isLoading ? "Envoi..." : "Soumettre"}
      </Button>
    );
  }

  // AWAITING_APPROVAL: Can complete
  if (status === "AWAITING_APPROVAL") {
    return (
      <Button
        size="sm"
        variant="default"
        onClick={handleComplete}
        disabled={isLoading}
        className="h-8 text-xs gap-1.5 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        {isLoading ? "Validation..." : "Valider"}
      </Button>
    );
  }

  // COMPLETED: Show status badge
  if (status === "COMPLETED") {
    return (
      <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Complétée
      </div>
    );
  }

  return null;
}

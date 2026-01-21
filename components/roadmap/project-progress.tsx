"use client";

import { useState, useEffect } from "react";
import { Play, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProjectProgressProps {
  projectStatus: string;
  totalMilestones: number;
  completedMilestones: number;
  currentMilestone: { id: string; title: string; order: number } | null;
  inProgressCount: number;
  onStartMilestone?: () => void;
  isLoading?: boolean;
}

export function ProjectProgress({
  projectStatus,
  totalMilestones,
  completedMilestones,
  currentMilestone,
  inProgressCount,
  onStartMilestone,
  isLoading = false,
}: ProjectProgressProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (projectStatus === "ACTIVE") {
      setAnimate(true);
    }
  }, [projectStatus]);

  if (projectStatus !== "ACTIVE") {
    return null;
  }

  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  const isInProgress = inProgressCount > 0;
  const pendingCount = totalMilestones - completedMilestones - inProgressCount;

  return (
    <Card className="border shadow-sm bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <CardContent className="p-4 space-y-3">
        {/* Header avec titre et indicateur */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              isInProgress
                ? animate && "animate-pulse bg-orange-500"
                : completedMilestones === totalMilestones
                  ? "bg-green-500"
                  : "bg-blue-500"
            )} />
            <h3 className="text-sm font-semibold">Avancement</h3>
          </div>
          <span className="text-xs font-medium text-muted-foreground">{Math.round(progress)}%</span>
        </div>

        {/* Barre de progression */}
        <Progress value={progress} className="h-1.5" />

        {/* Stats en 3 colonnes: À faire | En cours | Complétées */}
        <div className="grid grid-cols-3 gap-2">
          {/* À faire - Gauche */}
          <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-2 text-center">
            <div className="text-base font-bold text-blue-600 dark:text-blue-400">{pendingCount}</div>
            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">À faire</div>
          </div>

          {/* En cours - Centre */}
          <div className={cn(
            "rounded-md border p-2 text-center transition-all duration-300",
            isInProgress
              ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900 scale-105 shadow-sm"
              : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800"
          )}>
            <div className={cn(
              "text-base font-bold",
              isInProgress ? "text-orange-600 dark:text-orange-400" : "text-gray-400"
            )}>
              {inProgressCount}
            </div>
            <div className={cn(
              "text-xs font-medium",
              isInProgress ? "text-orange-700 dark:text-orange-300" : "text-gray-500"
            )}>
              En cours
            </div>
          </div>

          {/* Complétées - Droite */}
          <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-2 text-center">
            <div className="text-base font-bold text-green-600 dark:text-green-400">{completedMilestones}</div>
            <div className="text-xs text-green-700 dark:text-green-300 font-medium">Complétées</div>
          </div>
        </div>

        {/* Étape actuelle ou prochaine */}
        {currentMilestone && (
          <div className={cn(
            "rounded-md border-l-4 pl-3 py-2 pr-3 flex items-start gap-2.5 transition-all duration-300",
            isInProgress
              ? "border-l-orange-500 bg-orange-50 dark:bg-orange-950/30"
              : "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30"
          )}>
            {/* Icône animée */}
            <div className="relative pt-0.5">
              {isInProgress ? (
                <div className="relative">
                  <div className="absolute inset-0 rounded-full border-2 border-orange-400 animate-pulse opacity-50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                </div>
              ) : (
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            
            {/* Texte */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-0.5 uppercase tracking-wide">
                {isInProgress ? "En cours" : "Prochaine"}
              </p>
              <p className="text-sm font-semibold text-foreground truncate">
                Étape {currentMilestone.order + 1} • {currentMilestone.title}
              </p>
            </div>

            {/* Bouton compact */}
            {!isInProgress && onStartMilestone && (
              <Button
                onClick={onStartMilestone}
                disabled={isLoading}
                size="sm"
                variant="default"
                className="h-7 px-2 shrink-0 gap-1 text-xs"
              >
                <Play className="w-3 h-3" />
                Démarrer
              </Button>
            )}
          </div>
        )}

        {/* Message de complétion */}
        {completedMilestones === totalMilestones && totalMilestones > 0 && (
          <div className="rounded-md border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/30 p-2.5 flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-green-900 dark:text-green-100">Projet complété 🎉</p>
              <p className="text-xs text-green-800 dark:text-green-200 mt-0.5">
                Toutes les étapes validées !
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

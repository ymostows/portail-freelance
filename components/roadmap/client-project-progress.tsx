"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ClientProjectProgressProps {
  projectName: string;
  totalMilestones: number;
  completedMilestones: number;
  inProgressMilestones: number;
  currentMilestone: { id: string; title: string; order: number; status: string } | null;
}

export function ClientProjectProgress({
  projectName,
  totalMilestones,
  completedMilestones,
  inProgressMilestones,
  currentMilestone,
}: ClientProjectProgressProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  const isInProgress = inProgressMilestones > 0;
  const isCompleted = completedMilestones === totalMilestones && totalMilestones > 0;

  return (
    <Card className="border shadow-sm bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <CardHeader className="pb-3 border-b">
        <div>
          <CardTitle className="text-lg">{projectName}</CardTitle>
          <CardDescription className="mt-1">
            {isCompleted
              ? "Projet complété avec succès"
              : isInProgress
                ? "Projet en cours"
                : "Projet en attente"}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Animated Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progression</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-in-out",
                isCompleted
                  ? "bg-green-500"
                  : isInProgress
                    ? "bg-orange-500 animate-pulse"
                    : "bg-blue-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status Cards Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-3 text-center border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedMilestones}</div>
            <div className="text-xs text-green-700 dark:text-green-300 font-medium mt-1">Complétées</div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-3 text-center border border-orange-200 dark:border-orange-800">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{inProgressMilestones}</div>
            <div className="text-xs text-orange-700 dark:text-orange-300 font-medium mt-1">En cours</div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-3 text-center border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalMilestones - completedMilestones - inProgressMilestones}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mt-1">À faire</div>
          </div>
        </div>

        {/* Current Milestone */}
        {currentMilestone && (
          <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              {currentMilestone.status === "IN_PROGRESS" ? (
                <div className="relative">
                  <AlertCircle className="h-6 w-6 text-orange-500 shrink-0 mt-0.5" />
                  <div className="absolute inset-0 rounded-full border-2 border-orange-500 animate-pulse opacity-50" />
                </div>
              ) : (
                <Clock className="h-6 w-6 text-blue-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {currentMilestone.status === "IN_PROGRESS" ? "Étape en cours" : "Prochaine étape"}
                </p>
                <p className="font-semibold text-base">
                  Étape {currentMilestone.order + 1}: {currentMilestone.title}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completion Badge */}
        {isCompleted && (
          <div className="rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                Projet complété ! 🎉
              </p>
              <p className="text-sm text-green-800 dark:text-green-200">
                Toutes les étapes ont été validées avec succès. Merci !
              </p>
            </div>
          </div>
        )}

        {/* Timeline Overview */}
        <div className="rounded-lg bg-muted/30 p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Étapes du projet
          </p>
          <div className="space-y-2">
            {Array.from({ length: totalMilestones }).map((_, index) => {
              const isCompleted = index < completedMilestones;
              const isInProgress = index === completedMilestones && inProgressMilestones > 0;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-2 text-xs py-1 px-2 rounded transition-colors",
                    isCompleted && "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300",
                    isInProgress && "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 animate-pulse",
                    !isCompleted && !isInProgress && "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center text-2xs font-bold",
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isInProgress
                          ? "bg-orange-500 text-white"
                          : "bg-gray-300 dark:bg-gray-600"
                    )}
                  >
                    {isCompleted ? "✓" : isInProgress ? "●" : index + 1}
                  </div>
                  <span>Étape {index + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

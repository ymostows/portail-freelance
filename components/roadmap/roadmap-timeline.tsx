"use client";

import { useState } from "react";
import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MilestoneCard, MilestoneData } from "./milestone-card";
import { ProjectProgress } from "./project-progress";
import {
  reorderMilestones,
  updateMilestone,
  deleteMilestone,
  addMilestone,
  validateRoadmap,
  getProjectStats,
  startMilestone,
} from "@/app/actions/milestone";

interface RoadmapTimelineProps {
  projectId: string;
  projectStatus: string;
  initialMilestones: MilestoneData[];
  onReset: () => void;
}

export function RoadmapTimeline({
  projectId,
  projectStatus,
  initialMilestones,
  onReset,
}: RoadmapTimelineProps) {
  const [milestones, setMilestones] = useState<MilestoneData[]>(initialMilestones);
  const [isValidating, setIsValidating] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(projectStatus === "ACTIVE");
  const [isStartingMilestone, setIsStartingMilestone] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load stats when project is ACTIVE
  React.useEffect(() => {
    if (projectStatus === "ACTIVE") {
      loadStats();
    }
  }, [projectStatus]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = milestones.findIndex((m) => m.id === active.id);
      const newIndex = milestones.findIndex((m) => m.id === over.id);

      const newOrder = arrayMove(milestones, oldIndex, newIndex);
      setMilestones(newOrder);

      // Persist to database
      const result = await reorderMilestones(
        projectId,
        newOrder.map((m) => m.id)
      );

      if (result.error) {
        // Revert on error
        setMilestones(milestones);
        toast.error("Erreur", { description: result.error });
      }
    }
  }

  async function handleUpdate(
    id: string,
    data: { title?: string; description?: string; estimatedDuration?: string | null }
  ) {
    // Optimistic update
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...data } : m
      )
    );

    const result = await updateMilestone(id, data);

    if (result.error) {
      // Revert on error
      setMilestones(initialMilestones);
      toast.error("Erreur", { description: result.error });
    }
  }

  async function handleDelete(id: string) {
    const previousMilestones = [...milestones];
    
    // Optimistic update
    setMilestones((prev) => prev.filter((m) => m.id !== id));

    const result = await deleteMilestone(id);

    if (result.error) {
      setMilestones(previousMilestones);
      toast.error("Erreur", { description: result.error });
    } else {
      toast.success("Jalon supprimé");
    }
  }

  async function handleAdd(afterOrder?: number) {
    const result = await addMilestone(projectId, afterOrder);

    if (result.error) {
      toast.error("Erreur", { description: result.error });
    } else {
      // The page will be revalidated by the server action
      toast.success("Jalon ajouté");
    }
  }

  async function handleValidate() {
    setIsValidating(true);

    const result = await validateRoadmap(projectId);

    if (result.error) {
      toast.error("Erreur", { description: result.error });
    } else {
      toast.success("Projet validé !", {
        description: "La roadmap est maintenant active.",
      });
    }

    setIsValidating(false);
  }

  async function loadStats() {
    setIsLoadingStats(true);
    const result = await getProjectStats(projectId);
    if (result.success && result.data) {
      setStats(result.data);
    }
    setIsLoadingStats(false);
  }

  async function handleStartMilestone() {
    if (!stats?.currentMilestone) return;
    
    setIsStartingMilestone(true);
    const result = await startMilestone(stats.currentMilestone.id);
    
    if (result.error) {
      toast.error("Erreur", { description: result.error });
    } else {
      toast.success("Étape démarrée !");
      // Update local state
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === stats.currentMilestone.id ? { ...m, status: "IN_PROGRESS" } : m
        )
      );
      // Reload stats
      await loadStats();
    }
    
    setIsStartingMilestone(false);
  }

  function handleMilestoneStatusChange(milestoneId: string, newStatus: string) {
    // Update local state
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId ? { ...m, status: newStatus } : m
      )
    );
    // Reload stats
    loadStats();
  }

  const isDraft = projectStatus === "DRAFT";

  return (
    <div className="w-full space-y-4 pb-24">
      {/* Project Progress Card - Show when ACTIVE */}
      {projectStatus === "ACTIVE" && !isLoadingStats && stats && (
        <ProjectProgress
          projectStatus={projectStatus}
          totalMilestones={stats.total}
          completedMilestones={stats.completed}
          currentMilestone={stats.currentMilestone}
          inProgressCount={stats.inProgress}
          onStartMilestone={handleStartMilestone}
          isLoading={isStartingMilestone}
        />
      )}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 border-b bg-muted/30">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-base">Roadmap du projet</CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {milestones.length} jalon{milestones.length > 1 ? "s" : ""} - Glissez-déposez pour réorganiser
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={onReset} className="h-8 text-xs">
                <RotateCcw className="h-3 w-3 mr-1.5" />
                Régénérer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAdd(milestones.length - 1)}
                className="h-8 text-xs"
              >
                <Plus className="h-3 w-3 mr-1.5" />
                Ajouter un jalon
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {milestones.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">Aucun jalon pour le moment.</p>
              <Button
                variant="link"
                onClick={() => handleAdd()}
                className="mt-2 text-xs h-6"
              >
                Ajouter le premier jalon
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={milestones.map((m) => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-0">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id}>
                      <MilestoneCard
                        milestone={milestone}
                        isFirst={index === 0}
                        isLast={index === milestones.length - 1}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        onStatusChange={handleMilestoneStatusChange}
                        isProjectActive={projectStatus === "ACTIVE"}
                      />
                      {/* Add button between milestones */}
                      {index < milestones.length - 1 && (
                        <div className="flex justify-center -my-1.5 relative z-10">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 rounded-full bg-background border hover:bg-muted"
                            onClick={() => handleAdd(milestone.order)}
                            title="Insérer un jalon"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Validation button for DRAFT projects - Fixed at bottom */}
      {isDraft && milestones.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-3 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex justify-center px-4">
            <Button
              size="sm"
              onClick={handleValidate}
              disabled={isValidating}
              className="shadow-lg"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              {isValidating ? "Validation..." : "Valider et Activer le Projet"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

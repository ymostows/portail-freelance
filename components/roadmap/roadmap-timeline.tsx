"use client";

import { useState } from "react";
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
import {
  reorderMilestones,
  updateMilestone,
  deleteMilestone,
  addMilestone,
  validateRoadmap,
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

  const isDraft = projectStatus === "DRAFT";

  return (
    <div className="w-full space-y-4 pb-24">
      <Card className="border-0 shadow-sm bg-linear-to-br from-background to-muted/20">
        <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-lg font-semibold">Timeline des jalons</CardTitle>
              <CardDescription className="mt-1 text-xs">
                {milestones.length} jalon{milestones.length > 1 ? "s" : ""} • Réorganisez en glissant
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={onReset} className="h-8 text-xs gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                Régénérer
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleAdd(milestones.length > 0 ? milestones.length - 1 : 0)}
                className="h-8 text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          {milestones.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="mb-3">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/30" />
              </div>
              <p className="text-sm font-medium">Aucun jalon pour le moment</p>
              <p className="text-xs mb-4">Commencez par ajouter votre premier jalon</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAdd()}
                className="text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Créer le premier jalon
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
                <div className="space-y-1">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id}>
                      <MilestoneCard
                        milestone={milestone}
                        isFirst={index === 0}
                        isLast={index === milestones.length - 1}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                      />
                      {/* Add button between milestones */}
                      {index < milestones.length - 1 && (
                        <div className="flex justify-center -my-2 relative z-10">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full bg-muted border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                            onClick={() => handleAdd(milestone.order)}
                            title="Insérer un jalon"
                          >
                            <Plus className="h-3 w-3" />
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
        <div className="fixed bottom-0 left-0 right-0 bg-linear-to-t from-background/98 via-background/95 to-transparent border-t border-border/50 p-4 z-50 shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.1)]">
          <div className="flex justify-center px-4 max-w-7xl mx-auto">
            <Button
              size="lg"
              onClick={handleValidate}
              disabled={isValidating}
              className="gap-2 shadow-lg"
            >
              <CheckCircle2 className="h-5 w-5" />
              {isValidating ? "Validation en cours..." : "Valider et Activer le Projet"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

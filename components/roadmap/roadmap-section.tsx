"use client";

import { useState } from "react";
import { toast } from "sonner";

import { RoadmapGenerator, GeneratedMilestone } from "./roadmap-generator";
import { RoadmapTimeline } from "./roadmap-timeline";
import { MilestoneData } from "./milestone-card";
import { saveMilestones } from "@/app/actions/milestone";

interface RoadmapSectionProps {
  projectId: string;
  projectStatus: string;
  initialMilestones: MilestoneData[];
}

export function RoadmapSection({
  projectId,
  projectStatus,
  initialMilestones,
}: RoadmapSectionProps) {
  const [milestones, setMilestones] = useState<MilestoneData[]>(initialMilestones);
  const [showGenerator, setShowGenerator] = useState(initialMilestones.length === 0);
  const [isSaving, setIsSaving] = useState(false);

  async function handleGenerated(generatedMilestones: GeneratedMilestone[]) {
    setIsSaving(true);

    // Save to database
    const result = await saveMilestones(projectId, generatedMilestones);

    if (result.error) {
      toast.error("Erreur", { description: result.error });
      setIsSaving(false);
      return;
    }

    // Convert to MilestoneData format with IDs (we need to refetch)
    // For now, use temporary IDs - they'll be replaced on page refresh
    const milestonesWithIds: MilestoneData[] = generatedMilestones.map((m, index) => ({
      id: `temp-${index}-${Date.now()}`,
      title: m.title,
      description: m.description,
      estimatedDuration: m.estimatedDuration,
      order: m.order,
      status: "PENDING",
    }));

    setMilestones(milestonesWithIds);
    setShowGenerator(false);
    setIsSaving(false);

    // Force a page refresh to get real IDs from DB
    window.location.reload();
  }

  function handleReset() {
    setShowGenerator(true);
  }

  if (isSaving) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Sauvegarde en cours...</p>
        </div>
      </div>
    );
  }

  if (showGenerator) {
    return <RoadmapGenerator onGenerated={handleGenerated} />;
  }

  return (
    <RoadmapTimeline
      projectId={projectId}
      projectStatus={projectStatus}
      initialMilestones={milestones}
      onReset={handleReset}
    />
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Clock, Check, X } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MilestoneControls } from "./milestone-controls";
import { cn } from "@/lib/utils";

export type MilestoneData = {
  id: string;
  title: string;
  description: string | null;
  estimatedDuration: string | null;
  order: number;
  status: string;
};

interface MilestoneCardProps {
  milestone: MilestoneData;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (id: string, data: { title?: string; description?: string; estimatedDuration?: string | null }) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  isProjectActive?: boolean;
}

export function MilestoneCard({
  milestone,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onStatusChange,
  isProjectActive = false,
}: MilestoneCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [editTitle, setEditTitle] = useState(milestone.title);
  const [editDescription, setEditDescription] = useState(milestone.description || "");
  const [editDuration, setEditDuration] = useState(milestone.estimatedDuration || "");
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const durationInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [isEditingDescription]);

  useEffect(() => {
    if (isEditingDuration && durationInputRef.current) {
      durationInputRef.current.focus();
      durationInputRef.current.select();
    }
  }, [isEditingDuration]);

  function handleSaveTitle() {
    if (editTitle.trim() && editTitle !== milestone.title) {
      onUpdate(milestone.id, { title: editTitle.trim() });
    } else {
      setEditTitle(milestone.title);
    }
    setIsEditingTitle(false);
  }

  function handleSaveDescription() {
    if (editDescription !== (milestone.description || "")) {
      onUpdate(milestone.id, { description: editDescription });
    }
    setIsEditingDescription(false);
  }

  function handleCancelTitle() {
    setEditTitle(milestone.title);
    setIsEditingTitle(false);
  }

  function handleCancelDescription() {
    setEditDescription(milestone.description || "");
    setIsEditingDescription(false);
  }

  function handleSaveDuration() {
    const newDuration = editDuration.trim() || null;
    if (newDuration !== (milestone.estimatedDuration || null)) {
      onUpdate(milestone.id, { estimatedDuration: newDuration });
    } else {
      setEditDuration(milestone.estimatedDuration || "");
    }
    setIsEditingDuration(false);
  }

  function handleCancelDuration() {
    setEditDuration(milestone.estimatedDuration || "");
    setIsEditingDuration(false);
  }

  const isCompleted = milestone.status === "COMPLETED";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex gap-4",
        isDragging && "z-50 opacity-90"
      )}
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        {/* Top line */}
        <div
          className={cn(
            "w-0.5 flex-1",
            isFirst ? "bg-transparent" : isCompleted ? "bg-primary" : "bg-muted-foreground/30"
          )}
        />
        {/* Circle indicator */}
        <div
          className={cn(
            "w-4 h-4 rounded-full border-2 shrink-0",
            isCompleted
              ? "bg-primary border-primary"
              : "bg-background border-muted-foreground/50"
          )}
        >
          {isCompleted && (
            <Check className="h-3 w-3 text-primary-foreground m-auto" />
          )}
        </div>
        {/* Bottom line */}
        <div
          className={cn(
            "w-0.5 flex-1",
            isLast ? "bg-transparent" : "bg-muted-foreground/30"
          )}
        />
      </div>

      {/* Card content */}
      <Card
        className={cn(
          "flex-1 mb-3 transition-all duration-300",
          isDragging && "shadow-lg ring-2 ring-primary/20 z-50",
          milestone.status === "IN_PROGRESS" && "ring-2 ring-orange-500/40 shadow-orange-500/10 scale-[1.01]",
          milestone.status === "COMPLETED" && "ring-2 ring-green-500/40 shadow-green-500/10 opacity-75"
        )}
      >
        <CardContent className="p-2.5">
          <div className="flex items-start gap-2">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 p-0.5 rounded hover:bg-muted cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
              aria-label="Déplacer le jalon"
            >
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-0.5">
              {/* Title */}
              {isEditingTitle ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    ref={titleInputRef}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTitle();
                      if (e.key === "Escape") handleCancelTitle();
                    }}
                    className="h-6 text-xs font-medium"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 shrink-0"
                    onClick={handleSaveTitle}
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 shrink-0"
                    onClick={handleCancelTitle}
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              ) : (
                <h4
                  className="font-semibold text-xs cursor-pointer hover:text-primary transition-colors truncate"
                  onClick={() => setIsEditingTitle(true)}
                  title="Cliquez pour modifier"
                >
                  {milestone.title}
                </h4>
              )}

              {/* Description */}
              {isEditingDescription ? (
                <div className="space-y-1">
                  <Textarea
                    ref={descriptionInputRef}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") handleCancelDescription();
                    }}
                    className="min-h-[40px] text-xs resize-none"
                    placeholder="Décrivez ce jalon..."
                  />
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={handleSaveDescription} className="h-6 text-xs">
                      <Check className="h-2.5 w-2.5 mr-1" /> OK
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelDescription} className="h-6 text-xs">
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <p
                  className={cn(
                    "text-xs cursor-pointer hover:text-foreground transition-colors line-clamp-1",
                    milestone.description
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50 italic"
                  )}
                  onClick={() => setIsEditingDescription(true)}
                  title="Cliquez pour modifier"
                >
                  {milestone.description || "Ajouter une description..."}
                </p>
              )}

              {/* Duration badge - Editable */}
              {isEditingDuration ? (
                <div className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                  <Input
                    ref={durationInputRef}
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveDuration();
                      if (e.key === "Escape") handleCancelDuration();
                    }}
                    placeholder="ex: 2j, 1w..."
                    className="h-5 text-xs w-20"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 shrink-0"
                    onClick={handleSaveDuration}
                  >
                    <Check className="h-2 w-2 text-green-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 shrink-0"
                    onClick={handleCancelDuration}
                  >
                    <X className="h-2 w-2 text-muted-foreground" />
                  </Button>
                </div>
              ) : (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs cursor-pointer hover:text-foreground transition-colors",
                    milestone.estimatedDuration
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50 italic"
                  )}
                  onClick={() => setIsEditingDuration(true)}
                  title="Cliquez pour modifier"
                >
                  <Clock className="h-2.5 w-2.5 shrink-0" />
                  <span>{milestone.estimatedDuration || "Durée..."}</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isProjectActive ? (
                <MilestoneControls
                  milestoneId={milestone.id}
                  status={milestone.status}
                  isFirst={isFirst}
                  isActive={isProjectActive}
                  onStatusChange={(status) => onStatusChange?.(milestone.id, status)}
                  isProjectActive={isProjectActive}
                />
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(milestone.id)}
                  aria-label="Supprimer le jalon"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

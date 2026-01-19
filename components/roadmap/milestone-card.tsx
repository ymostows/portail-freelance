"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Clock, Check, X } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
}

export function MilestoneCard({
  milestone,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
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
        "relative flex gap-3",
        isDragging && "z-50 opacity-95"
      )}
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center pt-1">
        {/* Top line */}
        <div
          className={cn(
            "w-0.5 flex-1 min-h-3",
            isFirst ? "bg-transparent" : isCompleted ? "bg-primary" : "bg-muted-foreground/20"
          )}
        />
        {/* Circle indicator */}
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
            isCompleted
              ? "bg-primary border-primary shadow-md"
              : isDragging 
                ? "bg-primary/10 border-primary/50 shadow-md"
                : "bg-background border-muted-foreground/40"
          )}
        >
          {isCompleted && (
            <Check className="h-3 w-3 text-primary-foreground" />
          )}
        </div>
        {/* Bottom line */}
        <div
          className={cn(
            "w-0.5 flex-1 min-h-3",
            isLast ? "bg-transparent" : "bg-muted-foreground/20"
          )}
        />
      </div>

      {/* Card content */}
      <Card
        className={cn(
          "flex-1 mb-2 transition-all duration-200 border-l-2",
          isDragging 
            ? "shadow-lg ring-2 ring-primary/30 border-l-primary" 
            : isCompleted
            ? "border-l-primary/50 shadow-sm hover:shadow-md"
            : "border-l-muted-foreground/20 shadow-sm hover:shadow-md hover:border-l-primary/50"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing touch-none transition-colors"
              aria-label="Déplacer le jalon"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/60 hover:text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title */}
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    ref={titleInputRef}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTitle();
                      if (e.key === "Escape") handleCancelTitle();
                    }}
                    className="h-8 text-sm font-semibold"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                    onClick={handleSaveTitle}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={handleCancelTitle}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <h4
                  className={cn(
                    "font-semibold text-sm cursor-pointer transition-colors truncate",
                    isCompleted 
                      ? "text-muted-foreground line-through" 
                      : "hover:text-primary text-foreground"
                  )}
                  onClick={() => setIsEditingTitle(true)}
                  title="Cliquez pour modifier"
                >
                  {milestone.title}
                </h4>
              )}

              {/* Description */}
              {isEditingDescription ? (
                <div className="space-y-2">
                  <Textarea
                    ref={descriptionInputRef}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") handleCancelDescription();
                    }}
                    className="min-h-[60px] text-xs resize-none"
                    placeholder="Décrivez ce jalon..."
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleSaveDescription} className="h-7 text-xs gap-1">
                      <Check className="h-3 w-3" /> Enregistrer
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelDescription} className="h-7 text-xs">
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <p
                  className={cn(
                    "text-xs cursor-pointer transition-colors line-clamp-2",
                    milestone.description
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground/50 italic hover:text-muted-foreground"
                  )}
                  onClick={() => setIsEditingDescription(true)}
                  title="Cliquez pour modifier"
                >
                  {milestone.description || "Ajouter une description..."}
                </p>
              )}

              {/* Duration badge - Editable */}
              {isEditingDuration ? (
                <div className="flex items-center gap-2 pt-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <Input
                    ref={durationInputRef}
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveDuration();
                      if (e.key === "Escape") handleCancelDuration();
                    }}
                    placeholder="ex: 2 jours, 1 semaine..."
                    className="h-7 text-xs w-40"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 shrink-0 text-green-600"
                    onClick={handleSaveDuration}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 shrink-0"
                    onClick={handleCancelDuration}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-xs cursor-pointer transition-colors pt-1",
                    milestone.estimatedDuration
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground/50 italic hover:text-muted-foreground"
                  )}
                  onClick={() => setIsEditingDuration(true)}
                  title="Cliquez pour modifier"
                >
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{milestone.estimatedDuration || "Ajouter une durée..."}</span>
                </div>
              )}
            </div>

            {/* Delete button */}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 transition-colors"
              onClick={() => onDelete(milestone.id)}
              aria-label="Supprimer le jalon"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

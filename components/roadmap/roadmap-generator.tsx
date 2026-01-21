"use client";

import { useState } from "react";
import { Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type GeneratedMilestone = {
  title: string;
  description: string;
  estimatedDuration: string | null;
  order: number;
};

interface RoadmapGeneratorProps {
  onGenerated: (milestones: GeneratedMilestone[]) => void;
}

export function RoadmapGenerator({ onGenerated }: RoadmapGeneratorProps) {
  const [rawText, setRawText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerate() {
    if (rawText.trim().length < 20) {
      toast.error("Texte trop court", {
        description: "Collez au moins quelques phrases pour que l'IA puisse analyser le projet.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la génération");
      }

      if (data.milestones && data.milestones.length > 0) {
        onGenerated(data.milestones);
        toast.success("Plan généré !", {
          description: `${data.milestones.length} jalons ont été créés.`,
        });
      } else {
        toast.error("Aucun jalon généré", {
          description: "L'IA n'a pas pu extraire de jalons. Essayez avec plus de détails.",
        });
      }
    } catch (error) {
      console.error("Erreur génération:", error);
      toast.error("Erreur", {
        description: error instanceof Error ? error.message : "Impossible de générer le plan",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            Génération en cours...
          </CardTitle>
          <CardDescription>
            L&apos;IA analyse votre texte et crée les jalons du projet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Skeleton loader pour les milestones */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 items-start">
              <Skeleton className="h-4 w-4 rounded-full mt-1 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Générer le plan du projet</CardTitle>
          <CardDescription className="text-base mt-2">
            Collez votre cahier des charges, devis ou notes de réunion. L&apos;IA extraira automatiquement les jalons principaux.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Exemple: Le projet consiste en la création d'un site e-commerce avec un catalogue produits, un panier d'achat, un système de paiement Stripe, et un espace client pour le suivi des commandes..."
            className="min-h-[250px] resize-none text-base"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <div className="flex justify-center pt-2">
            <Button 
              onClick={handleGenerate} 
              disabled={rawText.trim().length < 20}
              size="lg"
              className="min-w-[200px]"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Générer le Plan du Projet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

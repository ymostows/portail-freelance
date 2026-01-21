"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  text?: string;
}

export function BackButton({ text = "Retour" }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
    >
      <ArrowLeft className="h-4 w-4 flex-shrink-0" />
      <span>{text}</span>
    </button>
  );
}

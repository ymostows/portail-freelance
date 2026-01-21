import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `Tu es un assistant expert en gestion de projet freelance.
À partir du texte fourni (cahier des charges, devis, notes de réunion), extrait les JALONS LIVRABLES principaux du projet.

RÈGLES IMPORTANTES:
- Chaque jalon doit être une ÉTAPE MAJEURE du projet, PAS une tâche technique granulaire
- Mauvais exemple: "Installer React", "Configurer Tailwind" 
- Bon exemple: "Mise en place de l'architecture Front-end"
- Maximum 8 jalons
- Descriptions courtes (1-2 phrases maximum)
- Estime une durée réaliste pour chaque jalon

Tu DOIS retourner UNIQUEMENT un JSON valide avec ce format exact:
[
  {
    "title": "Titre du jalon",
    "description": "Description courte du livrable",
    "estimatedDuration": "X jours" ou "X semaine(s)"
  }
]

Ne retourne RIEN d'autre que le JSON. Pas de texte avant ou après.`;

export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérification de la clé API OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Configuration IA manquante. Contactez l'administrateur." },
        { status: 500 }
      );
    }

    // Récupération du texte brut
    const body = await request.json();
    const { rawText } = body;

    if (!rawText || typeof rawText !== "string" || rawText.trim().length < 10) {
      return NextResponse.json(
        { error: "Le texte fourni est trop court ou invalide" },
        { status: 400 }
      );
    }

    // Initialiser le client OpenAI au runtime
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Appel à OpenAI GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: rawText },
      ],
      temperature: 0.7,
      max_completion_tokens: 2000,
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      return NextResponse.json(
        { error: "Aucune réponse de l'IA" },
        { status: 500 }
      );
    }

    // Parser le JSON retourné
    let milestones;
    try {
      // Nettoyer la réponse (enlever les backticks markdown si présents)
      const cleanedContent = responseContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      milestones = JSON.parse(cleanedContent);
    } catch {
      console.error("Erreur de parsing JSON:", responseContent);
      return NextResponse.json(
        { error: "Erreur lors du parsing de la réponse IA" },
        { status: 500 }
      );
    }

    // Validation basique de la structure
    if (!Array.isArray(milestones)) {
      return NextResponse.json(
        { error: "Format de réponse invalide" },
        { status: 500 }
      );
    }

    // Ajouter un order à chaque milestone
    const milestonesWithOrder = milestones.map((m, index) => ({
      title: m.title || "Jalon sans titre",
      description: m.description || "",
      estimatedDuration: m.estimatedDuration || null,
      order: index,
    }));

    return NextResponse.json({ milestones: milestonesWithOrder });
  } catch (error) {
    console.error("Erreur generate-roadmap:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la génération" },
      { status: 500 }
    );
  }
}

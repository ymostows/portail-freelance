import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AcceptInvitationButton } from "@/components/invite/accept-invitation-button";
import { CheckCircle2, XCircle, User, Clock, Briefcase } from "lucide-react";

interface InvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  // Vérifier si l'utilisateur est connecté
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Chercher l'invitation
  const invitation = await prisma.projectInvitation.findUnique({
    where: { token },
    include: {
      project: {
        include: {
          freelancer: true
        }
      }
    }
  });

  // Token invalide
  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="mt-4 text-2xl">Invitation invalide</CardTitle>
            <CardDescription>Ce lien d&apos;invitation n&apos;existe pas ou a été supprimé.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="outline" asChild>
              <Link href="/">Retour à l&apos;accueil</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isExpired = new Date() > new Date(invitation.expiresAt);

  // Token expiré
  if (isExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <CardTitle className="mt-4 text-2xl">Invitation expirée</CardTitle>
            <CardDescription>
              Cette invitation a expiré. Contactez{" "}
              <span className="font-medium">{invitation.project.freelancer.name || "le freelance"}</span>{" "}
              pour en recevoir une nouvelle.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="outline" asChild>
              <Link href="/">Retour à l&apos;accueil</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const freelancerInitial = invitation.project.freelancer.name?.[0]?.toUpperCase() || "F";

  // Invitation valide
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <Badge variant="secondary" className="mx-auto mb-2">
            Invitation projet
          </Badge>
          <CardTitle className="text-2xl">
            Vous êtes invité !
          </CardTitle>
          <CardDescription>
            Rejoignez ce projet pour collaborer avec le freelance
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Détails du projet */}
          <div className="rounded-lg bg-gray-50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projet</p>
                <p className="font-semibold">{invitation.project.name}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {freelancerInitial}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">Invité par</p>
                <p className="font-medium">
                  {invitation.project.freelancer.name || invitation.project.freelancer.email}
                </p>
              </div>
            </div>
          </div>

          {/* Actions selon l'état de connexion */}
          {user ? (
            // Utilisateur connecté → Accepter directement
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <User className="h-5 w-5 text-blue-600" />
                <div className="text-sm">
                  <p className="text-blue-800">Connecté en tant que</p>
                  <p className="font-medium text-blue-900">{user.email}</p>
                </div>
              </div>

              <AcceptInvitationButton
                token={token}
                projectName={invitation.project.name}
              />

              <p className="text-xs text-center text-muted-foreground">
                Pas le bon compte ?{" "}
                <Link href={`/login?invite=${token}`} className="underline hover:text-primary">
                  Changer de compte
                </Link>
              </p>
            </div>
          ) : (
            // Non connecté → Créer compte ou se connecter
            <div className="space-y-3">
              <Button className="w-full" size="lg" asChild>
                <Link href={`/register?invite=${token}`}>
                  Créer mon compte Client
                </Link>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/login?invite=${token}`}>
                  J&apos;ai déjà un compte
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
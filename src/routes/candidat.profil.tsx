import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, FileEdit, GraduationCap, Loader2, User } from "lucide-react";
import { PageHeader } from "@/components/layout/SpaceLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  candidateProfileService,
  type CandidateProfileResponse,
} from "@/services/candidate-profile-service";

export const Route = createFileRoute("/candidat/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil candidat — MasterTN" },
      {
        name: "description",
        content: "Vos informations personnelles, académiques, votre diplôme et vos justificatifs.",
      },
      { property: "og:title", content: "Mon profil candidat — MasterTN" },
      { property: "og:description", content: "Récapitulatif complet de votre dossier candidat." },
    ],
  }),
  component: MonProfil,
});

function MonProfil() {
  const [profile, setProfile] = useState<CandidateProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadProfile() {
      try {
        const data = await candidateProfileService.getMyProfile();
        if (!isCancelled) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Erreur chargement profil:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto flex h-48 max-w-4xl items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Chargement de votre profil…</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <PageHeader title="Mon profil" subtitle="Informations transmises avec chaque candidature." />
        <Card className="border-border/70 shadow-none">
          <CardContent className="p-8 text-center text-sm text-muted-foreground space-y-3">
            <p>Aucun profil candidat n'a encore été associé à votre compte.</p>
            <Button asChild>
              <Link to="/profil/creer">Créer mon profil candidat</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isRevision = profile.statut === "A_REVISER";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Mon profil"
        subtitle="Informations transmises avec chaque candidature."
        action={<StatusBadge statut={profile.statut} />}
      />

      {isRevision ? (
        <Card className="border-amber-500/40 bg-amber-500/10 shadow-sm">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
            <div className="flex items-start gap-3">
              <FileEdit className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  Demande de révision en cours
                </p>
                <p className="text-xs text-amber-700/90 dark:text-amber-300">
                  Le coordinateur a demandé des corrections ou pièces complémentaires sur votre dossier.
                </p>
              </div>
            </div>
            {profile.onboarding_token ? (
              <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
                <Link to="/profil/creer" search={{ token: profile.onboarding_token }}>
                  Corriger mon dossier
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-6">
        <Card className="border-border/70 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-primary" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
            <Ligne label="Nom" value={profile.nom} />
            <Ligne label="Prénom" value={profile.prenom} />
            <Ligne label="CIN" value={profile.cin} />
            <Ligne label="Email" value={profile.email} />
            <Ligne label="Téléphone" value={profile.telephone} />
            <Ligne label="Ville" value={profile.ville} />
            <Ligne label="Nationalité" value={profile.nationalite} />
            <Ligne label="Année de naissance" value={profile.annee_naissance ? String(profile.annee_naissance) : "—"} />
          </CardContent>
        </Card>

        {profile.licence_years && profile.licence_years.length > 0 ? (
          <Card className="border-border/70 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4 text-primary" />
                Parcours académique & Licence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-3">
                {profile.licence_years
                  .slice()
                  .sort((a, b) => a.annee - b.annee)
                  .map((ly) => (
                    <div key={ly.pubkey || ly.annee} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Licence {ly.annee} ({ly.annee_universitaire})
                      </p>
                      <p className="mt-1 font-bold">
                        {Number(ly.moyenne).toFixed(2)} <span className="text-xs font-normal text-muted-foreground">/ 20</span>
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function Ligne({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value || "—"}</p>
    </div>
  );
}

import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, KeyRound, Loader, ShieldAlert, Sparkles } from "lucide-react";
import { authService } from "@/services/auth-service";

const activateSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
      .regex(/[a-zA-Z]/, "Le mot de passe doit contenir au moins une lettre"),
    confirmPassword: z.string().min(8, "Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les deux mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type ActivateFormValues = z.infer<typeof activateSchema>;

interface ActiverCompteSearchParams {
  token?: string | undefined;
}

export const Route = createFileRoute("/activer-compte")({
  validateSearch: (search: Record<string, unknown>): ActiverCompteSearchParams => {
    return {
      token: typeof search["token"] === "string" ? search["token"] : undefined,
    };
  },
  component: ActiverComptePage,

  head: () => ({
    meta: [
      { title: "Activation de compte — MasterTN" },
      { name: "description", content: "Activez votre compte candidat MasterTN et choisissez votre mot de passe." },
    ],
  }),
});

function ActiverComptePage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/activer-compte" });
  const token = search.token;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ActivateFormValues>({
    resolver: zodResolver(activateSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ActivateFormValues) => {
    if (!token) {
      setError("Jeton d'activation manquant. Veuillez utiliser le lien reçu par email.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await authService.activateAccount({
        token,
        password: values.password,
        confirm_password: values.confirmPassword,
      });
      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Échec de l'activation du compte. Le lien est peut-être expiré ou a déjà été utilisé."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-border/60">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Activation de votre compte</CardTitle>
          <CardDescription>
            Votre dossier a été validé ! Définissez dès maintenant votre mot de passe pour accéder à votre espace candidat.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!token ? (
            <Alert variant="destructive" className="space-y-2">
              <ShieldAlert className="h-5 w-5" />
              <AlertTitle>Lien d'activation manquant</AlertTitle>
              <AlertDescription>
                Aucun jeton d'activation n'a été trouvé dans l'URL. Veuillez cliquer directement sur le lien fourni dans l'email de validation que vous avez reçu.
              </AlertDescription>
            </Alert>
          ) : isSuccess ? (
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Compte activé avec succès !</h3>
                <p className="text-sm text-muted-foreground">
                  Votre mot de passe est enregistré. Vous pouvez dès à présent vous connecter pour suivre vos candidatures et consulter les offres de Mastère.
                </p>
              </div>
              <Button
                onClick={() => navigate({ to: "/login" })}
                className="w-full bg-primary hover:bg-primary/90 font-medium"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Aller à la page de connexion
              </Button>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nouveau mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type="password"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type="password"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-1">
                    <p className="font-semibold text-foreground">Critères de sécurité :</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Au moins 8 caractères</li>
                      <li>Au moins une lettre et un chiffre</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Activation en cours..." : "Activer mon compte"}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

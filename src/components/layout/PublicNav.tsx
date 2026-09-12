import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useStore } from "@/lib/app-store";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/masters", label: "Masters" },
  { to: "/assistant", label: "Assistant IA" },
] as const;

export function PublicNav() {
  const { role } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:flex sm:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg leading-tight">MasterTN</span>
            <span className="block truncate text-[11px] uppercase tracking-widest text-muted-foreground">
              Candidatures Masters
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                pathname === l.to && "bg-secondary text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
          {role === "candidat" ? (
            <Button asChild size="sm" className="ml-2">
              <Link to="/candidat">Espace candidat</Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="ml-2">
              <Link to="/profil/creer">Créer mon profil</Link>
            </Button>
          )}
          <Button asChild size="sm" variant="outline" className="ml-2 border-accent/50 text-accent hover:bg-accent/10">
            <Link to="/login">Connexion</Link>
          </Button>
        </nav>

        <Sheet>
          <SheetTrigger asChild className="sm:hidden">
            <Button variant="outline" size="icon" aria-label="Ouvrir le menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-6">
            <nav className="mt-6 flex flex-col gap-2">
              {LINKS.map((l) => (
                <Link key={l.to} to={l.to} className="rounded-md px-3 py-2 text-sm hover:bg-secondary">
                  {l.label}
                </Link>
              ))}
              <Link
                to={role === "candidat" ? "/candidat" : "/profil/creer"}
                className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
              >
                {role === "candidat" ? "Espace candidat" : "Créer mon profil"}
              </Link>
              <Link to="/login" className="rounded-md border border-accent/50 px-3 py-2 text-sm text-accent hover:bg-accent/10">
                Connexion
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

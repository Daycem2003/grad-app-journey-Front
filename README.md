# Master Bridge

Projet : Plateforme de gestion des candidatures aux Masters

Je veux créer le frontend complet uniquement d’une plateforme web de gestion des candidatures aux Masters universitaires en Tunisie.

1. Objectif général

Créer une interface moderne, professionnelle, responsive et cohérente permettant de gérer tout le cycle de candidature :

consultation des Masters

création d’un profil candidat

consultation des critères d’éligibilité

dépôt d’une candidature

vérification des dossiers

gestion des candidatures par les coordinateurs

gestion des dates et des résultats par l’administration

statistiques et tableaux de bord

Important

Pour cette première version :

Générer uniquement le frontend.

Ne pas créer de véritable système d’authentification.

Ne pas demander d’email ou de mot de passe.

Utiliser uniquement des données mockées.

Toutes les actions doivent fonctionner visuellement côté frontend.

Simuler les changements d’état avec des données locales/mockées.

Les fichiers peuvent être représentés par des composants d’upload fictifs.

Les emails et notifications doivent être simulés par des modals/toasts.

Prévoir une architecture frontend facilement connectable plus tard à une API Django/FastAPI.

2. Page d’entrée / Login de démonstration

La première page est une page de sélection du profil.

Il n’y a ni email ni mot de passe.

Afficher quatre grands boutons/cartes :

Guest

« Consulter les Masters »

Candidat

« Espace Candidat »

Coordinateur

« Espace Coordinateur »

Administrateur

« Espace Administrateur »

Chaque bouton redirige vers l’interface correspondante.

La page doit être élégante et professionnelle, avec un branding universitaire.

3. SESSION GUEST

Le Guest représente un visiteur qui n’a pas encore créé de profil candidat.

3.1 Page d’accueil

Afficher :

navbar

logo de la plateforme

bouton « Accueil »

bouton « Masters »

bouton « Assistant IA »

bouton « Créer mon profil »

Afficher également une section hero expliquant la plateforme.

4. Consultation des Masters

Créer une page « Masters disponibles ».

Afficher les Masters sous forme de cards.

Chaque Master doit afficher :

nom du Master

université / établissement

faculté

ville

description courte

nombre de places

période de candidature

statut :

Ouvert

Fermé

À venir

bouton « Voir les détails »

Ajouter une barre de recherche.

Ajouter des filtres :

université

ville

domaine

statut

nombre de places

5. Page détail d’un Master

Lorsqu’on clique sur « Voir les détails », afficher une page détaillée.

Sections :

Informations générales

nom

université

établissement

ville

description

Conditions d’éligibilité

Afficher clairement les critères.

Exemples :

diplôme requis

année d’obtention

moyenne minimale

nombre maximum d’années de redoublement

autres critères

Formule de score

Afficher la formule de manière lisible.

Exemple :

Score = 40% moyenne L1 + 30% moyenne L2 + 30% moyenne L3

Documents demandés

Afficher les documents nécessaires.

Dates

début des candidatures

date limite

Candidature

IMPORTANT :

Pour un Guest, ne pas afficher le bouton « Postuler ».

Afficher à la place :

« Créez votre profil candidat pour pouvoir postuler. »

Bouton :

« Créer mon profil candidat »

6. Assistant IA

Le Guest doit pouvoir discuter avec un assistant IA pour obtenir des informations sur les Masters.

Créer une interface de chatbot moderne.

Le chatbot doit permettre :

questions/réponses

historique de conversation

champ de saisie

bouton envoyer

réponses simulées par des données mockées

Exemples de questions :

« Quels Masters sont disponibles ? »

« Suis-je éligible à ce Master ? »

« Quels documents dois-je préparer ? »

« Quelle est la date limite ? »

« Comment est calculé le score ? »

Créer une interface ressemblant à un véritable chatbot moderne.

Prévoir une architecture frontend permettant de remplacer facilement les réponses mockées par une API IA plus tard.

7. Création du profil candidat

Le Guest peut créer son profil candidat.

Créer un formulaire multi-étapes avec une progression visuelle.

Étape 1 — Informations personnelles

Champs :

Nom

Prénom

CIN

Email

Numéro de téléphone

Ville

La ville doit être sélectionnable parmi les villes tunisiennes.

Exemples :

Tunis

Sousse

Sfax

Monastir

Mahdia

Nabeul

Bizerte

Gabès

Kairouan

Gafsa

Tozeur

Djerba / Médenine

Béja

Jendouba

Le Kef

Siliana

Zaghouan

Kasserine

Tataouine

Année de naissance

8. Informations académiques

Le candidat doit renseigner ses trois années de Licence.

Créer trois sections distinctes :

Licence 1

année universitaire

moyenne générale

bouton pour joindre le relevé de notes

Licence 2

année universitaire

moyenne générale

bouton pour joindre le relevé de notes

Licence 3

année universitaire

moyenne générale

bouton pour joindre le relevé de notes

Pour chaque année, le relevé de notes doit être attaché.

Afficher visuellement les fichiers uploadés.

Exemple :

✓ Releve_L1.pdf
✓ Releve_L2.pdf
✓ Releve_L3.pdf

9. Diplôme de Licence

Créer une section :

année universitaire d’obtention du diplôme

université d’obtention

diplôme de Licence au format PDF

Afficher un composant d’upload professionnel.

10. Redoublement

Question :

« Avez-vous redoublé une année ? »

Utiliser des boutons radio :

○ Oui
○ Non

Si « Non » :

ne rien afficher d’autre.

Si « Oui » :

faire apparaître dynamiquement :

« Quelle(s) année(s) avez-vous redoublée(s) ? »

Checkboxes :

□ Licence 1
□ Licence 2
□ Licence 3

Le candidat peut sélectionner plusieurs années.

Pour chaque année sélectionnée, afficher dynamiquement une zone permettant d’ajouter un ou plusieurs justificatifs PDF.

Exemple :

Licence 1

✓ justificatif_redoublement_L1.pdf

Ajouter un autre document

Licence 3

✓ justificatif_1.pdf
✓ justificatif_2.pdf

Ajouter un autre document

IMPORTANT :

Une seule année peut avoir plusieurs fichiers.

11. Validation du profil

Avant la validation finale, afficher une page récapitulative.

Sections :

informations personnelles

informations académiques

documents

redoublements

justificatifs

Afficher les erreurs éventuelles.

Bouton :

« Créer mon profil candidat »

Après validation :

Afficher une notification :

« Profil candidat créé avec succès. »

Puis rediriger vers l’espace candidat.

12. SESSION CANDIDAT

Une fois le profil créé, le candidat accède à son espace.

Créer une sidebar :

Dashboard

Mon profil

Masters disponibles

Mes candidatures

Notifications

Assistant IA

13. Dashboard candidat

Afficher :

nom du candidat

statut du profil

nombre de Masters disponibles

nombre de candidatures

candidatures en cours

candidatures approuvées

candidatures à réviser

Afficher une section :

« Masters recommandés / disponibles »

14. Candidature à un Master

Une fois connecté en tant que candidat, le bouton :

« Postuler »

doit maintenant apparaître sur les Masters.

Lorsqu’il clique sur « Postuler » :

Afficher une page/modal de confirmation contenant :

Master choisi

informations du candidat

documents disponibles

critères d’éligibilité

Bouton :

« Soumettre ma candidature »

Après soumission :

Afficher :

« Candidature soumise avec succès. »

15. Mes candidatures

Créer une page contenant un tableau.

Colonnes :

Master

Date de candidature

Score

Statut

Dernière mise à jour

Actions

Statuts possibles :

Soumise

À réviser

Approuvée

Rejetée

Afficher les statuts avec des badges visuels.

16. SESSION COORDINATEUR

Créer un espace spécifique pour le coordinateur.

Sidebar :

Dashboard

Mes Masters

Appels à candidature

Candidatures

Candidatures à réviser

Notifications

17. Création d’un appel à candidature

Le coordinateur peut créer un appel pour un Master.

Formulaire :

Informations du Master

Master

description

nombre de places

date de début

date de fin

Critères d’éligibilité

Permettre de saisir plusieurs critères.

Exemples :

moyenne minimale

diplôme requis

année d'obtention

université

nombre maximum de redoublements

autres conditions

Créer une interface permettant d'ajouter/supprimer dynamiquement des critères.

18. Formule de calcul du score

Le coordinateur doit pouvoir définir la formule de score.

IMPORTANT :

Le score n'est pas calculé par l'IA.

Le système applique une formule déterministe définie par le coordinateur.

Créer une interface permettant de définir par exemple :

Moyenne L1 → 30%

Moyenne L2 → 30%

Moyenne L3 → 40%

Afficher :

« Total : 100% »

La formule doit être configurable visuellement.

Exemple :

Score = L1 × 30% + L2 × 30% + L3 × 40%

Prévoir cette interface pour pouvoir connecter plus tard la formule à un backend.

19. Gestion des candidatures coordinateur

Créer une page « Candidatures ».

Afficher les candidatures dans un tableau.

Colonnes :

candidat

CIN

Master

date

score

statut

actions

Filtres :

Master

statut

score

date

candidat

Actions :

« Consulter »

20. Dossier d’une candidature

Créer une page détaillée d’un candidat.

Afficher :

Informations personnelles

nom

prénom

CIN

email

téléphone

ville

année de naissance

Informations académiques

L1

L2

L3

moyennes

relevés de notes

Diplôme

université

année d’obtention

diplôme PDF

Redoublements

Afficher les années concernées et leurs justificatifs.

Score

Afficher :

score total

détail du calcul

formule appliquée

Documents

Afficher tous les documents avec :

nom

type

statut

bouton « Consulter »

21. Changement du statut d’une candidature

Le coordinateur peut modifier le statut :

À réviser

Rejetée

Approuvée

Afficher une confirmation avant changement.

22. Notification d’un candidat

Si une candidature est « À réviser », afficher le bouton :

« Notifier le candidat »

Lorsqu’il clique :

ouvrir une modal.

Étape 1 : choisir le motif

Radio buttons :

○ Document manquant
○ Document frauduleux ou incorrect

Si document manquant

Afficher :

« Quel document manque ? »

Liste :

Relevé de notes

Diplôme de Licence

Justificatif de redoublement

Autre

Si document frauduleux ou incorrect

Afficher :

« Quel document est concerné ? »

Liste similaire.

Après sélection :

Afficher automatiquement un corps de mail générique correspondant au motif.

Exemple conceptuel :

Objet :
« Document manquant — Candidature Master »

Corps :
message générique expliquant au candidat qu’un document doit être fourni.

Le coordinateur peut voir/modifier le contenu avant l’envoi.

Boutons :

« Annuler »

« Envoyer la notification »

Après envoi :

Toast :

« Notification envoyée au candidat. »

23. SESSION ADMINISTRATEUR

Créer un espace administrateur.

Sidebar :

Dashboard

Gestion des candidatures

Calendrier

Liste finale

Statistiques

Paramètres

24. Gestion des dates

L’administrateur peut configurer :

début des candidatures

date limite de candidature

Créer un calendrier visuel.

Afficher clairement :

« Période de candidature »

avec :

date de début

date de fin

statut actuel

25. Génération de la liste finale

L’administrateur doit pouvoir générer la liste des candidats qui doivent déposer leur dossier papier à la faculté.

Exemple de scénario :

1000 candidatures

40 places disponibles

Les 120 premiers candidats selon le classement final sont sélectionnés pour déposer leur dossier papier.

Créer une interface affichant :

nombre total de candidatures

nombre de places

nombre de candidats convoqués

seuil de sélection

Exemple :

1000 candidats
40 places
120 dossiers à déposer

Afficher un tableau :

RangCandidatMasterScoreStatut

Mettre visuellement en évidence les 120 premiers.

Boutons :

« Générer la liste »

« Exporter »

« Notifier les candidats »

26. Notification des 120 candidats

L’administrateur peut cliquer sur :

« Notifier les candidats sélectionnés »

Afficher une confirmation :

« 120 candidats seront notifiés par email. »

Bouton :

« Confirmer »

Après confirmation :

Afficher un toast :

« Les candidats sélectionnés ont été notifiés. »

27. Dashboard statistique administrateur

Créer un dashboard moderne avec graphiques.

Statistiques globales

Cards :

Nombre total de candidatures

Nombre de candidats

Nombre de Masters

Nombre de candidatures cette année

Nombre de candidats sélectionnés

Répartition géographique

Créer un graphique montrant :

« Quelles régions/villes tunisiennes postulent le plus ? »

Exemple :

Tunis
Sousse
Sfax
Monastir
Nabeul
etc.

Utiliser un graphique adapté.

Évolution des candidatures

Créer un graphique montrant l’évolution du nombre de candidatures pour un Master durant les 5 dernières années.

Ajouter un select :

« Sélectionner un Master »

Puis afficher :

2022 → X candidatures
2023 → X candidatures
2024 → X candidatures
2025 → X candidatures
2026 → X candidatures

28. Design UI/UX

Le design doit être :

moderne

professionnel

universitaire

sobre

responsive

accessible

Utiliser :

sidebar pour les espaces internes

navbar pour les pages publiques

cards

tables

badges

modals

dropdowns

tabs

progress bars

charts

notifications/toasts

breadcrumbs

Utiliser une hiérarchie visuelle claire.

Le design doit fonctionner correctement sur :

Desktop

Tablet

Mobile

29. Navigation et logique des profils

IMPORTANT :

Le frontend doit simuler les quatre profils.

Guest

Peut :

consulter les Masters

consulter les détails

utiliser l’assistant IA

créer son profil

Ne peut PAS :

voir « Postuler »

Candidat

Après création du profil :

voit « Postuler »

peut soumettre une candidature

voit ses candidatures

voit leurs statuts

Coordinateur

Peut :

créer les appels

définir les critères

définir la formule de score

consulter les candidatures

changer les statuts

notifier les candidats

Administrateur

Peut :

gérer les dates

générer la liste finale

sélectionner les candidats à convoquer

notifier les candidats

consulter les statistiques

30. Mock data

Créer suffisamment de données fictives réalistes pour rendre l'application immédiatement navigable.

Créer par exemple :

8 Masters

20 candidats

plusieurs candidatures

plusieurs statuts

plusieurs villes tunisiennes

plusieurs années universitaires

différentes moyennes

plusieurs documents fictifs

Les données doivent permettre de tester tous les écrans.

31. Architecture frontend

Organiser le frontend de manière propre et maintenable.

Prévoir une séparation logique :

pages publiques

pages Guest

pages candidat

pages coordinateur

pages administrateur

composants réutilisables

composants de formulaires

composants de tableaux

composants de modals

composants de graphiques

mock data

services/API abstraits

Même si le backend n'existe pas encore, structurer le code afin qu'une future API REST puisse être intégrée facilement.

32. Important : ne pas implémenter l'IA métier

L'intelligence artificielle ne doit PAS :

décider de l'éligibilité

calculer le score

classer arbitrairement les candidats

Les critères d'éligibilité et les formules de score sont déterministes et configurés par le coordinateur.

L'IA est uniquement utilisée ici comme assistant conversationnel d'information.

33. Résultat attendu

Je veux obtenir une démo frontend complète et navigable de cette plateforme.

Le parcours principal doit être testable de bout en bout :

Login de démonstration
→ Guest
→ Consultation Masters
→ Création profil
→ Passage à Candidat
→ Postulation
→ Consultation candidature

Et séparément :

Login
→ Coordinateur
→ Création appel
→ Consultation candidature
→ Révision
→ Notification

Et :

Login
→ Administrateur
→ Configuration dates
→ Génération liste des 120 candidats
→ Notification
→ Dashboard statistiques

Ne génère pas de backend réel pour le moment.

Priorité absolue : qualité de l'interface, navigation, UX, cohérence visuelle et simulation réaliste des workflows.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

import type { Candidat, Candidature, Notification } from "./types";

export const VILLES_TUNISIENNES = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Sousse",
  "Sfax",
  "Monastir",
  "Mahdia",
  "Nabeul",
  "Bizerte",
  "Gabès",
  "Kairouan",
  "Gafsa",
  "Médenine / Djerba",
  "Béja",
  "Jendouba",
  "Le Kef",
  "Siliana",
  "Zaghouan",
  "Kasserine",
  "Tataouine",
];

export const UNIVERSITES = [
  "Université de Tunis El Manar",
  "Université de Sousse",
  "Université de Sfax",
  "Université de Monastir",
  "Université de Carthage",
  "Université de Gabès",
];

export const DOMAINES = [
  "Informatique",
  "Gestion",
  "Génie",
  "Sciences",
  "Droit",
  "Santé",
];

export const DOCUMENTS_TYPES = [
  "Relevé de notes",
  "Diplôme de Licence",
  "Justificatif de redoublement",
  "Autre",
];

// NOTE : la liste des Masters ("MASTERS") a été retirée de ce fichier.
// Les Masters proviennent désormais exclusivement de l'API backend
// (GET /api/v1/masters/, alimentée par la commande de seed Django),
// via src/services/masters-service.ts. Ne pas réintroduire de liste
// statique de Masters ici.

const PRENOMS = [
  "Amine", "Sarra", "Yassine", "Ines", "Mohamed", "Nour", "Oussama", "Rania",
  "Hamza", "Emna", "Bilel", "Syrine", "Karim", "Maryem", "Slim", "Farah",
  "Anis", "Dorra", "Wael", "Hiba",
];
const NOMS = [
  "Ben Salah", "Trabelsi", "Gharbi", "Jlassi", "Mahjoub", "Bouazizi", "Chaabane",
  "Hammami", "Zouari", "Khelifi", "Rekik", "Mejri", "Belhaj", "Sassi", "Ayari",
  "Dridi", "Ferchichi", "Nasri", "Ouled Ali", "Baccouche",
];

export const CANDIDATS: Candidat[] = PRENOMS.map((prenom, i) => {
  const ville = VILLES_TUNISIENNES[i % VILLES_TUNISIENNES.length]!;
  const moy = (10 + ((i * 7) % 90) / 10).toFixed(2);
  const moy2 = (10.5 + ((i * 11) % 85) / 10).toFixed(2);
  const moy3 = (11 + ((i * 13) % 80) / 10).toFixed(2);
  const aRedouble = i % 4 === 0;
  return {
    id: `c${i + 1}`,
    nom: NOMS[i]!,
    prenom,
    cin: `${1000000 + i * 4321}`,
    email: `${prenom.toLowerCase()}.${NOMS[i]!.toLowerCase().replace(/\s/g, "")}@email.tn`,
    telephone: `+216 ${20 + (i % 70)} ${100 + i} ${200 + i}`,
    ville,
    anneeNaissance: `${1998 + (i % 5)}`,
    l1: { anneeUniversitaire: "2020/2021", moyenne: moy, releve: "Releve_L1.pdf" },
    l2: { anneeUniversitaire: "2021/2022", moyenne: moy2, releve: "Releve_L2.pdf" },
    l3: { anneeUniversitaire: "2022/2023", moyenne: moy3, releve: "Releve_L3.pdf" },
    diplome: {
      annee: "2023",
      universite: UNIVERSITES[i % UNIVERSITES.length]!,
      fichier: "Diplome_Licence.pdf",
    },
    aRedouble,
    redoublements: aRedouble
      ? [{ annee: "Licence 2", justificatifs: ["justificatif_redoublement_L2.pdf"] }]
      : [],
  };
});

const STATUTS: Candidature["statut"][] = ["Soumise", "À réviser", "Approuvée", "Rejetée"];

// NOTE : ces candidatures mockées référencent encore des masterId fictifs
// ("mock-master-1"...) qui ne correspondent à AUCUN pubkey réel renvoyé par
// GET /api/v1/masters/. Tant qu'un endpoint /applications réel n'est pas
// branché, les candidatures affichées pour un vrai Master resteront à 0.
const MOCK_MASTER_IDS = [
  "mock-master-1", "mock-master-2", "mock-master-3", "mock-master-4",
  "mock-master-5", "mock-master-6", "mock-master-7", "mock-master-8",
];

export const CANDIDATURES: Candidature[] = CANDIDATS.flatMap((candidat, i) => {
  const masterIds = [
    MOCK_MASTER_IDS[i % MOCK_MASTER_IDS.length]!,
    MOCK_MASTER_IDS[(i + 3) % MOCK_MASTER_IDS.length]!,
  ];
  return masterIds.slice(0, 1 + (i % 2)).map((masterId, j) => ({
    id: `a${i + 1}-${j + 1}`,
    candidatId: candidat.id,
    masterId,
    date: `2026-07-${String(2 + ((i + j) % 26)).padStart(2, "0")}`,
    score: Number((10 + ((i + j * 7) % 90) / 10).toFixed(2)),
    statut: STATUTS[(i + j) % STATUTS.length]!,
    majLe: `2026-07-${String(5 + ((i + j) % 24)).padStart(2, "0")}`,
  }));
});

export const EVOLUTION_CANDIDATURES: Record<string, { annee: string; total: number }[]> =
  Object.fromEntries(
    MOCK_MASTER_IDS.map((id, i) => [
      id,
      ["2022", "2023", "2024", "2025", "2026"].map((annee, j) => ({
        annee,
        total: 120 + i * 25 + j * (40 + i * 3),
      })),
    ]),
  );

export const REPARTITION_VILLES = [
  { ville: "Tunis", total: 264 },
  { ville: "Sfax", total: 188 },
  { ville: "Sousse", total: 152 },
  { ville: "Monastir", total: 121 },
  { ville: "Nabeul", total: 96 },
  { ville: "Bizerte", total: 74 },
  { ville: "Gabès", total: 58 },
  { ville: "Kairouan", total: 47 },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    destinataire: "Candidat",
    objet: "Ouverture des candidatures",
    message:
      "Les candidatures aux Masters de la session 2026 sont ouvertes jusqu'au 31 août 2026.",
    date: "2026-07-01",
    lu: false,
  },
  {
    id: "n2",
    destinataire: "Candidat",
    objet: "Document manquant — Candidature Master",
    message:
      "Votre dossier est incomplet : le relevé de notes de Licence 2 n'a pas été trouvé. Merci de le déposer avant la date limite.",
    date: "2026-07-12",
    lu: false,
  },
  {
    id: "n3",
    destinataire: "Coordinateur",
    objet: "Nouvelles candidatures reçues",
    message: "12 nouvelles candidatures ont été déposées sur vos Masters cette semaine.",
    date: "2026-07-15",
    lu: true,
  },
];
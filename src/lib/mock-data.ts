import type { Candidat, Candidature, Master, Notification } from "./types";

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

export const MASTERS: Master[] = [
  {
    id: "m1",
    nom: "Master Recherche en Intelligence Artificielle",
    universite: "Université de Tunis El Manar",
    etablissement: "Faculté des Sciences de Tunis",
    ville: "Tunis",
    domaine: "Informatique",
    descriptionCourte:
      "Formation orientée recherche en apprentissage automatique, vision et NLP.",
    description:
      "Ce master forme des chercheurs et ingénieurs capables de concevoir des systèmes intelligents. Le cursus couvre l'apprentissage automatique, l'optimisation, la vision par ordinateur et le traitement du langage naturel, avec un mémoire de recherche en seconde année.",
    places: 40,
    dateDebut: "2026-07-01",
    dateFin: "2026-08-31",
    statut: "Ouvert",
    criteres: [
      { id: "c1", libelle: "Diplôme requis", valeur: "Licence en Informatique" },
      { id: "c2", libelle: "Année d'obtention", valeur: "2022 ou plus récent" },
      { id: "c3", libelle: "Moyenne minimale", valeur: "12.00 / 20" },
      { id: "c4", libelle: "Redoublements maximum", valeur: "1 année" },
    ],
    ponderation: { l1: 30, l2: 30, l3: 40 },
    documents: [
      "Relevés de notes L1, L2, L3",
      "Diplôme de Licence (PDF)",
      "Copie de la CIN",
      "Justificatifs de redoublement (le cas échéant)",
    ],
  },
  {
    id: "m2",
    nom: "Master Professionnel en Cybersécurité",
    universite: "Université de Carthage",
    etablissement: "École Nationale d'Ingénieurs de Carthage",
    ville: "Ariana",
    domaine: "Informatique",
    descriptionCourte: "Sécurité des systèmes, audit et réponse aux incidents.",
    description:
      "Formation professionnalisante axée sur la sécurité offensive et défensive, la cryptographie appliquée, la gouvernance et la conformité, avec un stage obligatoire de six mois en entreprise.",
    places: 30,
    dateDebut: "2026-07-10",
    dateFin: "2026-09-05",
    statut: "Ouvert",
    criteres: [
      { id: "c1", libelle: "Diplôme requis", valeur: "Licence en Informatique ou Télécoms" },
      { id: "c2", libelle: "Moyenne minimale", valeur: "11.50 / 20" },
      { id: "c3", libelle: "Redoublements maximum", valeur: "1 année" },
    ],
    ponderation: { l1: 20, l2: 30, l3: 50 },
    documents: ["Relevés de notes L1, L2, L3", "Diplôme de Licence (PDF)", "CV"],
  },
  {
    id: "m3",
    nom: "Master en Data Science & Business Analytics",
    universite: "Université de Sousse",
    etablissement: "Institut Supérieur de Gestion de Sousse",
    ville: "Sousse",
    domaine: "Gestion",
    descriptionCourte: "Analyse de données appliquée à la décision d'entreprise.",
    description:
      "Le master combine statistiques, informatique décisionnelle et management afin de former des analystes capables de piloter des projets data en entreprise.",
    places: 35,
    dateDebut: "2026-06-15",
    dateFin: "2026-08-20",
    statut: "Ouvert",
    criteres: [
      { id: "c1", libelle: "Diplôme requis", valeur: "Licence en Gestion, Économie ou Informatique" },
      { id: "c2", libelle: "Moyenne minimale", valeur: "11.00 / 20" },
    ],
    ponderation: { l1: 30, l2: 30, l3: 40 },
    documents: ["Relevés de notes L1, L2, L3", "Diplôme de Licence (PDF)"],
  },
  {
    id: "m4",
    nom: "Master en Génie Logiciel et Systèmes d'Information",
    universite: "Université de Sfax",
    etablissement: "Faculté des Sciences Économiques et de Gestion de Sfax",
    ville: "Sfax",
    domaine: "Informatique",
    descriptionCourte: "Architecture logicielle, DevOps et ingénierie des SI.",
    description:
      "Cursus centré sur la conception d'applications d'entreprise, les architectures distribuées, la qualité logicielle et la conduite de projets informatiques.",
    places: 45,
    dateDebut: "2026-09-01",
    dateFin: "2026-10-15",
    statut: "À venir",
    criteres: [
      { id: "c1", libelle: "Diplôme requis", valeur: "Licence en Informatique" },
      { id: "c2", libelle: "Moyenne minimale", valeur: "10.50 / 20" },
      { id: "c3", libelle: "Redoublements maximum", valeur: "2 années" },
    ],
    ponderation: { l1: 25, l2: 35, l3: 40 },
    documents: ["Relevés de notes L1, L2, L3", "Diplôme de Licence (PDF)", "Lettre de motivation"],
  },
  {
    id: "m5",
    nom: "Master en Génie Énergétique",
    universite: "Université de Monastir",
    etablissement: "École Nationale d'Ingénieurs de Monastir",
    ville: "Monastir",
    domaine: "Génie",
    descriptionCourte: "Énergies renouvelables et efficacité énergétique.",
    description:
      "Formation dédiée aux systèmes énergétiques durables : solaire, éolien, stockage, réseaux intelligents et audit énergétique industriel.",
    places: 25,
    dateDebut: "2026-05-01",
    dateFin: "2026-06-30",
    statut: "Fermé",
    criteres: [
      { id: "c1", libelle: "Diplôme requis", valeur: "Licence en Génie ou Physique" },
      { id: "c2", libelle: "Moyenne minimale", valeur: "12.00 / 20" },
    ],
    ponderation: { l1: 30, l2: 30, l3: 40 },
    documents: ["Relevés de notes L1, L2, L3", "Diplôme de Licence (PDF)"],
  },
  {
    id: "m6",
    nom: "Master en Droit des Affaires",
    universite: "Université de Tunis El Manar",
    etablissement: "Faculté de Droit et des Sciences Politiques de Tunis",
    ville: "Tunis",
    domaine: "Droit",
    descriptionCourte: "Droit commercial, fiscal et contentieux des affaires.",
    description:
      "Ce master approfondit le droit des sociétés, la fiscalité des entreprises, l'arbitrage et le droit international des affaires.",
    places: 50,
    dateDebut: "2026-07-05",
    dateFin: "2026-08-25",
    statut: "Ouvert",
    criteres: [
      { id: "c1", libelle: "Diplôme requis", valeur: "Licence en Droit" },
      { id: "c2", libelle: "Moyenne minimale", valeur: "11.00 / 20" },
    ],
    ponderation: { l1: 30, l2: 30, l3: 40 },
    documents: ["Relevés de notes L1, L2, L3", "Diplôme de Licence (PDF)"],
  },
  {
    id: "m7",
    nom: "Master en Biotechnologie Médicale",
    universite: "Université de Monastir",
    etablissement: "Faculté de Pharmacie de Monastir",
    ville: "Monastir",
    domaine: "Santé",
    descriptionCourte: "Biologie moléculaire appliquée au diagnostic médical.",
    description:
      "Formation à l'interface de la biologie et de la santé : génomique, diagnostic moléculaire, bio-informatique et bonnes pratiques de laboratoire.",
    places: 20,
    dateDebut: "2026-07-15",
    dateFin: "2026-09-10",
    statut: "Ouvert",
    criteres: [
      { id: "c1", libelle: "Diplôme requis", valeur: "Licence en Biologie ou Biotechnologie" },
      { id: "c2", libelle: "Moyenne minimale", valeur: "12.50 / 20" },
      { id: "c3", libelle: "Redoublements maximum", valeur: "0 année" },
    ],
    ponderation: { l1: 30, l2: 35, l3: 35 },
    documents: ["Relevés de notes L1, L2, L3", "Diplôme de Licence (PDF)", "Attestation de stage"],
  },
  {
    id: "m8",
    nom: "Master en Mathématiques Appliquées",
    universite: "Université de Gabès",
    etablissement: "Faculté des Sciences de Gabès",
    ville: "Gabès",
    domaine: "Sciences",
    descriptionCourte: "Modélisation, statistiques et calcul scientifique.",
    description:
      "Le master forme aux méthodes numériques, à la modélisation stochastique et à l'optimisation, avec des applications industrielles et financières.",
    places: 28,
    dateDebut: "2026-08-01",
    dateFin: "2026-09-20",
    statut: "À venir",
    criteres: [
      { id: "c1", libelle: "Diplôme requis", valeur: "Licence en Mathématiques" },
      { id: "c2", libelle: "Moyenne minimale", valeur: "11.00 / 20" },
    ],
    ponderation: { l1: 35, l2: 30, l3: 35 },
    documents: ["Relevés de notes L1, L2, L3", "Diplôme de Licence (PDF)"],
  },
];

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

export function calculerScore(candidat: Candidat, master: Master) {
  const { l1, l2, l3 } = master.ponderation;
  const total =
    (Number(candidat.l1.moyenne) * l1 +
      Number(candidat.l2.moyenne) * l2 +
      Number(candidat.l3.moyenne) * l3) /
    100;
  return Math.round(total * 100) / 100;
}

const STATUTS: Candidature["statut"][] = ["Soumise", "À réviser", "Approuvée", "Rejetée"];

export const CANDIDATURES: Candidature[] = CANDIDATS.flatMap((candidat, i) => {
  const masters = [MASTERS[i % MASTERS.length]!, MASTERS[(i + 3) % MASTERS.length]!];
  return masters.slice(0, 1 + (i % 2)).map((master, j) => ({
    id: `a${i + 1}-${j + 1}`,
    candidatId: candidat.id,
    masterId: master.id,
    date: `2026-07-${String(2 + ((i + j) % 26)).padStart(2, "0")}`,
    score: calculerScore(candidat, master),
    statut: STATUTS[(i + j) % STATUTS.length]!,
    majLe: `2026-07-${String(5 + ((i + j) % 24)).padStart(2, "0")}`,
  }));
});

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

export const EVOLUTION_CANDIDATURES: Record<string, { annee: string; total: number }[]> =
  Object.fromEntries(
    MASTERS.map((m, i) => [
      m.id,
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

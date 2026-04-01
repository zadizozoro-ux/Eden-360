import { useState, useEffect, useRef } from "react";
import EspaceAbonne, { createSubscriberProfile, PILIERS_ANNUELS } from "./EdenSubscriber.jsx";
const WHATSAPP_NUM = "2250141800001"; 


// EDEN ACADÉMIE — Application Unifiée v2.0
// ═══════════════════════════════════════════════════════════════════════════
// EDEN ACADÉMIE — Application Unifiée v2.0
// Bilan 360° · Portrait Eaux·Os·Chair · Espace Abonné (3 niveaux)
// Institut de Leadership Familial — Fondé par Zady Zozoro
// API calls → /api/diagnostic-report · /api/portrait-report (backend Node.js)
// ═══════════════════════════════════════════════════════════════════════════
// ─── CONSTANTS ───────────────────────────────────────────────────────────

const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/CONFIGURER_ICI"; // ← Remplacer par le lien du groupe privé abonnés
const ADMIN_PASSWORD = "Eden@2026";
const ALERT_EMAIL = "zadi.zozoro@gmail.com"; // ← Remplacer par email pro quand disponible
const INTERNAL_REPORT_PASSWORD = "EdenEquipe@2025"; // Mot de passe rapport interne conseiller
// Niveaux d'alerte
const ALERT_LEVELS = { INFO: 1, VIGILANCE: 2, CRISE: 3, SYSTEM: 4 };
const STORAGE_KEY = "eden_unified_v2";
const MAX_QUESTIONS_FREE = 5;
const MAX_QUESTIONS_PREMIUM = 30; // Tous les niveaux abonnés = 30 questions IA/mois
// ─── NIVEAUX D'ABONNEMENT ────────────────────────────────────────────────
// "none"    = Non-abonné
// "simple"  = Abonnement Simple  — 15 000 FCFA/mois
// "argent"  = Abonnement Argent  — 25 000 FCFA/mois (à confirmer)
// "premium" = Abonnement Premium — 40 000 FCFA/mois (à confirmer)
const FEATURES_MAP = {
  // Disponible pour tous les abonnés (simple, argent, premium)
  bilan360:           ["simple", "argent", "premium"],
  portrait:           ["simple", "argent", "premium"],
  horloge:            ["simple", "argent", "premium"],
  futureLetter:       ["simple", "argent", "premium"],
  viralShare:         ["simple", "argent", "premium"],
  microPertes:        ["simple", "argent", "premium"],
  lectureMiroir:      ["simple", "argent", "premium"],
  seedOfEden:         ["simple", "argent", "premium"],
  archeEden:          ["simple", "argent", "premium"],
  groupeWhatsapp:     ["simple", "argent", "premium"],
  diagnosticMensuel:  ["simple", "argent", "premium"],
  formationOfferte:   ["simple", "argent", "premium"],
  // Argent et Premium uniquement
  toutesFormations:   ["argent", "premium"],
  tousPDF:            ["argent", "premium"],
  suiviMensuel:       ["argent", "premium"],
  exportPDF:          ["argent", "premium"],
  // Premium uniquement
  seanceAccompagnateur: ["premium"],
  seanceZady:           ["premium"],
  replays:              ["premium"],
  planActionIA:         ["premium"],
  graphiquesProgression: ["premium"],
  alertesProactives:    ["premium"],
};

function hasAccess(feature, level) {
  if (!level || level === "none") return false;
  return (FEATURES_MAP[feature] || []).includes(level);
}

function getLevelLabel(level) {
  return level === "simple" ? "Simple" : level === "argent" ? "Argent" : level === "premium" ? "Premium" : "";
}

function getLevelColor(level) {
  return level === "premium" ? "#C9A84C" : level === "argent" ? "#7BAFC9" : level === "simple" ? "#4A9B6A" : "#4A5060";
}

const SCALE = [1, 2, 3, 4, 5];
const SL = { 1: "Jamais", 2: "Rarement", 3: "Parfois", 4: "Souvent", 5: "Toujours" };
const ROLES = ["PDG / Directeur Général", "Avocat / Juriste", "Officier / Militaire", "Médecin / Chirurgien", "Entrepreneur", "Cadre / Manager", "Enseignant / Chercheur", "Autre"];

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────
const C = {
  bg: "#080C14", surface: "#0D1018", border: "#1E2330",
  gold: "#C9A84C", goldLight: "#D4B86A",
  green: "#4A9B6A", blue: "#7BAFC9",
  red: "#C0614A", orange: "#C0784A",
  text: "#C8C0B0", muted: "#8A8070", dim: "#4A5060",
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1 — DONNÉES BILAN 360°
// ═══════════════════════════════════════════════════════════════════════════
const FORMATIONS = [
  { id: "single", nom: "Eden Single", detail: "Se Préparer au Mariage avec Dieu", prix: "25 000 FCFA",
    desc: "Pour les célibataires qui veulent entrer en relation en force, pas en manque.", profil: ["celibataire"] },
  { id: "connexion", nom: "Eden Connexion", detail: "Se Préparer à l'Alliance", prix: "25 000 FCFA",
    desc: "Pour les fiancés qui veulent bâtir sur du solide avant de dire oui.", profil: ["fiance"] },
  { id: "piliers", nom: "Les 12 Piliers d'un Mariage Solide", detail: "", prix: "75 000 FCFA",
    desc: "L'architecture complète d'un couple qui dure.", profil: ["marie", "fiance"] },
  { id: "stades", nom: "Les 7 Stades de la Rupture", detail: "", prix: "75 000 FCFA",
    desc: "Comprendre et traverser les crises.", profil: ["marie", "fiance", "celibataire"] },
  { id: "diagnostic", nom: "Diagnostic du Couple", detail: "", prix: "75 000 FCFA",
    desc: "Comprendre où en est votre couple et inverser le processus.", profil: ["marie"] },
  { id: "causes", nom: "Les 7 Causes Internes de la Chute", detail: "", prix: "75 000 FCFA",
    desc: "Ce qui ronge silencieusement votre foyer.", profil: ["marie"] },
  { id: "rescue", nom: "RESCUE — 90 Jours", detail: "Programme de Restauration Conjugale", prix: "75 000 FCFA",
    desc: "Pour les couples en crise qui veulent une transformation profonde.", profil: ["marie"] },
  { id: "seance1", nom: "Séance d'accompagnement", detail: "avec Zady Zozoro", prix: "35 000 FCFA",
    desc: "90 min en ligne, analyse et conseil personnalisé.", profil: ["marie", "fiance", "celibataire"] },
  { id: "seance_presentiel", nom: "Séance en présentiel", detail: "avec Zady Zozoro à Abidjan", prix: "50 000 FCFA",
    desc: "Séance en cabinet — 90 min d'accompagnement intensif.", profil: ["marie", "fiance", "celibataire"] },
];
const BM = {
  marie: { communication: { stable: 72, fragile: 41 }, gouvernance: { stable: 68, fragile: 44 }, intimite: { stable: 74, fragile: 43 }, vision: { stable: 70, fragile: 45 }, conflits: { stable: 65, fragile: 40 }, spiritualite: { stable: 76, fragile: 48 }, equilibre: { stable: 66, fragile: 42 }, heritage: { stable: 72, fragile: 46 }, dynamiques: { stable: 68, fragile: 42 } },
  fiance: { connaissance: { stable: 78, fragile: 52 }, vision: { stable: 74, fragile: 48 }, conflits: { stable: 67, fragile: 43 }, famille: { stable: 72, fragile: 46 }, finances: { stable: 70, fragile: 44 }, spiritualite: { stable: 76, fragile: 50 }, securite: { stable: 80, fragile: 55 }, preparation: { stable: 74, fragile: 48 } },
  celibataire: { identite: { stable: 74, fragile: 45 }, blessures: { stable: 70, fragile: 38 }, autonomie: { stable: 72, fragile: 44 }, maturite: { stable: 68, fragile: 42 }, discernement: { stable: 74, fragile: 48 }, spiritualite: { stable: 76, fragile: 50 }, schemas: { stable: 68, fragile: 40 }, dynamiques: { stable: 70, fragile: 42 } }
};

const IE = {
  ISC: { titre: "Solidité Conjugale", def: "L'architecture fondamentale : vision, gouvernance, communication, héritage." },
  IPR: { titre: "Perception Relationnelle", def: "Thermomètre émotionnel : qualité de connexion intime et de dialogue." },
  IRC: { titre: "Résilience Conjugale", def: "Système immunitaire conjugal : capacité à traverser les crises sans se briser." },
  IDC: { titre: "Dynamique Conflictuelle", def: "Comment vous gérez les désaccords — prédicteur clé de la trajectoire." },
  ICP: { titre: "Connaissance & Vision", def: "Profondeur de votre connaissance réciproque et alignement sur l'avenir." },
  IPF: { titre: "Préparation", def: "Niveau de préparation réelle : outils, finances, sécurité relationnelle." },
  IFS: { titre: "Fondation Spirituelle", def: "Solidité de votre fondation commune et clarté des limites familiales." },
  ICO: { titre: "Cohésion Relationnelle", def: "Comment vous gérez les désaccords — prédicteur clé de l'alliance." },
  IIP: { titre: "Identité Personnelle", def: "Solidité de votre identité, autonomie émotionnelle et maturité." },
  IBG: { titre: "Blessures & Guérison", def: "État de guérison de vos blessures et présence de schémas actifs." },
  IDS: { titre: "Discernement Spirituel", def: "Capacité à distinguer une vraie attirance d'un besoin affectif non guéri." },
  IRP: { titre: "Patterns Relationnels", def: "Dynamiques inconscientes actives dans vos relations." }
};

const DE = {
  communication: { titre: "Communication & Dialogue", texte: "À Babel, le peuple s'est divisé non par manque d'amour, mais par perte de langage commun. La communication est le système nerveux du couple." },
  gouvernance: { titre: "Gouvernance & Rôles", texte: "Le 'syndrome du général absent' : un homme peut être présent physiquement mais absent en leadership. La gouvernance, c'est savoir qui tient le cap et comment les décisions se prennent." },
  intimite: { titre: "Intimité & Connexion", texte: "L'intimité, ce n'est pas seulement physique. C'est être connu profondément et accepté pleinement. Quand l'intimité s'efface, la distance s'installe silencieusement." },
  vision: { titre: "Vision & Projet Commun", texte: "Un couple sans vision commune devient deux individus qui cohabitent. La vision partagée est la boussole qui oriente chaque décision." },
  conflits: { titre: "Gestion des Conflits", texte: "Les 4 Cavaliers de Gottman (critique, mépris, défensive, mur de pierre) prédisent la rupture avec 93% de précision. La façon dont vous vous disputez révèle tout." },
  spiritualite: { titre: "Foi & Vie Spirituelle", texte: "'Un mariage sans autel familial est un bâtiment sans fondation.' La foi commune n'est pas un supplément — c'est la base." },
  equilibre: { titre: "Équilibre Pro / Famille", texte: "Le dirigeant qui 'rentre chez lui physiquement mais reste au bureau mentalement' est absent même quand il est là." },
  heritage: { titre: "Parentalité & Héritage", texte: "La famille produit soit des citoyens de valeur soit des blessés émotionnels. L'héritage se transmet — consciemment ou non." },
  dynamiques: { titre: "Dynamiques Relationnelles Profondes", texte: "Cette dimension révèle les patterns invisibles qui opèrent sous la surface du quotidien." },
  identite: { titre: "Identité & Connaissance de Soi", texte: "'On ne peut pas donner ce qu'on n'a pas.' L'identité solide est le fondement de tout engagement sain." },
  blessures: { titre: "Guérison des Blessures", texte: "Les blessures non guéries — rejet, abandon, trahison — deviennent les lunettes à travers lesquelles on interprète tout." },
  autonomie: { titre: "Autonomie Émotionnelle", texte: "La solitude n'est pas l'ennemi. C'est une école d'identité. Celui qui ne sait pas être seul ne sait pas vraiment être avec l'autre." },
  maturite: { titre: "Maturité Relationnelle", texte: "Se mesure à la capacité de faire le premier pas, d'exprimer ses besoins et de gérer la frustration sans explosion ni retrait." },
  discernement: { titre: "Discernement & Critères", texte: "La capacité de distinguer une vraie attirance d'un besoin affectif non guéri est rare — et précieuse." },
  schemas: { titre: "Schémas Familiaux", texte: "Les patterns relationnels se transmettent de génération en génération — jusqu'à ce que quelqu'un décide de briser la chaîne." },
  connaissance: { titre: "Connaissance Mutuelle", texte: "Connaître son partenaire en profondeur — ses peurs, ses rêves, ses blessures — est la fondation de l'intimité réelle." },
  famille: { titre: "Belle-famille & Limites", texte: "'Quitter père et mère' (Genèse 2:24) est une instruction architecturale. Sans frontières claires, le couple reste fragile." },
  finances: { titre: "Transparence Financière", texte: "Les conflits financiers sont la 2ème cause de divorce. La transparence financière n'est pas un détail — c'est un acte d'alliance." },
  securite: { titre: "Sécurité & Liberté", texte: "Une relation saine est un espace où l'on peut être soi-même sans peur de la réaction de l'autre." },
  preparation: { titre: "Préparation à l'Alliance", texte: "Vous passez 20 ans sur les bancs de l'école pour une carrière. Combien pour le mariage ?" }
};

const MODS = {
  celibataire: { label: "Eden Single", subtitle: "Bilan de préparation au mariage", dims: [
    { id: "identite", label: "Identité & Connaissance de Soi", icon: "◈", qs: [
      { id: "c1", t: "Je peux décrire avec précision mes qualités et mes défauts sans utiliser des mots de façade." },
      { id: "c2", t: "J'ai une idée claire de ce que je veux faire de ma vie dans les 5 prochaines années." },
      { id: "c3", t: "Je me sens à l'aise pour exprimer mes limites et dire 'non' sans culpabilité." },
      { id: "c4", t: "Je crois que les gens autour de moi me voient plus mature que je ne le suis réellement.", inv: true },
      { id: "c5", t: "Je sais reconnaître mes torts et m'excuser sans chercher à me justifier." },
      { id: "c6", t: "Je me sens bien dans ma vie de célibataire — c'est une saison active, pas une salle d'attente." }
    ] },
    { id: "blessures", label: "Guérison des Blessures", icon: "◉", qs: [
      { id: "c7", t: "Je pense souvent que les personnes qui m'ont blessé devraient payer pour ce qu'elles m'ont fait.", inv: true },
      { id: "c8", t: "Je suis parvenu(e) à pardonner sincèrement aux personnes qui m'ont profondément blessé(e)." },
      { id: "c9", t: "Des situations passées me font encore réagir de manière disproportionnée.", inv: true },
      { id: "c10", t: "Aujourd'hui, je me sens libéré(e) de l'emprise émotionnelle de blessures relationnelles passées." },
      { id: "c11", t: "Lorsqu'une relation prend fin, je comprends généralement ce que j'en ai appris." },
      { id: "c12", t: "Je peux évoquer mon passé sans ressentir de honte ou de colère intense." },
      { id: "c13", t: "J'ai maintenu des relations que je savais problématiques parce que je n'arrivais pas à partir.", inv: true }
    ] },
    { id: "autonomie", label: "Autonomie Émotionnelle", icon: "◆", qs: [
      { id: "c14", t: "La solitude est pour moi un espace que je redoute et que je cherche à fuir.", inv: true },
      { id: "c15", t: "Je trouve une vraie richesse dans les moments seul(e)." },
      { id: "c16", t: "Ma relation avec Dieu me permet de ne pas dépendre d'une relation amoureuse pour me sentir complet(e)." },
      { id: "c17", t: "Je me sens épanoui(e) et complet(e) sans être en couple." },
      { id: "c18", t: "Quand quelqu'un met fin à une relation avec moi, je gère cela sans perdre pied durablement." },
      { id: "c19", t: "J'ai des passions personnelles qui me comblent indépendamment de mes relations." }
    ] },
    { id: "maturite", label: "Maturité Relationnelle", icon: "◎", qs: [
      { id: "c20", t: "Lors d'un désaccord, j'attends généralement que l'autre fasse le premier pas vers la réconciliation.", inv: true },
      { id: "c21", t: "Après un désaccord, je fais activement des efforts pour rétablir le lien." },
      { id: "c22", t: "Il m'arrive de dire 'oui' à des choses que je ne veux pas vraiment faire pour éviter le conflit.", inv: true },
      { id: "c23", t: "Je prends le temps de comprendre pourquoi une personne agit d'une certaine façon avant de juger." },
      { id: "c24", t: "Je gère les frustrations sans explosion émotionnelle ni retrait brutal." },
      { id: "c25", t: "Je suis capable d'exprimer mes besoins clairement sans attendre que l'autre les devine." },
      { id: "c26", t: "Je sais distinguer une réaction liée à la situation présente d'une blessure ancienne." }
    ] },
    { id: "discernement", label: "Discernement & Critères", icon: "◐", qs: [
      { id: "c27", t: "Je connais précisément les valeurs non-négociables que j'attends d'une future relation." },
      { id: "c28", t: "J'ai souvent du mal à distinguer une vraie attirance d'un simple besoin affectif.", inv: true },
      { id: "c29", t: "Je suis capable d'identifier clairement ce qui me rendrait incompatible avec quelqu'un." },
      { id: "c30", t: "Je confonds souvent l'intensité émotionnelle des débuts avec la profondeur d'une relation.", inv: true },
      { id: "c31", t: "Je suis capable de reconnaître rapidement quand une relation me fait plus de mal que de bien." },
      { id: "c32", t: "Dans le passé, j'ai perdu intérêt pour quelqu'un peu après avoir obtenu ce que je cherchais.", inv: true }
    ] },
    { id: "spiritualite", label: "Ancrage Spirituel", icon: "✦", qs: [
      { id: "c33", t: "Ma vision de vie est guidée par des convictions claires." },
      { id: "c34", t: "Ma vie spirituelle est principalement une affaire privée — je n'en parle pas.", inv: true },
      { id: "c35", t: "Je fais partie d'une communauté de foi qui me soutient et me responsabilise." },
      { id: "c36", t: "Ma relation avec Dieu guide concrètement mes choix relationnels." }
    ] },
    { id: "schemas", label: "Schémas Familiaux", icon: "◇", qs: [
      { id: "c37", t: "En observant mes parents, je reconnais des ressemblances avec ce que je recherche chez un partenaire." },
      { id: "c38", t: "Dans mes relations passées, les mêmes types de tensions revenaient régulièrement.", inv: true },
      { id: "c39", t: "Je me surprends parfois à réagir dans les conflits exactement comme mon père ou ma mère.", inv: true },
      { id: "c40", t: "Je reproduis parfois des comportements que j'avais juré de ne jamais reproduire.", inv: true },
      { id: "c41", t: "J'ai identifié les schémas transgénérationnels qui agissent dans ma vie et je travaille à les transformer." }
    ] },
    { id: "dynamiques", label: "Dynamiques Relationnelles", icon: "◑", qs: [
      { id: "c42", t: "La passion au début d'une relation a souvent été très intense pour moi, presque addictive.", inv: true },
      { id: "c43", t: "J'ai déjà cédé face à une pression insistante parce que je ne supportais pas la tension.", inv: true },
      { id: "c44", t: "Des personnes proches ont exprimé des réserves sur des personnes que je fréquentais.", inv: true },
      { id: "c45", t: "Je me sens parfois 'trop' dans mes relations — trop investi(e), trop intensément présent(e).", inv: true },
      { id: "c46", t: "J'ai déjà choisi quelqu'un que je savais problématique parce que l'attachement était trop fort.", inv: true },
      { id: "c47", t: "Je suis capable de maintenir mes limites même sous une forte pression affective." },
      { id: "c48", t: "Je prends des décisions relationnelles importantes après réflexion et prière, pas sous l'émotion." },
      { id: "c49", t: "Mes relations passées ressemblent trop souvent aux mêmes scénarios.", inv: true },
      { id: "c50", t: "Je me sens prêt(e) à entrer en relation en force, pas pour fuir la solitude." }
    ] }
  ], oqs: [
    { id: "co1", t: "En une phrase, décrivez ce qui vous préoccupe le plus dans votre vie relationnelle en ce moment." },
    { id: "co2", t: "Qu'est-ce qui vous a poussé à faire ce bilan aujourd'hui ?" },
    { id: "co3", t: "Quelle est la relation passée qui vous a le plus marqué(e), et pourquoi ?" }
  ] },
  fiance: { label: "Eden Connexion", subtitle: "Bilan de préparation à l'alliance", dims: [
    { id: "connaissance", label: "Connaissance Mutuelle", icon: "◈", qs: [
      { id: "f1", t: "Je peux citer trois choses que mon/ma partenaire apprécie vraiment dans sa vie quotidienne." },
      { id: "f2", t: "Je connais les principales peurs et insécurités de mon/ma partenaire." },
      { id: "f3", t: "J'ai parfois l'impression de ne pas vraiment connaître la version la plus vulnérable de mon partenaire.", inv: true },
      { id: "f4", t: "Mon partenaire connaît mes blessures les plus profondes et les accepte pleinement." },
      { id: "f5", t: "J'ai déjà vu comment mon partenaire réagit sous une pression intense ou une profonde déception." },
      { id: "f6", t: "Je pourrais décrire avec précision ce qui motive profondément mon partenaire dans la vie." }
    ] },
    { id: "vision", label: "Vision Commune", icon: "◆", qs: [
      { id: "f7", t: "Nous avons une vision alignée sur l'éducation de nos futurs enfants." },
      { id: "f8", t: "Nous avons parlé de nos objectifs professionnels et de comment nous nous soutiendrons." },
      { id: "f9", t: "Si mon partenaire recevait une opportunité dans une autre ville, nous trouverions un terrain d'entente." },
      { id: "f10", t: "Nous sommes en désaccord profond sur des éléments fondamentaux de notre avenir commun.", inv: true },
      { id: "f11", t: "Nous avons une vision commune de notre vie spirituelle après le mariage." }
    ] },
    { id: "conflits", label: "Gestion des Conflits", icon: "◉", qs: [
      { id: "f12", t: "Après une dispute sérieuse, je sais comment créer un espace pour renouer le contact." },
      { id: "f13", t: "Quand nous ne sommes pas d'accord, nous trouvons un compromis sans que l'un se sente perdant." },
      { id: "f14", t: "Il y a des sujets importants que j'évite d'aborder avec mon partenaire par peur de la réaction.", inv: true },
      { id: "f15", t: "Je me sens libre d'exprimer un désaccord avec mon partenaire sans craindre une rupture." },
      { id: "f16", t: "Notre dernière dispute s'est terminée par une compréhension mutuelle, pas par un silence." }
    ] },
    { id: "famille", label: "Belle-famille & Limites", icon: "◎", qs: [
      { id: "f17", t: "Mon partenaire et moi partageons la même compréhension de ce que signifie 'quitter père et mère'." },
      { id: "f18", t: "Je pense que nos familles respectives respecteront notre autonomie après le mariage." },
      { id: "f19", t: "La famille de mon partenaire exerce une influence qui peut primer sur nos décisions.", inv: true },
      { id: "f20", t: "Nous avons un accord clair sur les limites à poser avec nos familles respectives." },
      { id: "f21", t: "Mon partenaire met régulièrement les besoins de sa famille d'origine avant les nôtres.", inv: true }
    ] },
    { id: "finances", label: "Transparence Financière", icon: "◐", qs: [
      { id: "f22", t: "Mon partenaire a été totalement transparent sur l'état réel de ses finances." },
      { id: "f23", t: "Nous avons eu des conversations honnêtes sur nos situations financières respectives." },
      { id: "f24", t: "Nous avons un plan clair sur la gestion de l'argent après le mariage." },
      { id: "f25", t: "Il y a des aspects financiers que je connais mal ou que je préfère ne pas aborder.", inv: true },
      { id: "f26", t: "Nous sommes alignés sur nos priorités de dépense et d'épargne." }
    ] },
    { id: "spiritualite", label: "Fondation Spirituelle", icon: "✦", qs: [
      { id: "f27", t: "Nous avons une compréhension claire et partagée de notre vie spirituelle commune après le mariage." },
      { id: "f28", t: "Je sens que Dieu nous a guidés l'un vers l'autre, et cette conviction est partagée." },
      { id: "f29", t: "Il y a des zones importantes de notre vie spirituelle sur lesquelles nous ne sommes pas alignés.", inv: true },
      { id: "f30", t: "Nous prions ensemble régulièrement, pas seulement lors des cultes." },
      { id: "f31", t: "L'un de nous est significativement plus engagé spirituellement, ce qui crée des tensions.", inv: true }
    ] },
    { id: "securite", label: "Sécurité & Liberté", icon: "◑", qs: [
      { id: "f32", t: "Lorsque je résiste à une demande de mon partenaire, l'atmosphère devient tendue.", inv: true },
      { id: "f33", t: "Il m'arrive de ne pas dire ce que je pense vraiment pour éviter une réaction difficile.", inv: true },
      { id: "f34", t: "Mon partenaire insiste ou fait pression jusqu'à ce que j'accepte, même quand j'ai dit non.", inv: true },
      { id: "f35", t: "Des personnes proches ont exprimé des réserves sérieuses sur ma relation.", inv: true },
      { id: "f36", t: "Je me sens totalement libre d'être moi-même avec mon partenaire, sans masque." },
      { id: "f37", t: "J'ai déjà présenté une version embellie de notre relation à ma famille pour les rassurer.", inv: true },
      { id: "f38", t: "Mon partenaire cherche parfois à limiter mes contacts avec certains amis ou membres de ma famille.", inv: true }
    ] },
    { id: "preparation", label: "Préparation à l'Alliance", icon: "◇", qs: [
      { id: "f39", t: "Nous avons suivi un accompagnement ou reçu un enseignement sérieux sur le mariage." },
      { id: "f40", t: "Nous avons fixé une date de mariage sans avoir reçu de préparation prénuptiale sérieuse.", inv: true },
      { id: "f41", t: "Je me sens prêt(e) à m'engager pour la vie en pleine connaissance des forces ET des fragilités." },
      { id: "f42", t: "Notre engagement à la pureté pendant les fiançailles est respecté et partagé." },
      { id: "f43", t: "En cas de crise, notre premier réflexe serait de prier ensemble puis de consulter." },
      { id: "f44", t: "Nous avons des mentors ou pasteurs qui connaissent notre relation et peuvent nous accompagner." },
      { id: "f45", t: "Je me sens prêt(e) à dire 'oui' pour la vie, en pleine conscience." },
      { id: "f46", t: "J'ai encore des doutes importants sur cette relation que je n'ai pas résolus.", inv: true },
      { id: "f47", t: "Nous avons discuté sérieusement de nos attentes concernant les enfants." },
      { id: "f48", t: "Je suis convaincu(e) que nous avons les outils pour traverser les moments difficiles." },
      { id: "f49", t: "Notre relation a connu une évolution très rapide — nous nous sommes peu connus avant de nous fiancer.", inv: true },
      { id: "f50", t: "Je me réjouis pleinement à l'idée de construire une vie avec cette personne." }
    ] }
  ], oqs: [
    { id: "fo1", t: "En une phrase, décrivez ce qui vous préoccupe le plus dans votre relation actuelle." },
    { id: "fo2", t: "Qu'est-ce qui vous a poussé à faire ce bilan aujourd'hui ?" },
    { id: "fo3", t: "Si vous pouviez changer une seule chose dans votre relation avant le mariage, ce serait…" }
  ] },
  marie: { label: "Eden Couple", subtitle: "Bilan de vitalité conjugale", dims: [
    { id: "communication", label: "Communication & Dialogue", icon: "◈", qs: [
      { id: "m1", t: "Nous prenons le temps de nous parler chaque jour sans distraction." },
      { id: "m2", t: "Je me sens libre d'exprimer mes besoins et mes émotions sans craindre une réaction négative." },
      { id: "m3", t: "Nos désaccords se terminent par une compréhension mutuelle, pas par un silence ou une capitulation." },
      { id: "m4", t: "Il y a des sujets dans notre couple dont nous avons tacitement décidé de ne jamais parler.", inv: true },
      { id: "m5", t: "Mon conjoint écoute vraiment quand je parle, sans préparer sa réponse dans sa tête." },
      { id: "m6", t: "Il y a des mots ou comportements récurrents de mon conjoint qui me font encore mal.", inv: true }
    ] },
    { id: "gouvernance", label: "Gouvernance & Rôles", icon: "◆", qs: [
      { id: "m7", t: "Les rôles et responsabilités de chacun sont clairement définis et acceptés par les deux." },
      { id: "m8", t: "Mon conjoint me consulte avant de prendre des décisions importantes qui nous concernent." },
      { id: "m9", t: "Dans notre couple, il y a une lutte constante pour savoir qui a le dernier mot.", inv: true },
      { id: "m10", t: "Mon conjoint prend régulièrement des décisions en mon nom sans m'avoir consulté(e).", inv: true },
      { id: "m11", t: "Je compense souvent l'absence de leadership de mon conjoint sans que nous en ayons parlé.", inv: true }
    ] },
    { id: "intimite", label: "Intimité & Connexion", icon: "◉", qs: [
      { id: "m12", t: "Je me sens profondément connu(e) et accepté(e) par mon conjoint, au-delà de mon image publique." },
      { id: "m13", t: "Il m'arrive de me sentir seul(e) même quand mon conjoint est physiquement présent.", inv: true },
      { id: "m14", t: "Mon conjoint est la première personne à qui je pense quand j'ai une bonne ou une mauvaise nouvelle." },
      { id: "m15", t: "Notre vie intime (émotionnelle et physique) est source de connexion et non de tension." },
      { id: "m16", t: "Nous avons des conversations profondes sur nos peurs, nos rêves et nos insécurités." },
      { id: "m17", t: "Je connais les rêves actuels de mon conjoint — pas ceux d'il y a 5 ans." }
    ] },
    { id: "vision", label: "Vision & Projet Commun", icon: "◎", qs: [
      { id: "m18", t: "Nous avons une vision claire et partagée de ce pour quoi nous nous battons en tant que couple." },
      { id: "m19", t: "Nous avons des projets concrets pour l'avenir qui nous motivent tous les deux." },
      { id: "m20", t: "Notre couple a perdu son cap commun au fil des années.", inv: true },
      { id: "m21", t: "Nous parlons régulièrement de l'héritage que nous voulons laisser à nos enfants." },
      { id: "m22", t: "Je nous vois clairement ensemble dans 10 ans avec un projet de vie commun stimulant." }
    ] },
    { id: "conflits", label: "Gestion des Conflits", icon: "◐", qs: [
      { id: "m23", t: "Lors d'un conflit, nous évitons les accusations personnelles et les attaques de caractère." },
      { id: "m24", t: "Nous avons tendance à nous disputer sur les mêmes sujets encore et encore, sans résolution.", inv: true },
      { id: "m25", t: "Nous arrivons à résoudre nos conflits de manière satisfaisante pour les deux." },
      { id: "m26", t: "Mon conjoint me fait régulièrement sentir que mes opinions sont moins importantes.", inv: true },
      { id: "m27", t: "Quand je résiste à une demande de mon conjoint, l'atmosphère devient tendue jusqu'à ce que je cède.", inv: true },
      { id: "m28", t: "Je ressens encore de la rancœur envers mon conjoint pour des choses passées.", inv: true },
      { id: "m29", t: "Mon conjoint a déjà eu des comportements verbalement ou physiquement blessants à mon égard.", inv: true }
    ] },
    { id: "spiritualite", label: "Foi & Vie Spirituelle", icon: "✦", qs: [
      { id: "m30", t: "La foi est véritablement au centre de notre vie conjugale, pas seulement déclarée." },
      { id: "m31", t: "Nous avons prié ensemble (à deux) au moins une fois au cours du dernier mois." },
      { id: "m32", t: "Notre relation avec Dieu nous aide à prendre de meilleures décisions ensemble." },
      { id: "m33", t: "En cas de crise, notre premier réflexe est de prier ensemble avant de chercher d'autres solutions." },
      { id: "m34", t: "Dieu est une présence active et reconnue dans les décisions de notre foyer." }
    ] },
    { id: "equilibre", label: "Équilibre Pro / Famille", icon: "◑", qs: [
      { id: "m35", t: "Mon conjoint se sent une priorité réelle dans ma vie, au-delà de mes responsabilités professionnelles." },
      { id: "m36", t: "Je rentre à la maison présent(e) mentalement, pas seulement physiquement." },
      { id: "m37", t: "Mon travail empiète régulièrement sur notre vie de couple et familiale.", inv: true },
      { id: "m38", t: "Nous avons des moments réservés uniquement à notre couple, sans enfants ni obligations." }
    ] },
    { id: "heritage", label: "Parentalité & Héritage", icon: "◇", qs: [
      { id: "m39", t: "Nous sommes alignés dans notre approche éducative et présentons un front uni devant les enfants." },
      { id: "m40", t: "Lorsque des tensions existent entre nous, nos enfants en ressentent régulièrement les effets.", inv: true },
      { id: "m41", t: "Nous parlons activement à nos enfants des valeurs et de l'héritage que nous voulons transmettre." },
      { id: "m42", t: "Il m'arrive de me confier à l'un de mes enfants sur des difficultés que je vis dans le couple.", inv: true },
      { id: "m43", t: "Notre famille maintient des rituels et traditions qui nous ancrent et nous soudent." }
    ] },
    { id: "dynamiques", label: "Dynamiques Relationnelles Profondes", icon: "◑", qs: [
      { id: "m44", t: "Il nous arrive de présenter à l'extérieur une image de couple meilleure que ce que nous vivons.", inv: true },
      { id: "m45", t: "Mon conjoint critique régulièrement les figures d'autorité dans notre vie.", inv: true },
      { id: "m46", t: "J'ai peur de la réaction de mon conjoint quand je dis non ou que j'exprime un désaccord.", inv: true },
      { id: "m47", t: "En observant mes parents, je reconnais des ressemblances avec ce que je vis dans mon couple.", inv: true },
      { id: "m48", t: "Je regrette parfois de m'être marié(e) avec mon conjoint.", inv: true },
      { id: "m49", t: "Des personnes proches ont exprimé des préoccupations sérieuses sur notre relation.", inv: true },
      { id: "m50", t: "Je me projette avec confiance et joie dans l'avenir avec mon conjoint." }
    ] }
  ], oqs: [
    { id: "mo1", t: "En une phrase, décrivez ce qui vous préoccupe le plus dans votre vie conjugale en ce moment." },
    { id: "mo2", t: "Qu'est-ce qui vous a poussé à faire ce bilan aujourd'hui ?" },
    { id: "mo3", t: "Si vous pouviez changer une seule chose dans votre couple dès demain, ce serait…" }
  ] }
};
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2 — DONNÉES PORTRAIT EAUX·OS·CHAIR
// ═══════════════════════════════════════════════════════════════════════════
const ARCHETYPES = {
  "Adam-Eve": { ref: "Genèse 3", color: C.gold, titre: "Le Leader Effacé", mecanisme: "Le vide de leadership créé par peur du conflit pousse l'autre à porter ce qui ne lui appartient pas.", dimsFaibles: ["gouvernance", "communication"], orientation: "Restauration de l'identité du leader. Apprendre à entrer sans dominer." },
  "Samson-Dalila": { ref: "Juges 16", color: C.blue, titre: "L'Excellence Trahie", mecanisme: "Une vulnérabilité non protégée permet à l'autre de déposséder progressivement le plus fort.", dimsFaibles: ["vision", "autonomie"], orientation: "Identifier la vulnérabilité non protégée. Restaurer l'excellence." },
  "Achab-Jezabel": { ref: "1 Rois 16-21", color: C.orange, titre: "L'Autorité Manipulée", mecanisme: "L'un abandonne une autorité légitime. L'autre, plus fort, prend la place avec manipulation.", dimsFaibles: ["gouvernance", "confiance"], orientation: "L'autorité légitime doit se redresser. Le conjoint fort apprend à céder." },
  "Ananias-Saphira": { ref: "Actes 5", color: C.green, titre: "L'Alliance dans le Mensonge", mecanisme: "Le couple s'unit autour d'une façade. À l'extérieur, image parfaite. À l'intérieur, fracture.", dimsFaibles: ["transparence", "vision"], orientation: "La vérité doit entrer dans le couple. Créer un espace où l'on peut être vrai." },
  "Isaac-Rebecca": { ref: "Genèse 25-27", color: C.blue, titre: "La Triangulation Familiale", mecanisme: "Les enfants deviennent des instruments dans le jeu conjugal. Le couple se divise.", dimsFaibles: ["heritage", "communication"], orientation: "Réparation des frontières. L'enfant n'est pas le confident du parent." },
  "Transmission": { ref: "Exode 20:5", color: C.red, titre: "Les Chaînes Invisibles", mecanisme: "Les mêmes schémas traversent les générations. Ce n'est pas de la fatalité — c'est une invitation.", dimsFaibles: ["dynamiques", "schemas"], orientation: "Travail sur l'histoire familiale. Guérison transgénérationnelle." },
  "David-Michal": { ref: "2 Samuel 6", color: C.red, titre: "Le Mépris Qui Stérilise", mecanisme: "Le mépris disqualifie ce que l'autre a de sacré. Il stérilise l'amour plus sûrement que la haine.", dimsFaibles: ["intimite", "respect"], orientation: "Travail sur l'honneur mutuel.", urgence: true },
  "Moïse-Séphora": { ref: "Exode 18", color: C.gold, titre: "La Mission Non Soutenue", mecanisme: "L'un des conjoints a un appel que l'autre ne comprend pas ou s'y oppose.", dimsFaibles: ["vision", "spiritualite"], orientation: "Session de vision commune. Apprendre à bénir l'appel de l'autre." },
  "Jacob-Léa": { ref: "Genèse 29", color: C.red, titre: "L'Amour Non Réciproque", mecanisme: "L'un donne pour mériter l'amour. L'autre reçoit sans pouvoir répondre de la même manière.", dimsFaibles: ["intimite", "soutien"], orientation: "L'amour ne se mérite pas. Travail sur la valeur propre.", urgence: true },
  "Joseph-frères": { ref: "Genèse 37", color: C.green, titre: "Les Rêves Non Soutenus", mecanisme: "L'un a une vision. L'autre ne la comprend pas, la ridiculise ou l'ignore.", dimsFaibles: ["vision", "communication"], orientation: "Restaurer la légitimité des rêves. Vision commune." },
  // ─── 5 archétypes supplémentaires ────────────────────────────────────────
  "Saül-Michal": { ref: "1 Samuel 18", color: C.orange, titre: "La Belle-Famille Instrumentalisante",
    mecanisme: "Le parent instrumentalise son enfant pour ses propres intérêts conjugaux ou familiaux. Le conjoint reste pris entre deux loyautés — son mariage et sa famille d'origine. Le couple devient le champ de bataille d'une guerre qui ne lui appartient pas.",
    signaux: ["mes parents critiquent mon conjoint", "je suis un pion", "ma belle-famille veut contrôler", "des proches s'inquiètent pour nous"],
    dimsFaibles: ["famille", "gouvernance"], orientation: "Travail sur les frontières. 'Quitter père et mère' n'est pas une option — c'est une instruction architecturale du mariage. L'enfant doit choisir son conjoint." },
  "Caïn-Abel": { ref: "Genèse 4", color: C.orange, titre: "La Jalousie du Succès",
    mecanisme: "Jalousie existentielle — pas romantique. L'un minimise le succès de l'autre, le ridiculise dans ses projets ou ses rêves, ou culpabilise celui qui réussit. Le couple devient un espace où l'on ne peut pas grandir sans mettre l'autre en danger.",
    signaux: ["compétition silencieuse", "il minimise mes réussites", "je culpabilise de réussir", "mes projets ne sont jamais assez bons à ses yeux"],
    dimsFaibles: ["vision", "soutien"], orientation: "Travail sur l'humilité et la bénédiction fraternelle. Apprendre à bénir le succès de l'autre comme le sien propre." },
  // JOB-FEMME CLASSIQUE — La crise révèle une faille déjà existante
  "Job-femme": { ref: "Job 1-2", color: C.red, titre: "La Crise Qui Révèle", urgence: true,
    mecanisme: "La crise extérieure (perte d'emploi, deuil, maladie, ruine) ne crée pas la fracture — elle révèle ce qui était déjà fragile et caché sous le fonctionnement apparent. Le couple qui semblait tenir s'effondre sous la pression. L'un veut fuir ou abandonner. L'autre est abasourdi : il croyait que l'alliance était solide. La crise n'est pas l'ennemi — c'est le révélateur de l'état réel du bâtiment. Ce qui tient sous la pression était solide. Ce qui s'effondre était déjà fissuré.",
    signaux: ["dans la crise il/elle s'est éloigné(e)", "je ne le/la reconnaissais plus", "j'ai pensé à partir quand les choses sont devenues difficiles", "la crise a tout révélé", "avant la crise tout semblait bien aller", "nous ne prions pas ensemble quand ça va mal"],
    dimsFaibles: ["spiritualite", "conflits", "vision", "gouvernance"],
    orientation: "La crise n'est pas l'ennemi — c'est le révélateur. Le travail n'est pas de réparer la crise mais de travailler sur ce qu'elle a révélé. L'alliance doit être bâtie assez solide pour tenir sous la pression.",
    theologie: "Job ne perd pas la foi dans la crise. Mais le couple peut perdre l'alliance. La crise biblique teste non pas les individus mais les structures : une maison bâtie sur le roc tient sous la tempête. Une maison bâtie sur le sable s'effondre. (Matthieu 7:24-27)" },
  // OSÉE-GOMER — Le Médecin Épuisé
  "Osée-Gomer": { ref: "Osée 1-3 · Job 2:9", color: C.red, titre: "Le Médecin Épuisé", urgence: true, genreNeutre: true,
    mecanisme: "L'un des conjoints porte une blessure profonde et chronique — trahison, trauma, dépression, addiction, blessures de l'enfance non guéries. L'autre devient naturellement soignant, porteur, parent. Avec le temps, le système se rigidifie : le 'patient' n'a que des droits, le 'médecin' n'a que des devoirs. Le médecin s'épuise en silence — ses propres blessures deviennent invisibles car il/elle n'a pas le droit d'être fatigué(e). Son unique issue imaginée devient la disparition du patient — non par méchanceté, mais par épuisement total. Il/elle reste pourtant, fidèle mais à bout.",
    signaux: ["je dois toujours être fort(e) pour lui/elle", "personne ne voit ce que je porte", "mes propres besoins passent toujours après", "je reste mais je n'en peux plus", "j'aimerais que ça s'arrête", "j'ai parfois pensé que ce serait plus simple s'il/elle disparaissait", "je n'ai pas le droit d'être fatigué(e)"],
    dimsFaibles: ["equilibre", "spiritualite", "intimite", "gouvernance"],
    orientation: "1. Le médecin doit être vu — ses blessures doivent être nommées avant celles du patient. 2. Le patient doit reprendre ses responsabilités même dans la fragilité : être blessé n'est pas être irresponsable. 3. Rester n'est pas s'oublier. La fidélité n'est pas l'épuisement. 4. La guérison vient quand les deux redeviennent deux adultes qui s'aident, et non plus un soignant et un soigné.",
    theologie: "Osée porte Gomer. Dieu lui demande de l'aimer. Mais Dieu ne lui demande pas de s'oublier. Le vrai modèle biblique n'est pas médecin-patient — c'est deux personnes qui se portent mutuellement. La grâce de Dieu restaure, mais elle ne supprime pas la responsabilité du blessé." },
  "Isaac-Sarah": { ref: "Genèse 17-22", color: C.blue, titre: "L'Enfant-Possession",
    mecanisme: "L'attente longue ou les conditions exceptionnelles de la naissance transforment l'amour parental en possession. L'enfant ne peut pas grandir sans briser quelque chose dans le parent. Le couple passe au second plan derrière 'mon enfant'.",
    signaux: ["ma belle-mère traite son fils comme son mari", "enfant unique", "enfant après des années d'attente", "mon conjoint ne peut rien refuser à son enfant"],
    dimsFaibles: ["heritage", "intimite"], orientation: "Aimer sans fusionner. Redéfinir le couple comme centre. L'enfant a besoin de parents qui s'aiment — pas de parents qui le possèdent." },
  "Éli-ses fils": { ref: "1 Samuel 2-3", color: C.red, titre: "L'Autorité Qui Ne Peut Discipliner",
    mecanisme: "Le parent sait que l'enfant a tort mais ne peut pas exercer l'autorité nécessaire — par peur, par culpabilité, par évitement. Il justifie, minimise, ou se tait. L'enfant grandit sans frontières. Le couple se divise sur l'éducation sans jamais le résoudre.",
    signaux: ["ses parents justifient tout", "ma belle-famille me contredit devant les enfants", "il ne supporte pas d'entendre son enfant pleurer", "nous ne nous accordons jamais sur l'éducation"],
    dimsFaibles: ["gouvernance", "famille"], orientation: "Réappropriation de l'autorité parentale. Les frontières fermes et aimantes sont un acte d'amour. Un enfant sans limites n'est pas un enfant libre — c'est un enfant en danger." },
  // ─── 3 archétypes théologiques avancés ────────────────────────────────────
  "Nabal-Abigaël": { ref: "1 Samuel 25", color: C.gold, titre: "L'Injustice et la Compensation", genreNeutre: true,
    mecanisme: "L'un des conjoints est dans l'injustice — non pas la méchanceté de caractère, mais l'incapacité à discerner la justice divine : il/elle ne reconnaît pas ce qu'il/elle doit à l'autre, prend sans donner, agit sans consulter, est aveugle à la valeur et au travail de son partenaire. Nabal n'est pas fou — son nom signifie l'insensé, celui qui ne voit pas ce que Dieu voit. L'autre conjoint compense en silence : il/elle porte la justice du foyer, gère les crises, protège la maison des conséquences.",
    signaux: ["je dois tout gérer parce que lui/elle ne voit pas les conséquences", "il/elle ne sait même pas ce que j'ai fait pour éviter le désastre", "dans les crises c'est toujours moi qui intervient", "il/elle pense que tout va bien alors que tout craque", "je ne peux pas compter sur lui/elle pour les décisions importantes", "pourquoi est-ce que je dois toujours réparer ses erreurs"],
    dimsFaibles: ["gouvernance", "intimite", "communication", "vision", "spiritualite"],
    orientation: "1. Révélation pour celui qui compense : sa sagesse qui protège tout le monde est aussi ce qui empêche l'autre de voir la réalité. 2. Il doit cesser de protéger et laisser la conséquence arriver. 3. Révélation pour celui dans l'injustice : il doit voir le travail invisible de l'autre, reconnaître ce qui est dû, demander pardon. 4. Restauration de la justice : nouvelle gouvernance où l'un a l'autorité ET la sagesse, l'autre a une voix consultée et écoutée.",
    theologie: "Nabal n'est pas méchant au sens moral. Il est dans l'injustice divine — incapable de voir ce que David a fait pour lui, ce que sa femme fait pour lui, ce que Dieu fait. La guérison ne vient pas d'un redressement brutal mais d'une révélation : voir ce qu'on ne voyait pas." },
  "Abraham-Sarah": { ref: "Genèse 12:10-20, Genèse 20", color: C.blue, titre: "La Valeur Exhibée", genreNeutre: true,
    mecanisme: "L'un des conjoints possède une 'valeur extérieure' que l'autre ne se sent pas d'avoir — beauté, intelligence, réussite sociale, réseau, diplômes, charisme. Le conjoint qui se sent en déficit utilise cette valeur pour obtenir reconnaissance, acceptation ou sécurité : il/elle présente l'autre comme un trophée. Celui qui est 'exhibé' finit par se sentir objet — son identité profonde n'est jamais aimée, seulement sa valeur extérieure.",
    signaux: ["il/elle ne m'aime que pour ce que j'apporte", "je ne serais rien sans lui/elle", "on ne me voit pas, on voit mon corps/mon argent/mon statut", "j'ai peur qu'il/elle parte si je perds ce que j'ai", "sans moi il/elle ne serait pas accepté(e)", "ma réussite est liée à qui il/elle est, pas à ce que je vaux"],
    dimsFaibles: ["intimite", "gouvernance", "vision", "spiritualite"],
    orientation: "1. Révélation pour celui qui exhibe : tu n'aimes pas ton conjoint, tu aimes ce qu'il/elle t'apporte. 2. Révélation pour celui qui est exhibé : tu n'as pas à performer ta valeur pour être aimé. 3. Restauration : apprendre à s'aimer au-delà des valeurs extérieures.",
    theologie: "Abraham avait peur. Il utilisait Sarah pour se protéger. Pas par méchanceté — par peur. Dieu a dû intervenir deux fois pour révéler le système." },
  "David-Saül": { ref: "1 Samuel 18-19, 24, 26", color: C.orange, titre: "Le Supérieur Menacé", genreNeutre: true, urgence: true,
    mecanisme: "L'un des conjoints a une position d'autorité établie. L'autre commence à briller. Le supérieur ne supporte pas que l'autre soit plus célébré. Ce n'est pas une compétition active — c'est l'existence même du succès de l'autre qui devient insupportable.",
    signaux: ["il/elle me fait de l'ombre", "tout le monde l'aime plus que moi", "il/elle veut ma place", "je dois cacher mes réussites pour ne pas le/la blesser", "plus je réussis, plus il/elle me hait", "pourquoi tout le monde le/la préfère", "je dois réparer ses bêtises", "il est devenu acariâtre depuis que j'ai été promue"],
    dimsFaibles: ["gouvernance", "intimite", "communication", "vision"],
    orientation: "1. Le supérieur doit reconnaître que la menace n'est pas réelle — c'est son insécurité. 2. Le subordonné ne doit pas s'effacer. 3. Si la femme gagne plus : elle n'a pas à s'excuser de réussir, mais garder l'humilité. 4. Restauration : deux forces complémentaires, pas deux ennemis.",
    theologie: "Saül avait tout. Mais son identité était dans sa position, pas dans qui il était. David ne voulait pas sa place. La jalousie hiérarchique se calme quand le supérieur trouve son identité en Dieu, pas dans son rang." }
};

const QUESTIONS_EAUX = [
  { id: "e1", bloc: 1, type: "choix", question: "Dans votre famille d'origine, l'amour s'exprimait principalement…", options: [
    { val: "paroles", label: "Par des mots d'affection, d'encouragement, de reconnaissance" },
    { val: "actes", label: "Par des actes concrets — cuisiner, travailler, donner, protéger" },
    { val: "cadeaux", label: "Par des attentions matérielles et des cadeaux" },
    { val: "temps", label: "Par la présence et le temps passé ensemble" },
    { val: "absent", label: "L'amour ne s'exprimait pas vraiment de manière visible" }
  ] },
  { id: "e2", bloc: 1, type: "choix_ouvert", question: "Quel rang occupez-vous dans votre fratrie ?", options: [
    { val: "aine", label: "Aîné(e)" }, { val: "milieu", label: "Enfant du milieu" }, { val: "benjamin", label: "Benjamin(e)" }, { val: "unique", label: "Enfant unique" }, { val: "autre", label: "Autre situation familiale" }
  ], followUp: "Décrivez en deux ou trois phrases ce que ce rang signifiait concrètement dans votre famille." },
  { id: "e3", bloc: 1, type: "choix", question: "Comment les conflits se terminaient-ils généralement dans votre famille ?", options: [
    { val: "reconciliation", label: "On se réconciliait ouvertement" }, { val: "temps", label: "Le calme revenait avec le temps, sans vraiment en reparler" }, { val: "surface", label: "Les tensions restaient présentes longtemps sous la surface" }, { val: "silence", label: "Les conflits n'étaient pas visibles — on n'en parlait pas" }
  ] },
  { id: "e4", bloc: 1, type: "choix", question: "La figure paternelle dans votre vie était…", options: [
    { val: "present_stable", label: "Présente, stable, et impliquée dans votre vie quotidienne" }, { val: "present_distant", label: "Présente physiquement mais peu disponible émotionnellement" }, { val: "irregulier", label: "Présente par moments, absente par moments" }, { val: "absent_travail", label: "Absente la plupart du temps pour raisons professionnelles" }, { val: "absent_definitif", label: "Absente de façon définitive — décès, séparation, abandon" }
  ] },
  { id: "e5", bloc: 1, type: "choix", question: "La figure maternelle dans votre vie était…", options: [
    { val: "presente_aimante", label: "Présente, stable, et aimante dans le quotidien" }, { val: "presente_distante", label: "Présente physiquement mais peu disponible émotionnellement" }, { val: "irreguliere", label: "Présente par moments, absente par moments" }, { val: "absente", label: "Absente la plupart du temps" }, { val: "absente_definitive", label: "Absente de façon définitive" }
  ] },
  { id: "e6", bloc: 2, type: "choix_ouvert", question: "Y a-t-il une personne de votre enfance à laquelle vous pensez avec une douleur encore présente ?", options: [
    { val: "oui_actif", label: "Oui, et cette douleur est encore bien présente" }, { val: "oui_paix", label: "Oui, mais j'ai fait la paix avec ça" }, { val: "incertain", label: "Je ne suis pas sûr(e)" }, { val: "non", label: "Non" }
  ], followUp: "Sans nommer la personne, quel type de relation était-ce ? Et qu'est-ce que cette douleur vous a appris sur vous-même ?", condition: (val) => val === "oui_actif" || val === "oui_paix" },
  { id: "e13", bloc: 2, type: "choix_ouvert", question: "Comment décririez-vous la relation entre vos parents — ou les figures parentales que vous avez observées ?", options: [
    { val: "amour_visible", label: "Ils s'aimaient visiblement — respect, tendresse, complicité" }, { val: "coexistence", label: "Ils coexistaient correctement — sans conflit majeur mais sans chaleur" }, { val: "tensions", label: "Il y avait des tensions régulières" }, { val: "souffrance", label: "La relation était marquée par une souffrance visible" }, { val: "separes", label: "Je n'ai pas vu mes parents ensemble" }
  ], followUp: "Qu'est-ce que cette relation vous a appris — consciemment ou non — sur ce qu'est un couple ?" },
  { id: "e14", bloc: 2, type: "choix", question: "Quelle place la foi occupait-elle dans votre maison d'enfance ?", options: [
    { val: "centrale_vecue", label: "La foi était centrale et vécue au quotidien" }, { val: "rituelle", label: "La foi était présente dans les rituels — église, fêtes — mais peu vécue" }, { val: "personnelle", label: "La foi était une affaire personnelle de certains membres" }, { val: "absente", label: "La foi n'avait pas vraiment de place dans notre foyer" }, { val: "autre_spirituel", label: "Il y avait des pratiques spirituelles différentes" }
  ] },
  { id: "e7", bloc: 3, type: "choix_ouvert", question: "Y a-t-il une personne de votre enfance que vous portez avec gratitude ?", options: [
    { val: "oui_clair", label: "Oui, clairement" }, { val: "oui_plusieurs", label: "Plusieurs personnes" }, { val: "pas_vraiment", label: "Pas vraiment" }, { val: "non", label: "Non" }
  ], followUp: "Qu'est-ce que cette personne vous a donné — même sans le savoir — que vous portez encore aujourd'hui ?", condition: (val) => val === "oui_clair" || val === "oui_plusieurs" },
  { id: "e8", bloc: 3, type: "ouvert", question: "Y a-t-il un événement de votre vie — heureux ou douloureux — qui a changé profondément qui vous êtes ?", placeholder: "Décrivez brièvement cet événement et ce qu'il a changé en vous…" },
  { id: "e9", bloc: 4, type: "ouvert", question: "Dans votre famille, y avait-il des règles, des valeurs ou des façons de faire que tout le monde suivait sans les questionner ?", placeholder: "Quelles étaient ces règles ou valeurs ? Comment se manifestaient-elles ?" },
  { id: "e10", bloc: 4, type: "ouvert", question: "Y a-t-il quelque chose dans votre histoire familiale que vous observez se répéter dans vos propres comportements ?", placeholder: "Décrivez ce schéma en vos propres mots…" },
  { id: "e11", bloc: 4, type: "ouvert", question: "Y a-t-il quelque chose de beau dans votre histoire familiale — une force, une valeur, une grâce — que vous voulez préserver ?", placeholder: "Quelle est cette force ou cette grâce ?" },
  { id: "e12", bloc: 4, type: "ouvert_court", question: "Si vous deviez décrire l'atmosphère générale de votre maison d'enfance en un seul mot ou une image…", placeholder: "Un mot ou une image…" },
  { id: "e16", bloc: 5, type: "choix_multi", question: "En regardant honnêtement votre histoire familiale sur plusieurs générations, observez-vous l'un de ces schémas récurrents ?", options: [
    { val: "mariages_echecs", label: "Des mariages qui échouent de la même façon" }, { val: "deuils", label: "Des deuils prématurés ou des morts au même âge" }, { val: "finances", label: "Des problèmes financiers qui reviennent malgré les efforts" }, { val: "ruptures", label: "Des ruptures ou des trahisons qui se répètent" }, { val: "addictions", label: "Des comportements ou des addictions qui traversent les générations" }, { val: "aucun", label: "Je n'observe pas de schéma particulier" }, { val: "ne_sait_pas", label: "Je n'ai pas assez d'informations sur mon histoire familiale" }
  ], followUp: "Si vous avez observé un schéma, décrivez-le brièvement.", condition: (vals) => vals && !vals.includes("aucun") && !vals.includes("ne_sait_pas") },
  { id: "e17", bloc: 5, type: "choix_ouvert", question: "La famille dans laquelle vous avez grandi avait-elle des pratiques spirituelles particulières ?", options: [
    { val: "chretien_pratiquant", label: "Foyer chrétien pratiquant — la foi était vécue et enseignée" }, { val: "chretien_nominal", label: "Foyer chrétien nominal — église les dimanches mais peu de vécu" }, { val: "traditionnel", label: "Foyer avec des pratiques traditionnelles — rituels, protection ancestrale" }, { val: "mixte", label: "Foyer mixte — plusieurs religions ou pratiques coexistaient" }, { val: "sans_pratique", label: "Foyer sans pratique spirituelle particulière" }, { val: "ne_sait_pas", label: "Je ne sais pas vraiment" }
  ], followUp: "Y a-t-il des pratiques, des alliances ou des engagements pris dans votre famille dont vous n'avez jamais vraiment évalué l'impact ?" }
];

const QUESTIONS_OS_COUPLE = [
  { id: "o1", bloc: 1, type: "ouvert", question: "Si vous deviez défendre une seule chose dans votre vie quoi qu'il arrive — une valeur absolue — quelle serait-elle ?", placeholder: "Nommez cette valeur en vos propres mots…" },
  { id: "o2", bloc: 1, type: "choix", question: "Y a-t-il quelque chose que vous avez déjà fait dans votre relation qui contredisait vos valeurs profondes ?", options: [
    { val: "oui_pese", label: "Oui, et ça me pèse encore aujourd'hui" }, { val: "oui_paix", label: "Oui, mais j'ai fait la paix avec ça" }, { val: "parfois", label: "Parfois, dans des petites choses" }, { val: "non", label: "Non, je reste cohérent avec mes valeurs" }
  ] },
  { id: "o3", bloc: 2, type: "ouvert", question: "Dans cinq ans, quelle image de votre foyer vous donne de la joie quand vous y pensez ?", placeholder: "Décrivez cette image en quelques phrases…" },
  { id: "o4", bloc: 2, type: "choix", question: "Avez-vous l'impression que votre conjoint(e) et vous construisez vers le même horizon ?", options: [
    { val: "meme_direction", label: "Nous construisons clairement ensemble vers la même direction" }, { val: "rythmes_differents", label: "Nous avons une direction commune mais nos rythmes diffèrent" }, { val: "incertain", label: "Je ne suis pas toujours sûr(e) que nous allons au même endroit" }, { val: "directions_differentes", label: "Nous semblons aller dans des directions différentes" }
  ] },
  { id: "o5", bloc: 3, type: "ouvert", question: "Complétez cette phrase : 'Pour moi, être vraiment aimé(e), c'est quand…'", placeholder: "Complétez en une ou deux phrases sincères…" },
  { id: "o6", bloc: 3, type: "choix", question: "Au fond de vous, croyez-vous que vous méritez pleinement l'amour — sans avoir à le mériter ?", options: [
    { val: "oui_profond", label: "Oui, profondément et sans hésitation" }, { val: "oui_theorie", label: "Oui en théorie, mais j'ai du mal à le ressentir vraiment" }, { val: "parfois_non", label: "Pas toujours — je sens que je dois mériter ma place" }, { val: "non", label: "Non, j'ai du mal à croire que je mérite d'être aimé(e) gratuitement" }
  ] },
  { id: "o7", bloc: 4, type: "choix", question: "Votre foi influence-t-elle concrètement les décisions que vous prenez dans votre relation ?", options: [
    { val: "guide_activement", label: "Oui, ma foi guide activement mes décisions" }, { val: "guide_partiellement", label: "Ma foi guide certaines décisions mais pas toutes" }, { val: "moins_concret", label: "Ma foi est présente mais moins concrète dans le quotidien du couple" }, { val: "separes", label: "Ma foi et ma vie de couple fonctionnent souvent séparément" }
  ] },
  { id: "o8", bloc: 5, type: "choix", question: "Pour vous, un mariage réussi c'est principalement…", options: [
    { val: "stabilite", label: "Un foyer stable et paisible où chacun est à sa place" }, { val: "alliance", label: "Une alliance spirituelle qui honore Dieu et laisse un héritage" }, { val: "croissance", label: "Une relation où deux personnes grandissent et s'accomplissent" }, { val: "loyaute", label: "Un engagement de loyauté absolue quoi qu'il arrive" }, { val: "famille", label: "Une famille unie qui protège et élève les enfants" }
  ] },
  { id: "o9", bloc: 5, type: "ouvert", question: "Y a-t-il quelque chose que vous ne seriez jamais prêt(e) à accepter dans votre relation — une limite absolue ?", placeholder: "Nommez cette limite en vos propres mots…" },
  { id: "o10", bloc: 5, type: "ouvert", question: "Si vous pouviez transmettre une seule conviction sur l'amour et le mariage à quelqu'un qui commence, quelle serait-elle ?", placeholder: "Quelle est cette conviction profonde ?" }
];

const QUESTIONS_OS_CELIBATAIRE = [
  { id: "oc1", bloc: 1, type: "ouvert", question: "Si vous pensez à l'idée de vous engager dans un mariage, qu'est-ce qui vous vient en premier : l'enthousiasme ou la peur ? Décrivez." },
  { id: "oc2", bloc: 2, type: "choix", question: "Y a-t-il des convictions profondes sur le mariage que vous avez héritées de votre famille et que vous n'avez jamais vraiment questionnées ?", options: [
    { val: "plusieurs_non_choisi", label: "Oui, plusieurs – je ne les ai jamais vraiment questionnées" },
    { val: "une_seule", label: "Oui, une en particulier" },
    { val: "peut_etre", label: "Peut-être, je n'y ai pas vraiment réfléchi" },
    { val: "non", label: "Non, j'ai construit mes propres convictions" }
  ] },
  { id: "oc3", bloc: 3, type: "ouvert", question: "Complétez : 'Pour moi, un foyer idéal ressemble à…'", placeholder: "Une image, quelques mots…" },
  { id: "oc4", bloc: 3, type: "choix", question: "Avez-vous déjà eu une conviction profonde sur ce que vous vouliez dans une relation, puis trahi cette conviction sous la pression émotionnelle ?", options: [
    { val: "oui_plusieurs", label: "Oui, plusieurs fois" }, { val: "oui_une", label: "Oui, une fois marquante" }, { val: "compromis", label: "J'ai eu des compromis mais sans vraiment trahir ce que je croyais" }, { val: "non", label: "Non, je n'ai pas encore vécu ça" }
  ] },
  { id: "oc5", bloc: 4, type: "choix", question: "En ce moment, votre vie quotidienne reflète-t-elle vraiment ce que vous croyez sur l'amour et le mariage ?", options: [
    { val: "coherent", label: "Oui, ma vie est cohérente avec ce que je crois" }, { val: "partiellement", label: "Partiellement — il y a des écarts que je reconnais" }, { val: "pas_vraiment", label: "Pas vraiment — je vis différemment de ce que je crois" }, { val: "incertain", label: "Je ne suis pas encore sûr(e) de ce que je crois vraiment" }
  ] },
  { id: "oc6", bloc: 5, type: "ouvert", question: "Qu'est-ce que vous voulez que votre futur(e) conjoint(e) dise de vous dans dix ans ?", placeholder: "Quelle personne voulez-vous être dans les yeux de l'autre ?" }
];

const PROFIL_APPRECIATION_OPTIONS = [
  { id: "paroles", icon: "◈", label: "Que cette personne me dise clairement ce qu'elle apprécie en moi" },
  { id: "temps", icon: "◆", label: "Que cette personne me consacre du temps de qualité, vraiment présente" },
  { id: "cadeaux", icon: "◉", label: "Que cette personne pense à moi à travers un geste ou un cadeau attentionné" },
  { id: "actes", icon: "◎", label: "Que cette personne fasse quelque chose de concret pour me faciliter la vie" },
  { id: "toucher", icon: "◐", label: "Que cette personne me touche — une main posée, une accolade, une présence physique" }
];

const SCENARIOS_ATTACHEMENT = [
  { id: "a1", scenario: "Vous envoyez un message important à votre conjoint(e). Deux heures passent sans réponse. Votre réaction naturelle est…", reponses: [
    { val: "secure", label: "Je me demande s'il/elle va bien, puis je passe à autre chose en attendant" },
    { val: "anxieux", label: "Je commence à m'inquiéter, je renvoie un message, j'ai du mal à me concentrer" },
    { val: "evitant", label: "Je remarque l'absence mais je préfère ne pas insister — il/elle répondra quand il/elle voudra" },
    { val: "desorganise", label: "Quelque chose en moi se ferme, je ne sais pas si c'est de la colère ou de l'inquiétude" }
  ] },
  { id: "a2", scenario: "Votre conjoint(e) vous dit qu'il/elle a besoin de passer du temps seul(e) ce week-end. Votre réaction est…", reponses: [
    { val: "secure", label: "Je comprends, j'organise quelque chose de mon côté, c'est bien pour nous deux" },
    { val: "anxieux", label: "J'acquiesce mais je me demande si j'ai fait quelque chose de mal" },
    { val: "evitant", label: "Je suis soulagé(e) — j'avais aussi besoin de mon espace" },
    { val: "desorganise", label: "Je veux lui dire oui mais quelque chose en moi résiste sans que je comprenne pourquoi" }
  ] },
  { id: "a3", scenario: "Après une dispute sérieuse, votre premier réflexe est…", reponses: [
    { val: "secure", label: "Laisser passer un peu de temps puis revenir pour parler calmement" },
    { val: "anxieux", label: "Avoir besoin que les choses soient résolues rapidement — le silence m'est insupportable" },
    { val: "evitant", label: "Prendre de la distance pour réfléchir seul(e) avant de revenir" },
    { val: "desorganise", label: "Hésiter entre vouloir résoudre et vouloir fuir — sans savoir quoi faire de l'émotion" }
  ] },
  { id: "a4", scenario: "Votre conjoint(e) vous exprime une critique sur quelque chose que vous avez fait. Votre réaction est…", reponses: [
    { val: "secure", label: "Je l'écoute, je réfléchis, je peux l'accepter si c'est juste" },
    { val: "anxieux", label: "Je me sens touché(e) — une partie de moi craint que ça change ce qu'il/elle pense de moi" },
    { val: "evitant", label: "Je me ferme légèrement — j'ai besoin de traiter ça seul(e) avant de répondre" },
    { val: "desorganise", label: "Une réaction forte monte en moi — défensive ou effondrée — avant même que j'aie réfléchi" }
  ] }
];

const QUESTIONS_CHAIR = [
  { id: "ch1", bloc: 3, type: "likert", question: "Quand je suis blessé(e), j'exprime ce que je ressens clairement plutôt que de me fermer ou d'attaquer.", scale: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"] },
  { id: "ch2", bloc: 3, type: "likert", question: "Dans un désaccord, j'arrive à écouter vraiment le point de vue de l'autre avant de répondre.", scale: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"] },
  { id: "ch3", bloc: 3, type: "likert", question: "Je dis ce que je pense vraiment, même quand c'est inconfortable — je ne laisse pas le silence parler à ma place.", scale: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"] },
  { id: "ch4", bloc: 3, type: "likert", question: "Après un conflit, je fais naturellement le premier pas vers la réconciliation.", scale: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"] },
  { id: "ch5", bloc: 3, type: "likert", question: "Ma manière d'exprimer ma frustration ou ma colère ne blesse pas et n'écrase pas l'autre.", scale: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"] },
  { id: "ch6", bloc: 4, type: "likert", question: "Je me ressource principalement dans le calme et la solitude — les interactions prolongées me fatiguent.", scale: ["Pas du tout", "Peu", "Moyennement", "Beaucoup", "Totalement"] },
  { id: "ch7", bloc: 4, type: "likert", question: "Face à un problème, j'analyse d'abord logiquement avant de considérer la dimension émotionnelle.", scale: ["Pas du tout", "Peu", "Moyennement", "Beaucoup", "Totalement"] },
  { id: "ch8", bloc: 4, type: "likert", question: "J'ai besoin que les choses soient organisées et prévisibles — l'improvisation me déstabilise.", scale: ["Pas du tout", "Peu", "Moyennement", "Beaucoup", "Totalement"] },
  { id: "ch9", bloc: 4, type: "likert", question: "Je m'adapte facilement à ce qui n'était pas prévu sans que cela perturbe mon équilibre.", scale: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"] }
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3 — DONNÉES FEATURES (FAÇADE, VIOLENCE, PATTERNS)
// ═══════════════════════════════════════════════════════════════════════════
const AVEU_QUESTIONS = {
  marie: { q: ["m4", "m6", "m9", "m13", "m24", "m26", "m28", "m37", "m42", "m44", "m45", "m46", "m47", "m48", "m49"] },
  fiance: { q: ["f3", "f14", "f19", "f21", "f25", "f29", "f31", "f33", "f34", "f37", "f40", "f46", "f49"] },
  celibataire: { q: ["c7", "c9", "c14", "c20", "c22", "c28", "c30", "c38", "c39", "c43", "c46"] }
};

const VIOLENCE_TRIGGERS = {
  marie: [ { id: "m29", threshold: 3 }, { id: "m46", threshold: 4 }, { id: "m27", threshold: 4 } ],
  fiance: [ { id: "f34", threshold: 3 }, { id: "f32", threshold: 4 }, { id: "f38", threshold: 3 } ],
  celibataire: [ { id: "c43", threshold: 4 } ]
};

const MICRO_PERTES_MAP = {
  communication: { low: ["Les conversations de fond que vous n'avez plus le soir", "La paix de vous sentir vraiment entendu(e)", "Les décisions importantes prises sans vous"] },
  intimite: { low: ["La légèreté d'être pleinement vous-même à la maison", "Le regard complice que vous ne cherchez plus", "L'énergie gaspillée à maintenir une distance non dite"] },
  gouvernance: { low: ["L'unité de front devant vos enfants", "Le sentiment d'avancer dans la même direction", "La confiance de savoir qui décide quand"] },
  vision: { low: ["L'excitation de construire quelque chose ensemble", "Un projet commun qui vous lève le matin", "Le sentiment que votre couple a un sens"] },
  spiritualite: { low: ["La paix d'un foyer ancré dans quelque chose de plus grand", "La force d'une prière commune dans les moments difficiles", "La certitude que Dieu est au centre de vos décisions"] },
  conflits: { low: ["L'énergie émotionnelle consumée par les mêmes disputes", "Les nuits apaisées après un vrai pardon", "La liberté de vous exprimer sans craindre une tempête"] }
};

const VERDICTS_3_MOTS = {
  "80-100": ["Fondation qui tient", "Couple debout ensemble", "Ancrage à protéger"],
  "65-79": ["Vigilance bien portée", "Fissures à traiter", "Solidité à consolider"],
  "50-64": ["Tension qui s'installe", "Distance qui grandit", "Silence qui pèse"],
  "35-49": ["Fracture en progression", "Crise qui couve", "Urgence ignorée"],
  "0-34": ["Rupture en marche", "Désert de connexion", "Intervention requise maintenant"]
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4 — UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════
function genCode() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) {
    if (i === 4) s += "-";
    s += c[Math.floor(Math.random() * c.length)];
  }
  return s;
}

function pct(score, max) { return Math.round((score / max) * 100); }

function lvl(p) {
  if (p >= 80) return { l: "Excellent", c: C.green };
  if (p >= 65) return { l: "Stable", c: "#7AAB6A" };
  if (p >= 50) return { l: "Fragile", c: C.gold };
  if (p >= 35) return { l: "Critique", c: C.orange };
  return { l: "Urgence", c: C.red };
}

function computeIndices(scores, profil) {
  const map = INDICES_MAP[profil];
  if (!map) return null;
  const result = {};
  Object.entries(map).forEach(([key, def]) => {
    const vals = def.dims.map(d => scores[d]?.p || 0).filter(v => v > 0);
    if (vals.length === 0) return;
    result[key] = { label: def.label, p: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length), color: def.color };
  });
  return result;
}

function computePatterns(ans, profil) {
  const raw = (ids) => {
    const vals = ids.map(id => ans[id]).filter(v => v !== undefined);
    if (!vals.length) return null;
    return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length * 20);
  };

  const rawLow = (ids) => {
    const vals = ids.map(id => ans[id]).filter(v => v !== undefined);
    if (!vals.length) return null;
    return Math.round((6 - vals.reduce((s, v) => s + v, 0) / vals.length) * 20);
  };

  const rawMix = (invIds, normalIds) => {
    const s1 = raw(invIds);
    const s2 = rawLow(normalIds);
    if (s1 === null && s2 === null) return null;
    const vals = [s1, s2].filter(v => v !== null);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  };

  const patterns = {};

  if (profil === "marie") {
    const ae = raw(["m9", "m10", "m11"]);
    if (ae !== null && ae > 40) patterns["Adam-Eve"] = ae;

    const sd = raw(["m27", "m29", "m46"]);
    if (sd !== null && sd > 40) patterns["Samson-Dalila"] = sd;

    const as = raw(["m44"]);
    if (as !== null && as > 50) patterns["Ananias-Saphira"] = as;

    const ir = raw(["m40", "m42"]);
    if (ir !== null && ir > 40) patterns["Isaac-Rebecca"] = ir;

    const aj = raw(["m45", "m46"]);
    if (aj !== null && aj > 55) patterns["Achab-Jezabel"] = aj;

    const tr = raw(["m47"]);
    if (tr !== null && tr > 55) patterns["Transmission"] = tr;

    const sm_raw = raw(["m49", "m45", "m47"]);
    if (sm_raw !== null && sm_raw > 55) patterns["Saul-Michal"] = sm_raw;

    const ca = raw(["m26", "m45"]);
    if (ca !== null && ca > 60) patterns["Cain-Abel"] = ca;

    const jf_inv = raw(["m48", "m13", "m28"]);
    const jf_low = rawLow(["m33"]);
    const jf = (jf_inv !== null && jf_low !== null) ? Math.round((jf_inv * 2 + jf_low) / 3) : jf_inv;
    if (jf !== null && jf > 58) patterns["Job-femme"] = jf;

    const og_inv = raw(["m37", "m13", "m28"]);
    const og_low = rawLow(["m38", "m22", "m35"]);
    const og_score = (og_inv !== null && og_low !== null) ? Math.round((og_inv * 0.5 + og_low * 0.5)) : null;
    const m37_val = ans["m37"] || 0;
    if (og_score !== null && og_score > 60 && m37_val >= 3) patterns["Osee-Gomer"] = og_score;

    const is_inv = raw(["m42"]);
    const is_low = rawLow(["m39"]);
    const is_score = (is_inv !== null && is_low !== null) ? Math.round((is_inv + is_low) / 2) : is_inv;
    const m42_val = ans["m42"] || 0;
    if (is_score !== null && is_score > 60 && m42_val >= 3) patterns["Isaac-Sarah"] = is_score;

    return patterns;
}

function parseReport(text) {
  if (!text || text.length < 10) return [{ title: "", body: text || "" }];
  const headings = [];
  const re = /\*\*([^*\n]+)\*\*/g;
  let m;
  while ((m = re.exec(text)) !== null) headings.push({ idx: m.index, end: m.index + m[0].length, title: m[1].trim() });
  if (headings.length === 0) return [{ title: "", body: text.trim() }];
  return headings.map((h, i) => {
    const next = headings[i + 1];
    const body = text.slice(h.end, next ? next.idx : undefined).replace(/\*\*(.*?)\*\*/g, "$1").trim();
    return { title: h.title, body };
  }).filter(s => s.body.length > 0);
}

function computeFacadeScore(ans, profil) {
  const aveuQs = AVEU_QUESTIONS[profil]?.q || [];
  const allVals = Object.values(ans).filter(v => v !== undefined && typeof v === "number");
  if (allVals.length === 0) return null;
  const globalAvg = allVals.reduce((s, v) => s + v, 0) / allVals.length;
  const aveuVals = aveuQs.map(q => ans[q]).filter(v => v !== undefined);
  if (aveuVals.length === 0) return null;
  const aveuAvg = aveuVals.reduce((s, v) => s + v, 0) / aveuVals.length;
  const variance = allVals.reduce((s, v) => s + Math.pow(v - globalAvg, 2), 0) / allVals.length;
  const highGlobal = globalAvg >= 3.8;
  const lowVariance = variance < 0.8;
  const aveux = aveuAvg >= 2.8;
  let score = 0;
  if (highGlobal && lowVariance) score += 40;
  if (highGlobal && aveux) score += 35;
  if (lowVariance && variance < 0.4) score += 25;
  const perfect5 = allVals.filter(v => v === 5).length;
  if (perfect5 / allVals.length > 0.6) score += 20;
  score = Math.min(100, score);
  return {
    score, globalAvg: Math.round(globalAvg * 10) / 10, variance: Math.round(variance * 10) / 10, aveuAvg: Math.round(aveuAvg * 10) / 10,
    level: score >= 70 ? "forte" : score >= 40 ? "modérée" : "faible",
    message: score >= 70 ? "Votre bilan révèle une tension entre votre image globale et vos réponses spécifiques. Un rapport trop positif ne vous servira pas." : score >= 40 ? "Quelques incohérences subtiles apparaissent. Revenez sur certaines réponses avec plus de nuance." : null
  };
}

function checkViolenceSignals(ans, profil) {
  const triggers = VIOLENCE_TRIGGERS[profil] || [];
  const detected = triggers.filter(t => (ans[t.id] || 0) >= t.threshold);
  return detected.length > 0 ? detected : null;
}

function computeRelationshipClock(gp, patterns, annees, profil) {
  if (profil !== "marie") return null;
  const years = parseInt(annees) || 0;
  const criticalPatterns = ["Samson-Dalila", "Achab-Jezabel", "Transmission"];
  const activeCritical = Object.keys(patterns || {}).filter(p => criticalPatterns.includes(p) && (patterns[p] || 0) > 40);
  let baseDecline = 1.2;
  let patternMult = 1 + (activeCritical.length * 0.18);
  let yearsMult = years > 10 ? 1.15 : years > 5 ? 1.05 : 1.0;
  const effectiveDecline = baseDecline * patternMult * yearsMult;
  const pointsToRupture = gp - 25;
  const yearsToRupture = pointsToRupture / effectiveDecline;
  if (gp >= 75 || gp <= 35) return null;
  const months = Math.round(yearsToRupture * 12);
  return { months: Math.max(6, months), urgency: months <= 18 ? "critique" : months <= 36 ? "élevée" : "modérée", activeCritical, effectiveDecline: Math.round(effectiveDecline * 10) / 10 };
}

function computeAttachementStyle(scenarioAnswers) {
  if (!scenarioAnswers || Object.keys(scenarioAnswers).length < 2) return "Non déterminé";
  const counts = { secure: 0, anxieux: 0, evitant: 0, desorganise: 0 };
  Object.values(scenarioAnswers).forEach(v => { if (counts[v] !== undefined) counts[v]++; });
  const max = Math.max(...Object.values(counts));
  const dominant = Object.entries(counts).find(([, v]) => v === max)?.[0];
  const labels = {
    secure: "Sécure — connexion naturelle et confiance dans le lien",
    anxieux: "Anxieux-préoccupé — besoin de réassurance, sensible à la distance",
    evitant: "Évitant-détaché — besoin d'espace, difficulté avec la proximité profonde",
    desorganise: "Désorganisé — réponses mixtes, tension entre rapprochement et fuite",
  };
  return labels[dominant] || "Non déterminé";
}

function getVerdict3Mots(gp) {
  const key = gp >= 80 ? "80-100" : gp >= 65 ? "65-79" : gp >= 50 ? "50-64" : gp >= 35 ? "35-49" : "0-34";
  const verdicts = VERDICTS_3_MOTS[key];
  return verdicts[Math.floor(Math.random() * verdicts.length)];
}

function buildDiagnosticPrompt(name, profil, genre, role, annees, enfants, scores, opens, bm, patternScores, partnerData) {
  const pl = profil === "marie" ? "Marié(e)" : profil === "fiance" ? "Fiancé(e)" : "Célibataire";
  const dimsFormatted = Object.entries(scores).map(([k, v]) => {
    const b = bm[k];
    const delta = b ? (v.p - b.stable) : null;
    const ecart = delta !== null ? ` (${delta >= 0 ? "+" : ""}${delta} pts vs référence)` : "";
    const alerte = v.p < 40 ? " ⚠ CRITIQUE" : v.p < 55 ? " ⚠ FRAGILE" : "";
    return ` • ${v.label} : ${v.p}/100${ecart} — ${v.lv.l}${alerte}`;
  }).join("\n");
  const activePatterns = patternScores ? Object.entries(patternScores).filter(([, v]) => v > 40).sort(([, a], [, b]) => b - a).map(([k, v]) => `${k} (${v}/100 — ${v > 70 ? "DOMINANT" : "émergent"})`) : [];
  const patSection = activePatterns.length > 0
    ? `\nPATTERNS ARCHÉTYPAUX DÉTECTÉS (parmi 15 archétypes Eden) :\n ${activePatterns.join("\n ")}`
    : "\nAucun pattern dominant détecté — analyser l'ensemble des données pour identifier le plus probable parmi les 15 archétypes Eden.";
  const rolesArisque = ["PDG", "Entrepreneur", "Cadre", "Officier", "Avocat", "Médecin"];
  const alertes = [];
  if (role && rolesArisque.some(r => role.includes(r))) alertes.push(` SYNDROME DU GÉNÉRAL ABSENT : ${name} exerce un rôle de leadership professionnel intense.`);
  if (profil === "marie" && annees && parseInt(annees) > 10) alertes.push(` DIABÈTE RELATIONNEL (${annees} ans de mariage) : Après 10 ans, la routine peut masquer une dégradation.`);
  if (enfants && parseInt(enfants) >= 2) alertes.push(` RISQUE DE TRIANGULATION (${enfants} enfants).`);
  const alertesSection = alertes.length > 0 ? `\nPOINTS D'ATTENTION :\n${alertes.join("\n")}` : "";
  const opensFiltrees = opens.filter(a => a.ans?.trim());
  const oqSection = opensFiltrees.length > 0 ? opensFiltrees.map(q => ` Q: "${q.q}"\n R: "${q.ans}"`).join("\n\n") : " (Non renseignées)";
  const pData = partnerData ? `\nDONNÉES CONJOINT(E) :\n` + Object.entries(partnerData.scores).map(([k, v]) => ` • ${v.label} : ${v.p}/100`).join("\n") : "";
  const formList = FORMATIONS.filter(f => f.profil.includes(profil)).map(f => ` • "${f.nom}" : ${f.prix}`).join("\n");
  const scoresSorted = Object.entries(scores).sort(([, a], [, b]) => b.p - a.p);
  const top2 = scoresSorted.slice(0, 2).map(([, v]) => `${v.label} (${v.p}/100)`).join(", ");
  const bottom3 = scoresSorted.slice(-3).reverse().map(([, v]) => `${v.label} (${v.p}/100)`).join(", ");
  const scoreGlobal = Math.round(Object.values(scores).reduce((s, v) => s + v.p, 0) / Object.values(scores).length);
  return `Tu es le Conseiller de l'Académie Eden — Institut du Leadership Familial, fondé par Zady Zozoro à Abidjan.\nTon ton : médecin bienveillant — juste, direct, chaleureux.\n\nDONNÉES : ${name} | ${pl} | ${genre || ""}${role ? ` | ${role}` : ""}${annees ? ` | ${annees} ans de mariage` : ""}${enfants ? ` | ${enfants} enfants` : ""}\nSCORE GLOBAL : ${scoreGlobal}/100 | FORCES : ${top2} | FRAGILITÉS : ${bottom3}\nSCORES :\n${dimsFormatted}${patSection}${alertesSection}${pData}\n\nRÉPONSES OUVERTES :\n${oqSection}\n\nFORMATIONS DISPONIBLES :\n${formList}\n\nGÉNÈRE LE RAPPORT — MINIMUM 800 MOTS.\nSections obligatoires avec titres **EN GRAS** :\n**PROFIL ARCHÉTYPAL** — Profil parmi : "Stable mais vulnérable" / "Illusion de paix" / "Désalignement croissant" / "Crise structurelle" / "Urgence conjugale"\n**PHRASE CLÉ** — Une phrase percutante et spécifique à ${name}.\n**VOS FORCES** — Les 2 dimensions les plus élevées. Prénom ${name} au moins 2 fois.\n**VOS FRAGILITÉS CRITIQUES** — Les 2-3 dimensions les plus faibles. Pour chaque : score, blessure sous-jacente, impact concret.\n**PATTERN RELATIONNEL DOMINANT** — Mécanisme précis, antidote biblique.\n**CE QUE VOUS NE VOYEZ PAS ENCORE** — Analyse systémique.\n**TRAJECTOIRE** — Sans action / Avec engagement.\n**PRESCRIPTION** — Formation prescrite avec prix. Plan d'action 7 jours.\nRÈGLES : Prénom ${name} dans chaque section. Ton expert et chaleureux. Références bibliques naturellement intégrées. Jamais de jargon médical ou psychologique clinique.`;
}

function buildPortraitPrompt(nom, profil, eaux, os, chair, appreciation, attachement) {
  const profileLabel = profil === "marie" ? "Marié(e)" : profil === "fiance" ? "Fiancé(e)" : "Célibataire";
  const appreciationPrimaire = appreciation?.recevoir?.[0] || "non renseigné";
  const appreciationDonne = appreciation?.donner?.[0] || "non renseigné";
  const attachementStyle = computeAttachementStyle(attachement);
  const archetypesText = Object.entries(ARCHETYPES).map(([k, v]) => `${k} (${v.titre}) — Signaux : ${v.mecanisme.slice(0, 60)}...`).join("\n");
  return `Tu es le Conseiller de l'Académie Eden, fondé par Zady Zozoro — expert en leadership familial.\n\n═══ RÈGLES ABSOLUES ═══\nINTERDIT : "Vous êtes [trouble/blessure]", "Vous souffrez de...", tout diagnostic médical\nOBLIGATOIRE : "Vos réponses suggèrent...", "Ce profil peut indiquer...", "Il est possible que..."\nCroiser minimum 3 indices avant toute conclusion. Ton : pastoral, bienveillant, autoritaire mais jamais accusateur.\n\n═══ CONTEXTE ═══\nPrénom : ${nom} | Profil : ${profileLabel}\n\n═══ LES EAUX ═══\n- Amour exprimé par : ${eaux.e1 || "non renseigné"}\n- Rang fratrie : ${eaux.e2 || "non renseigné"} — ${eaux.e2_open || ""}\n- Conflits familiaux : ${eaux.e3 || "non renseigné"}\n- Figure paternelle : ${eaux.e4 || "non renseigné"}\n- Figure maternelle : ${eaux.e5 || "non renseigné"}\n- Relation des parents : ${eaux.e13 || "non renseigné"} — ${eaux.e13_open || ""}\n- Foi dans le foyer : ${eaux.e14 || "non renseigné"}\n- Mémoire douloureuse : ${eaux.e6 || "non renseigné"} — ${eaux.e6_open || ""}\n- Mémoire de gratitude : ${eaux.e7 || "non renseigné"} — ${eaux.e7_open || ""}\n- Événement formateur : ${eaux.e8 || ""}\n- Règles familiales : ${eaux.e9 || ""}\n- Schéma répété : ${eaux.e10 || ""}\n- Force familiale : ${eaux.e11 || ""}\n- Atmosphère enfance : ${eaux.e12 || ""}\n- Schémas générationnels : ${Array.isArray(eaux.e16) ? eaux.e16.join(", ") : eaux.e16 || "non renseigné"}\n- Pratiques spirituelles : ${eaux.e17 || "non renseigné"} — ${eaux.e17_open || ""}\n\n═══ LES OS ═══\n- Valeur fondamentale : ${os.o1 || os.oc1 || ""}\n- Cohérence valeurs/actions : ${os.o2 || ""}\n- Vision du foyer dans 5 ans : ${os.o3 || os.oc3 || ""}\n- Perception alignement : ${os.o4 || ""}\n- Définition être aimé : ${os.o5 || ""}\n- Mérite l'amour : ${os.o6 || ""}\n- Foi dans décisions : ${os.o7 || ""}\n- Définition mariage réussi : ${os.o8 || ""}\n- Ligne non franchissable : ${os.o9 || os.oc4 || ""}\n- Conviction à transmettre : ${os.o10 || os.oc6 || ""}\n\n═══ LA CHAIR ═══\n- Reçoit l'amour par : ${appreciationPrimaire}\n- Donne l'amour par : ${appreciationDonne}\n- Style d'attachement probable : ${attachementStyle}\n- Communication blessures : ${chair.ch1 || ""}/5\n- Écoute désaccord : ${chair.ch2 || ""}/5\n- Dire sa vérité : ${chair.ch3 || ""}/5\n- Réconciliation : ${chair.ch4 || ""}/5\n- Expression frustration : ${chair.ch5 || ""}/5\n- Introverti/Extraverti : ${chair.ch6 || ""}/5\n- Logique/Émotionnel : ${chair.ch7 || ""}/5\n- Structuré/Flexible : ${chair.ch8 || ""}/5\n\n═══ ARCHÉTYPES DISPONIBLES ═══\n${archetypesText}\n\n═══ STRUCTURE DU PORTRAIT ═══\n**LES EAUX DE ${nom.toUpperCase()}**\nNommez 2-3 eaux marquantes. Chaque eau : nommée, expliquée, reliée aux réponses concrètes.\n\n**LES OS DE ${nom.toUpperCase()}**\n1. Os solides (valeurs formées et cohérentes)\n2. Os fracturés si présents (formulation probabiliste et bienveillante)\n\n**LA CHAIR DE ${nom.toUpperCase()}**\n- Profil d'appréciation : comment ${nom} donne et reçoit l'amour, et le décalage éventuel\n- Style d'attachement probable : ce que ça produit dans la relation\n- Tempérament : introversion/extraversion, logique/émotionnel, structuré/flexible\n\n**PATTERNS RELATIONNELS DÉTECTÉS**\nMaximum 3 archétypes. Pour chaque : Nom + référence + mécanisme spécifique + orientation pastorale.\n\n**ORIENTATION**\nType de travail intérieur prioritaire. Formation Eden recommandée.\n\n**DISCLAIMER**\nTerminer par : "Ce portrait est une analyse indicative basée sur vos réponses. Il ne remplace pas un accompagnement professionnel."\n\nMINIMUM 700 MOTS. Langue : français. Ton : médecin bienveillant. Utiliser le prénom ${nom} naturellement.`;
}// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4b — FONCTIONS : ALERTES · RAPPORT INTERNE · TÉMOIGNAGES
// ═══════════════════════════════════════════════════════════════════════════
// ── Calcul du niveau d'alerte ────────────────────────────────────────────────
function computeAlertLevel(gp, patternScores, opens, violenceSignals, ans, profil) {
  // Niveau 3 — CRISE (violence détectée ou signaux linguistiques)
  if (violenceSignals && violenceSignals.length > 0) return ALERT_LEVELS.CRISE;
  const openTexts = opens.map(o => (o.ans || "").toLowerCase()).join(" ");
  const crisisKeywords = ["coups", "menaces", "hôpital", "arme", "frappé", "je vais craquer", "je ne vois pas d'issue", "je veux mourir"];
  if (crisisKeywords.some(k => openTexts.includes(k))) return ALERT_LEVELS.CRISE;
  // Niveau 2 — VIGILANCE
  const criticalPatterns = ["Samson-Dalila", "David-Saul", "Jacob-Lea", "Osee-Gomer"];
  const hasCritical = Object.keys(patternScores || {}).some(p => criticalPatterns.includes(p) && (patternScores[p] || 0) > 60);
  const vigilanceKeywords = ["départ", "divorce", "je n'en peux plus", "séparation", "je pense à partir"];
  const hasVigilanceText = vigilanceKeywords.some(k => openTexts.includes(k));
  if (gp < 35 || hasCritical || hasVigilanceText) return ALERT_LEVELS.VIGILANCE;
  // Niveau 1 — INFORMATION
  if (gp < 50) return ALERT_LEVELS.INFO;
  return 0; // Pas d'alerte
}

// ── Envoi alerte crise au backend ────────────────────────────────────────────
async function triggerCrisisAlert({ clientName, gp, profil, patternScores, alertLevel, tel }) {
  const label = alertLevel >= ALERT_LEVELS.CRISE ? "🚨 CRISE" : "⚠️ VIGILANCE";
  const activePatterns = Object.entries(patternScores || {}).filter(([, v]) => v > 40).map(([k, v]) => `${k}(${v})`).join(", ");
  const subject = `${label} EDEN — ${clientName} — Score ${gp}/100`;
  const body = `${label} DÉTECTÉ — Académie Eden
Client : ${clientName}
Profil : ${profil}
Score global : ${gp}/100
Patterns : ${activePatterns || "Aucun"}
Date : ${new Date().toLocaleString("fr-FR")}
Niveau : ${alertLevel === ALERT_LEVELS.CRISE ? "CRISE — Action dans l'heure" : "VIGILANCE — Action sous 48h"}
Suivi recommandé : Contacter le client et orienter vers les ressources adaptées.`;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/diagnostic-report`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ report }) });

// ── Construction du rapport interne conseiller ───────────────────────────────
function buildInternalReportPrompt(clientName, profil, genre, role, annees, enfants, scores, opens, patternScores, gp, rawAns, alertLevel) {
  const pl = profil === "marie" ? "Marié(e)" : profil === "fiance" ? "Fiancé(e)" : "Célibataire";
  const urgenceLabel = alertLevel >= ALERT_LEVELS.CRISE ? "🔴 CRISE" : alertLevel >= ALERT_LEVELS.VIGILANCE ? "🟠 VIGILANCE" : alertLevel >= ALERT_LEVELS.INFO ? "🟡 INFO" : "🟢 STABLE";
  const activePatterns = Object.entries(patternScores || {}).filter(([, v]) => v > 40).sort(([, a], [, b]) => b - a);
  const scoresText = Object.entries(scores).map(([, v]) => `${v.label}: ${v.p}/100 (${v.lv.l})`).join(" | ");
  const opensText = opens.filter(o => o.ans?.trim()).map(o => `Q: "${o.q}" → R: "${o.ans}"`).join("\n");
  const patternsText = activePatterns.map(([k, v]) => `${k} (${v}/100) — ${ARCHETYPES[k]?.mecanisme?.slice(0, 120) || ""}...`).join("\n");
  return `Tu es le Conseiller Senior de l'Académie Eden — Institut du Leadership Familial, fondé par Zady Zozoro.
Ce rapport est INTERNE — pour l'équipe Eden uniquement. Il ne sera PAS lu par le client.
═══ DONNÉES CLIENT ═══
Prénom : ${clientName} | Profil : ${pl} | Genre : ${genre || "N/A"} | Rôle : ${role || "N/A"}
${annees ? `Années de mariage : ${annees}` : ""} ${enfants ? `| Enfants : ${enfants}` : ""}
Date du bilan : ${new Date().toLocaleDateString("fr-FR")}
Score global : ${gp}/100
Urgence : ${urgenceLabel}
═══ SCORES PAR DIMENSION ═══
${scoresText}
═══ PATTERNS DÉTECTÉS ═══
${patternsText || "Aucun pattern dominant"}
═══ RÉPONSES OUVERTES ═══
${opensText || "Non renseignées"}
═══ GÉNÈRE LE RAPPORT INTERNE CONSEILLER ═══
Format obligatoire avec sections **EN GRAS** :
**A. DIAGNOSTIC PRINCIPAL**
Un paragraphe de 3-4 phrases : schéma principal détecté, point de blocage central, dynamique alimentatrice. Langage clinique précis. Pas d'euphémismes.
**B. AXE DE TRAVAIL 1 — [NOM DE L'AXE]**
- Symptômes observés : (ce que le client a rapporté, avec les scores précis)
- Cible de travail : (objectif concret atteignable)
- Première action concrète à proposer en séance : (une action précise, pas une généralité)
**B. AXE DE TRAVAIL 2 — [NOM DE L'AXE]**
(même structure)
**B. AXE DE TRAVAIL 3 — [NOM DE L'AXE]**
(même structure — uniquement si pertinent)
**C. QUESTIONS D'EXPLORATION POUR LA SÉANCE**
5 questions que Zady doit poser en entretien pour approfondir ce que le bilan n'a pas capté. Formulées précisément. Non génériques.
**D. RESSOURCES ADAPTÉES**
- Formation prescrite avec justification précise (pas juste le nom)
- 1-2 exercices concrets à proposer entre les séances
- Points de vigilance spécifiques à ce profil
**E. SUIVI RECOMMANDÉ**
- Fréquence des séances suggérée
- Indicateurs de progression (comment mesurer que ça avance)
- Signaux d'alarme (ce qui indiquerait une dégradation)
Ton : clinique, direct, professionnel. Pas de ton pastoral dans cette version. Zady lit ce document en préparation de séance — il a besoin d'informations actionables, pas d'encouragements.
MINIMUM 600 MOTS. En français.`;
}

// ── Génération de témoignages automatiques ────────────────────────────────────
function buildTestimonialsPrompt(clientName, profil, gp, patternScores, scores) {
  const pl = profil === "marie" ? "marié(e)" : profil === "fiance" ? "fiancé(e)" : "célibataire";
  const activePatterns = Object.keys(patternScores || {}).filter(p => (patternScores[p] || 0) > 40).slice(0, 2);
  const topFragile = Object.entries(scores).sort(([, a], [, b]) => a.p - b.p).slice(0, 2).map(([, v]) => v.label).join(" et ");
  const trajectory = gp >= 65 ? "encourageant" : gp >= 45 ? "fragile" : "critique";
  return `Un client vient de compléter son Bilan 360° Eden. Il s'appelle ${clientName}, profil ${pl}, score ${gp}/100 (trajectoire ${trajectory}). Dimensions les plus fragiles : ${topFragile}. ${activePatterns.length > 0 ? `Patterns détectés : ${activePatterns.join(", ")}.` : ""}
Génère 3 témoignages distincts que ce client pourrait partager anonymement. Chaque témoignage doit :
- Être à la PREMIÈRE PERSONNE (Je, moi)
- Être ÉMOTIONNEL et SPÉCIFIQUE (pas générique)
- Faire entre 40 et 70 mots
- Ne PAS mentionner l'Académie Eden ni le prix ni des termes techniques
- Ne PAS donner de conseils — seulement témoigner de l'expérience
Version 1 — "Le choc de reconnaissance" (mettre un mot sur ce qui était vécu sans nom)
Version 2 — "Le déclic émotionnel" (la phrase ou le moment qui a touché)
Version 3 — "Le résultat concret" (ce qui a changé grâce au plan d'action)
Formate ta réponse ainsi :
VERSION_1: [texte]
VERSION_2: [texte]
VERSION_3: [texte]
Langue : français. Ton authentique — pas commercial.`;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5 — CSS UNIFIÉ
// ═══════════════════════════════════════════════════════════════════════════
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{background:#080C14;color:#C8C0B0;font-family:'Jost',sans-serif;-webkit-font-smoothing:antialiased;}
button{font-family:'Jost',sans-serif;cursor:pointer;transition:all .2s ease;}
textarea,input{font-family:'Jost',sans-serif;}
textarea:focus,input:focus{outline:none;}
.eden-app{min-height:100vh;background:#080C14;}
.eden-wrap{max-width:640px;margin:0 auto;padding:0 20px 80px;}
/* Header */
.eden-header{padding:28px 20px 20px;border-bottom:1px solid #1E2330;background:linear-gradient(180deg,#0B0F1A 0%,#080C14 100%);}
.eden-logo{font-size:8px;letter-spacing:.3em;text-transform:uppercase;color:#C9A84C;margin-bottom:8px;}
.eden-title{font-family:'Cormorant Garamond',serif;font-size:30px;color:#F0EBE0;line-height:1.2;margin-bottom:4px;}
.eden-subtitle{font-size:11px;color:#4A5060;letter-spacing:.06em;}
/* Phase bar */
.phase-bar{display:flex;gap:6px;padding:16px 20px 0;}
.phase-seg{flex:1;height:3px;background:#1E2330;border-radius:1px;transition:background .4s;}
.phase-seg.active{background:#C9A84C;}
.phase-seg.done{background:#4A9B6A;}
.phase-labels{display:flex;padding:6px 20px 0;}
.phase-labels span{flex:1;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#4A5060;transition:color .3s;}
.phase-labels span.active{color:#C9A84C;}
.phase-labels span.done{color:#4A9B6A;}
/* Sections */
.section{padding-top:24px;}
.section-tag{font-size:9px;letter-spacing:.26em;text-transform:uppercase;color:#C9A84C;margin-bottom:10px;}
.section-title{font-family:'Cormorant Garamond',serif;font-size:24px;color:#F0EBE0;line-height:1.3;margin-bottom:12px;}
.section-desc{font-size:12px;color:#8A8070;line-height:1.7;margin-bottom:24px;}
/* Options */
.opt{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border:1px solid #1E2330;background:#0D1018;margin-bottom:8px;cursor:pointer;transition:all .2s;}
.opt:hover{border-color:#C9A84C44;background:#111520;}
.opt.selected{border-color:#C9A84C;background:#C9A84C12;}
.opt-dot{width:18px;height:18px;border:1px solid #2A2E3A;border-radius:50%;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;}
.opt.selected .opt-dot{background:#C9A84C;border-color:#C9A84C;}
.opt-dot::after{content:'';width:6px;height:6px;border-radius:50%;background:#0B0F1A;opacity:0;}
.opt.selected .opt-dot::after{opacity:1;}
.opt-label{font-size:13px;color:#C8C0B0;line-height:1.6;}
.opt.selected .opt-label{color:#F0EBE0;}
/* Check items */
.check-item{display:flex;gap:12px;align-items:flex-start;padding:10px 14px;border:1px solid #1E2330;background:#0D1018;margin-bottom:6px;cursor:pointer;transition:all .2s;}
.check-item:hover{border-color:#C9A84C33;}
.check-item.selected{border-color:#C9A84C44;background:#C9A84C08;}
.check-box{width:18px;height:18px;border:1px solid #2A2E3A;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;}
.check-item.selected .check-box{background:#C9A84C;border-color:#C9A84C;color:#0B0F1A;}
/* Inputs */
.inp{width:100%;background:#0D1018;border:1px solid #1E2330;color:#C8C0B0;font-size:13px;padding:12px 14px;margin-bottom:16px;}
.inp:focus{border-color:#C9A84C44;}
.inp::placeholder{color:#3A3E4A;}
.ta{width:100%;background:#0D1018;border:1px solid #1E2330;color:#C8C0B0;font-size:13px;padding:12px 14px;min-height:96px;resize:vertical;line-height:1.7;}
.ta:focus{border-color:#C9A84C44;}
.ta::placeholder{color:#3A3E4A;}
.ta-short{min-height:48px;}
/* Likert */
.likert{display:flex;gap:6px;margin-top:8px;}
.likert-btn{flex:1;padding:10px 4px;border:1px solid #1E2330;background:#0D1018;color:#4A5060;font-family:'Jost',sans-serif;font-size:11px;cursor:pointer;text-align:center;transition:all .2s;line-height:1.4;}
.likert-btn:hover{border-color:#C9A84C44;color:#C8C0B0;}
.likert-btn.selected{border-color:#C9A84C;background:#C9A84C12;color:#C9A84C;}
/* Scale (bilan) */
.scale-row{display:flex;gap:6px;margin:10px 0;}
.scale-btn{flex:1;padding:12px 4px;border:1px solid #1E2330;background:#0D1018;color:#4A5060;font-family:'Jost',sans-serif;font-size:10px;cursor:pointer;text-align:center;transition:all .2s;line-height:1.4;}
.scale-btn:hover{border-color:#C9A84C44;color:#C8C0B0;}
.scale-btn.selected{border-color:#C9A84C;background:#C9A84C12;color:#C9A84C;font-weight:600;}
/* Ranking */
.rank-list{display:flex;flex-direction:column;gap:8px;}
.rank-item{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid #1E2330;background:#0D1018;cursor:pointer;transition:all .2s;}
.rank-item:hover{border-color:#C9A84C33;}
.rank-item.ranked{border-color:#C9A84C44;background:#C9A84C08;}
.rank-num{width:28px;height:28px;border:1px solid #2A2E3A;display:flex;align-items:center;justify-content:center;font-size:12px;color:#4A5060;flex-shrink:0;transition:all .2s;}
.rank-item.ranked .rank-num{border-color:#C9A84C;color:#C9A84C;background:#C9A84C12;}
.rank-label{font-size:12px;color:#8A8070;line-height:1.5;flex:1;}
.rank-item.ranked .rank-label{color:#C8C0B0;}
/* Buttons */
.btn-primary{background:#C9A84C;border:none;color:#0B0F1A;padding:14px 20px;font-family:'Jost',sans-serif;font-size:12px;font-weight:600;letter-spacing:.04em;cursor:pointer;width:100%;}
.btn-primary:hover{background:#D4B86A;}
.btn-primary:disabled{opacity:.4;cursor:not-allowed;}
.btn-secondary{background:transparent;border:1px solid #1E2330;color:#4A5060;padding:14px 20px;font-family:'Jost',sans-serif;font-size:12px;cursor:pointer;}
.btn-secondary:hover{border-color:#C9A84C33;color:#8A8070;}
.btn-gold-outline{background:transparent;border:1px solid #C9A84C66;color:#C9A84C;padding:13px 20px;font-family:'Jost',sans-serif;font-size:12px;cursor:pointer;}
.btn-gold-outline:hover{background:#C9A84C12;}
.btn-wa{background:#25D366;border:none;color:#fff;padding:13px 20px;font-family:'Jost',sans-serif;font-size:12px;font-weight:600;cursor:pointer;width:100%;}
.btn-danger{background:#C0614A;border:none;color:#fff;padding:13px 20px;font-family:'Jost',sans-serif;font-size:12px;cursor:pointer;}
.nav-row{display:flex;gap:10px;margin-top:28px;}
/* Cards */
.card{background:#0D1018;border:1px solid #1E2330;padding:20px;}
.card-gold{background:#0D1018;border:1px solid #C9A84C33;padding:20px;}
.card-green{background:#0A1208;border:1px solid #4A9B6A33;border-left:3px solid #4A9B6A;padding:20px;}
.card-red{background:#0D0808;border:1px solid #C0614A33;border-left:3px solid #C0614A;padding:20px;}
.card-gold-left{background:#0D1018;border:1px solid #C9A84C33;border-left:4px solid #C9A84C;padding:20px;}
/* Report sections */
.rb{margin-bottom:20px;}
.stl{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:#C9A84C;margin-bottom:10px;}
.rbt{font-size:13px;color:#C8C0B0;line-height:1.9;white-space:pre-wrap;}
.phrase-box{background:linear-gradient(135deg,#0D1018,#111828);border:1px solid #C9A84C33;border-left:4px solid #C9A84C;padding:20px;margin-bottom:20px;}
.phrase-text{font-family:'Cormorant Garamond',serif;font-size:20px;color:#F0EBE0;font-style:italic;line-height:1.5;}
.plan-box{background:#0A1208;border:1px solid #4A9B6A33;padding:20px;margin-bottom:20px;}
.plan-title{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#4A9B6A;margin-bottom:12px;}
.reco-box{background:#0D1018;border:1px solid #C9A84C33;padding:20px;margin-bottom:20px;}
.reco-title{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#C9A84C;margin-bottom:12px;}
/* Scores */
.score-bar-wrap{display:flex;flex-direction:column;gap:10px;margin-bottom:20px;}
.score-bar-item{cursor:pointer;padding:10px 14px;border:1px solid #1E2330;background:#0D1018;transition:background .2s;}
.score-bar-item:hover{background:#111520;}
.score-bar-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
.score-bar-label{font-size:11px;color:#C8C0B0;}
.score-bar-value{font-size:11px;font-weight:600;}
.score-bar-track{height:3px;background:#1E2330;border-radius:1px;}
.score-bar-fill{height:100%;border-radius:1px;transition:width .8s ease;}
/* Q&A */
.qa-section{margin-top:32px;background:#0D1018;border:1px solid #C9A84C33;padding:24px;}
.qa-header{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#C9A84C;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;}
.qa-counter{padding:3px 10px;border:1px solid #C9A84C44;font-size:10px;color:#C9A84C;}
.qa-counter.exhausted{border-color:#C0614A44;color:#C0614A;}
.qa-history{display:flex;flex-direction:column;gap:10px;margin-bottom:16px;max-height:400px;overflow-y:auto;}
.qa-bubble-user{padding:12px 16px;background:#111520;border:1px solid #C9A84C22;border-left:3px solid #C9A84C;}
.qa-bubble-ai{padding:12px 16px;background:#0A1410;border:1px solid #4A9B6A22;border-left:3px solid #4A9B6A;}
.qa-bubble-label{font-size:9px;letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px;}
.qa-bubble-text{font-size:13px;color:#C8C0B0;line-height:1.8;white-space:pre-wrap;}
.qa-input-row{display:flex;gap:8px;align-items:flex-end;}
.qa-send{background:#C9A84C;color:#0B0F1A;border:none;padding:14px 16px;font-family:'Jost',sans-serif;font-size:12px;font-weight:600;white-space:nowrap;}
.qa-typing{display:flex;align-items:center;gap:6px;padding:12px 16px;background:#0A1410;border:1px solid #4A9B6A22;}
.qa-dot{width:5px;height:5px;border-radius:50%;background:#4A9B6A;animation:qdot .9s ease-in-out infinite;}
.qa-dot:nth-child(2){animation-delay:.15s;}
.qa-dot:nth-child(3){animation-delay:.3s;}
@keyframes qdot{0%,80%,100%{transform:scale(.8);opacity:.4}40%{transform:scale(1.1);opacity:1}}
/* Modal */
.modal-overlay{position:fixed;inset:0;background:#000000CC;z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
.modal-box{background:#0D1018;border:1px solid #C9A84C33;max-width:480px;width:100%;padding:28px;}
.modal-title{font-family:'Cormorant Garamond',serif;font-size:22px;color:#F0EBE0;margin-bottom:6px;}
.modal-sub{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#C9A84C;margin-bottom:16px;}
.modal-body{font-size:13px;color:#C8C0B0;line-height:1.8;white-space:pre-wrap;margin-bottom:20px;}
/* Premium lock */
.premium-lock{background:#0D0810;border:1px solid #C9A84C33;border-left:3px solid #C9A84C;padding:20px;margin-bottom:20px;opacity:0.85;}
.premium-lock-tag{font-size:8px;letter-spacing:.22em;text-transform:uppercase;color:#C9A84C;margin-bottom:8px;}
.premium-lock-title{font-family:'Cormorant Garamond',serif;font-size:16px;color:#C8C0B0;margin-bottom:8px;}
.premium-lock-desc{font-size:12px;color:#6A6070;line-height:1.6;margin-bottom:14px;}
/* Home */
.home-module-card{background:#0D1018;border:1px solid #1E2330;padding:24px;cursor:pointer;transition:all .2s;margin-bottom:12px;}
.home-module-card:hover{border-color:#C9A84C44;background:#111520;}
.home-module-card.featured{border-color:#C9A84C33;background:#0D1018;}
.home-module-tag{font-size:8px;letter-spacing:.24em;text-transform:uppercase;color:#C9A84C;margin-bottom:8px;}
.home-module-title{font-family:'Cormorant Garamond',serif;font-size:22px;color:#F0EBE0;margin-bottom:8px;}
.home-module-desc{font-size:12px;color:#8A8070;line-height:1.6;}
.home-module-badge{display:inline-block;padding:3px 10px;border:1px solid;font-size:9px;letter-spacing:.14em;text-transform:uppercase;margin-top:12px;}
/* Loading */
.loading-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:24px;}
.loading-ring{width:44px;height:44px;border:1px solid #1E2330;border-top:1px solid #C9A84C;border-radius:50%;animation:spin 1s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.loading-msg{font-family:'Cormorant Garamond',serif;font-size:20px;color:#C8C0B0;text-align:center;max-width:320px;line-height:1.5;}
.loading-sub{font-size:10px;color:#3A3E4A;text-align:center;letter-spacing:.1em;text-transform:uppercase;}
/* Footer */
.footer{padding:32px 20px;border-top:1px solid #1E2330;text-align:center;}
.footer-logo{font-size:8px;letter-spacing:.22em;text-transform:uppercase;color:#4A5060;margin-bottom:6px;}
.footer-copy{font-size:10px;color:#2A2E3A;}
/* Radar */
.radar-wrap{background:#0D1018;border:1px solid #1E2330;padding:20px;margin-bottom:20px;}
.sg{display:flex;flex-direction:column;gap:8px;margin-bottom:20px;}
/* Misc */
.mb16{margin-bottom:16px;}
.mb24{margin-bottom:24px;}
.q-text{font-family:'Cormorant Garamond',serif;font-size:17px;color:#F0EBE0;line-height:1.5;margin-bottom:16px;}
.q-follow{font-size:12px;color:#8A8070;font-style:italic;margin:12px 0 8px;}
.progress-bar{height:3px;background:#1E2330;margin-bottom:20px;}
.progress-fill{height:100%;background:#C9A84C;transition:width .4s ease;}
.cta-box{background:#0A1208;border:1px solid #4A9B6A33;border-left:3px solid #4A9B6A;padding:24px;margin-top:24px;}
.cta-title{font-family:'Cormorant Garamond',serif;font-size:20px;color:#F0EBE0;margin-bottom:8px;}
.cta-sub{font-size:12px;color:#8A8070;line-height:1.7;margin-bottom:16px;}
.pat-box{background:#0D0810;border:1px solid #7BAFC933;padding:14px;margin-bottom:16px;}
.indices-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;}
.index-card{background:#0D1018;border:1px solid #1E2330;padding:14px;cursor:pointer;}
.index-card:hover{border-color:#C9A84C33;}
.form-grid{display:grid;gap:8px;margin-bottom:24px;}
.form-card{background:#0D1018;border:1px solid #1E2330;padding:16px;cursor:pointer;transition:all .2s;}
.form-card:hover{border-color:#C9A84C44;background:#111520;}
.form-card-name{font-size:13px;color:#F0EBE0;margin-bottom:4px;font-weight:500;}
.form-card-prix{font-size:11px;color:#C9A84C;margin-bottom:4px;}
.form-card-desc{font-size:11px;color:#6A6070;line-height:1.5;}
.abonne-banner{background:linear-gradient(135deg,#0A1208,#0D1018);border:1px solid #4A9B6A44;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
`;// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6 — COMPOSANTS PARTAGÉS
// ═══════════════════════════════════════════════════════════════════════════

function Footer() {
  return (
    <div className="footer">
      <div className="footer-logo">Académie Eden · Institut de Leadership Familial</div>
      <div className="footer-copy">Fondé par Zady Zozoro · Abidjan, Côte d'Ivoire · © 2025</div>
    </div>
  );
}

function PremiumGate({ feature, onUpgrade, children }) {
  return (
    <div className="premium-lock">
      <div className="premium-lock-tag">✦ Fonctionnalité Premium</div>
      <div className="premium-lock-title">{feature}</div>
      <div className="premium-lock-desc">Disponible avec l'abonnement Eden Premium (15 000 FCFA/mois). Accès illimité aux deux modules + 5 fonctionnalités exclusives.</div>
      <button className="btn-gold-outline" style={{ width: "100%" }} onClick={onUpgrade}>
        Activer l'abonnement Premium
      </button>
    </div>
  );
}

function FacadeAlert({ ans, profil, onContinue, onRevise }) {
  const facade = computeFacadeScore(ans, profil);
  if (!facade || facade.level === "faible" || !facade.message) {
    if (onContinue) onContinue();
    return null;
  }
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000EE", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#0D1018", border: "1px solid #C9A84C66", maxWidth: 480, width: "100%", padding: "32px 28px" }}>
        <div style={{ fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: C.gold, marginBottom: 16 }}>◈ Lecture de cohérence</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "#F0EBE0", marginBottom: 8, lineHeight: 1.3 }}>Avant de continuer…</div>
        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.8, marginBottom: 24 }}>{facade.message}</p>
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 28 }}>Un bilan honnête vous servira davantage qu'un rapport flatteur. La qualité de votre rapport dépend directement de la qualité de vos réponses.</p>
        <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
          <button onClick={onRevise} className="btn-gold-outline" style={{ width: "100%" }}>Revoir mes réponses avec plus de nuance</button>
          <button onClick={onContinue} className="btn-primary">Continuer — mes réponses sont authentiques</button>
        </div>
      </div>
    </div>
  );
}

function ViolenceProtocol({ signals, onContinue }) {
  if (!signals || signals.length === 0) return null;
  const resources = [
    { pays: "Côte d'Ivoire", num: "1010 / +225 27 21 24 53 53" },
    { pays: "Sénégal", num: "116" },
    { pays: "Cameroun", num: "+237 222 23 40 89" },
    { pays: "France (diaspora)", num: "3919" },
    { pays: "International", num: "wa.me/+12134046022" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg,#0A0005,#120008)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0D0008", border: "1px solid #C0614A66", maxWidth: 500, width: "100%", padding: "32px 28px" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#C0614A22", border: "1px solid #C0614A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 20 }}>⚠</div>
        <div style={{ fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: C.red, marginBottom: 12 }}>Message important</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: "#F0EBE0", marginBottom: 16, lineHeight: 1.35 }}>Certaines de vos réponses nous préoccupent</div>
        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.8, marginBottom: 20 }}>Ce que vous avez décrit peut indiquer une situation où votre sécurité ou votre liberté est compromise. Aucun diagnostic ne vaut votre sécurité.</p>
        <p style={{ fontSize: 12, color: "#A0906A", lineHeight: 1.7, marginBottom: 24, fontStyle: "italic" }}>L'Académie Eden ne peut pas vous accompagner seul(e) dans cette situation. Un professionnel formé à cela peut faire la différence.</p>
        <div style={{ background: "#0A0005", border: "1px solid #C0614A33", padding: "16px 18px", marginBottom: 24 }}>
          <div style={{ fontSize: 9, color: C.red, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12 }}>Ressources confidentielles — 24h/24</div>
          {resources.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < resources.length - 1 ? "1px solid #1A0A10" : "none" }}>
              <div style={{ fontSize: 11, color: C.text }}>{r.pays}</div>
              <div style={{ fontSize: 12, color: "#E8A0A0", fontWeight: 600 }}>{r.num}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn-wa" onClick={() => window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent("Bonjour, j'ai besoin d'aide urgente suite à mon bilan Eden.")}`)}>Contacter l'Académie Eden maintenant</button>
          <button onClick={onContinue} style={{ background: "transparent", border: "1px solid #3A2A2A", color: "#6A5050", padding: "11px 20px", cursor: "pointer", fontFamily: "'Jost',sans-serif", fontSize: 11 }}>Continuer quand même</button>
        </div>
      </div>
    </div>
  );
}

function RelationshipClock({ clockData }) {
  const [visible, setVisible] = useState(false);
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    setTimeout(() => setVisible(true), 300);
    const target = clockData.urgency === "critique" ? 280 : clockData.urgency === "élevée" ? 200 : 130;
    const t = setTimeout(() => setAngle(target), 500);
    return () => clearTimeout(t);
  }, [clockData]);
  if (!clockData) return null;
  const urgencyColor = clockData.urgency === "critique" ? C.red : clockData.urgency === "élevée" ? C.orange : C.gold;
  const needleRad = (angle - 90) * (Math.PI / 180);
  const cx = 80, cy = 80, r = 60;
  const nx = cx + r * 0.75 * Math.cos(needleRad);
  const ny = cy + r * 0.75 * Math.sin(needleRad);
  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease", background: "#0D0810", border: `1px solid ${urgencyColor}44`, borderLeft: `4px solid ${urgencyColor}`, padding: "24px 22px", marginBottom: 24 }}>
      <div style={{ fontSize: 9, color: urgencyColor, letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 16 }}>◎ Projection temporelle — Modèle Gottman</div>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
          <circle cx="80" cy="80" r="75" fill="#0A060C" stroke="#1E1828" strokeWidth="1" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
            const rad = (a - 90) * Math.PI / 180;
            const x1 = 80 + 55 * Math.cos(rad), y1 = 80 + 55 * Math.sin(rad);
            const x2 = 80 + 62 * Math.cos(rad), y2 = 80 + 62 * Math.sin(rad);
            return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2A2040" strokeWidth={a % 90 === 0 ? 2 : 1} />;
          })}
          <line x1="80" y1="80" x2={nx} y2={ny} stroke={urgencyColor} strokeWidth="2.5" strokeLinecap="round" style={{ transition: "all 1.5s cubic-bezier(.34,1.56,.64,1)" }} />
          <circle cx="80" cy="80" r="5" fill={urgencyColor} />
          <text x="80" y="18" textAnchor="middle" fontSize="8" fill="#6A6070">Stable</text>
          <text x="147" y="84" textAnchor="start" fontSize="8" fill={C.red}>Crise</text>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: clockData.months <= 24 ? 32 : 24, color: urgencyColor, lineHeight: 1, marginBottom: 4 }}>{clockData.months} mois</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>projection sans intervention structurée</div>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>À ce rythme ({clockData.effectiveDecline} pts/an), votre relation atteindra la zone de rupture difficile à inverser{clockData.urgency === "critique" ? " dans moins de 2 ans." : clockData.urgency === "élevée" ? " dans 2 à 3 ans." : " dans 3 à 5 ans."}</div>
          {clockData.activeCritical.length > 0 && <div style={{ fontSize: 10, color: urgencyColor, marginTop: 8, padding: "6px 10px", background: urgencyColor + "12", border: `1px solid ${urgencyColor}33` }}>Patterns accélérateurs : {clockData.activeCritical.join(", ")}</div>}
        </div>
      </div>
      <div style={{ fontSize: 9, color: "#3A3444", marginTop: 16, lineHeight: 1.6, fontStyle: "italic" }}>Basé sur les modèles de recherche de John Gottman (40 ans d'étude sur 3000 couples).</div>
    </div>
  );
}

function MicroPertesSection({ scores, profil }) {
  const [revealed, setRevealed] = useState(false);
  if (profil === "celibataire") return null;
  const fragiles = Object.entries(scores).filter(([k]) => MICRO_PERTES_MAP[k]).sort(([, a], [, b]) => a.p - b.p).slice(0, 3).filter(([, v]) => v.p < 65);
  if (fragiles.length === 0) return null;
  const pertes = fragiles.flatMap(([k, v]) => {
    const map = MICRO_PERTES_MAP[k];
    if (v.p < 40) return map.low.slice(0, 2);
    return map.low.slice(0, 1);
  }).slice(0, 5);
  if (pertes.length === 0) return null;
  return (
    <div className="card-red" style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: C.red, marginBottom: 12 }}>◉ Ce que vous perdez déjà — invisiblement</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: "#F0EBE0", marginBottom: 16, lineHeight: 1.35 }}>Avant même la rupture, le manque est déjà là</div>
      {!revealed ? (
        <div>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 16 }}>Votre bilan a identifié {pertes.length} zones de perte quotidienne que vous ne nommez peut-être pas encore explicitement.</p>
          <button onClick={() => setRevealed(true)} className="btn-gold-outline" style={{ width: "100%" }}>Révéler les pertes identifiées</button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {pertes.map((perte, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: "#08050C", border: "1px solid #1A0A14" }}>
                <div style={{ color: C.red, fontSize: 14, flexShrink: 0 }}>◉</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{perte}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#8A6070", lineHeight: 1.7, fontStyle: "italic" }}>Ces pertes ne s'annoncent pas. Elles s'accumulent. Jusqu'au jour où l'une d'elles manque si profondément qu'on ne se souvient plus quand elle a commencé à disparaître.</p>
        </div>
      )}
    </div>
  );
}

function FutureLetter({ letter, clientName, gp, onClose }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);
  const isPositive = gp >= 65;
  const accentColor = isPositive ? C.green : C.orange;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000F0", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
      <div style={{ background: "#080C10", border: `1px solid ${accentColor}44`, maxWidth: 520, width: "100%", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease" }}>
        <div style={{ padding: "28px 28px 0" }}>
          <div style={{ fontSize: 8, letterSpacing: ".28em", textTransform: "uppercase", color: accentColor, marginBottom: 12 }}>{isPositive ? "✦ Lettre de votre futur possible" : "◈ Lettre de votre futur probable"}</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: "#F0EBE0", fontStyle: "italic", marginBottom: 8 }}>{isPositive ? "Si vous agissez courageusement aujourd'hui…" : "Si rien ne change à partir d'aujourd'hui…"}</div>
          <div style={{ width: 40, height: 1, background: accentColor + "55", marginBottom: 24 }} />
        </div>
        <div style={{ padding: "0 28px 28px" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: C.text, lineHeight: 2.1, fontStyle: "italic", whiteSpace: "pre-wrap", borderLeft: `2px solid ${accentColor}33`, paddingLeft: 20 }}>{letter}</div>
        </div>
        <div style={{ padding: "20px 28px", borderTop: "1px solid #1E2230", display: "flex", gap: 10, flexDirection: "column" }}>
          <div style={{ fontSize: 11, color: "#6A6070", lineHeight: 1.6, fontStyle: "italic", marginBottom: 4 }}>Cette lettre est générée à partir des dynamiques identifiées dans votre bilan. Elle n'est pas une prédiction — c'est un miroir de vos trajectoires possibles.</div>
          <button onClick={onClose} className="btn-primary" style={{ background: accentColor }}>Retour à mon rapport</button>
        </div>
      </div>
    </div>
  );
}

function ViralShareCard({ clientName, gp, profil, riskLevel, onClose }) {
  const [copied, setCopied] = useState(false);
  const verdict = getVerdict3Mots(gp);
  const scoreColor = gp >= 65 ? C.green : gp >= 50 ? C.gold : gp >= 35 ? C.orange : C.red;
  const profilLabel = profil === "marie" ? "Couple marié" : profil === "fiance" ? "Fiancé(e)" : "Célibataire";
  const shareText = `Mon Bilan 360° Eden révèle :\n\n"${verdict}"\n\nScore global : ${gp}/100 · ${riskLevel?.l || ""}\n\nDécouvrez le vôtre → academie-eden.com\n(Bilan · 25 000 FCFA)`;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000EE", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#0B0F1A", border: "1px solid #C9A84C44", maxWidth: 420, width: "100%" }}>
        <div style={{ background: "linear-gradient(135deg,#080C14,#0D1020,#080A10)", padding: "32px 28px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: scoreColor + "08", border: `1px solid ${scoreColor}15` }} />
          <div style={{ fontSize: 8, letterSpacing: ".3em", textTransform: "uppercase", color: C.gold, marginBottom: 20 }}>Académie Eden · Bilan 360°</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 72, color: scoreColor, lineHeight: 1, fontWeight: 100 }}>{gp}</div>
            <div style={{ paddingBottom: 12 }}>
              <div style={{ fontSize: 18, color: scoreColor }}>/ 100</div>
              <div style={{ fontSize: 9, color: C.muted, letterSpacing: ".1em", textTransform: "uppercase" }}>{profilLabel}</div>
            </div>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "#F0EBE0", fontStyle: "italic", marginBottom: 20, lineHeight: 1.3, borderLeft: `3px solid ${scoreColor}`, paddingLeft: 16 }}>"{verdict}"</div>
          <div style={{ display: "inline-block", padding: "4px 12px", border: `1px solid ${scoreColor}44`, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: scoreColor }}>{riskLevel?.l || "Bilan complété"}</div>
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #1E2230", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 10, color: "#4A5060" }}>Découvrez le vôtre → academie-eden.com</div>
            <div style={{ fontSize: 8, color: C.gold, letterSpacing: ".12em" }}>◈ EDEN</div>
          </div>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 14, lineHeight: 1.6 }}>Partagez votre révélation sans exposer votre rapport complet. Chaque partage peut aider quelqu'un à faire le premier pas.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="btn-wa" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`)}>Partager sur WhatsApp</button>
            <button className="btn-gold-outline" style={{ width: "100%" }} onClick={() => { navigator.clipboard.writeText(shareText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); }); }}>{copied ? "✓ Copié" : "Copier le texte"}</button>
            <button onClick={onClose} style={{ background: "transparent", border: "1px solid #1E2330", color: "#4A5060", padding: "9px 20px", cursor: "pointer", fontFamily: "'Jost',sans-serif", fontSize: 11 }}>Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT : BANNIÈRE D'ALERTE (niveaux 1, 2, 3) ────────────────────────
function AlertBanner({ alertLevel, clientName, gp }) {
  const [wantsContact, setWantsContact] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  if (!alertLevel || alertLevel === 0) return null;
  if (alertLevel >= ALERT_LEVELS.CRISE) return null;
  if (alertLevel === ALERT_LEVELS.VIGILANCE) return (
    <div style={{ background: "#140A00", border: "1px solid #C0784A44", borderLeft: "4px solid #C0784A", padding: "20px 22px", marginBottom: 24 }}>
      <div style={{ fontSize: 9, color: C.orange, letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 8 }}>⚠ Attention — Situation à surveiller</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: "#F0EBE0", marginBottom: 10, lineHeight: 1.4 }}>
        Votre situation nécessite une attention rapide
      </div>
      <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 16 }}>
        Certains signaux de votre bilan indiquent une dynamique qui peut évoluer rapidement sans accompagnement. Un conseiller peut vous recontacter dans les 48h si vous le souhaitez — sans engagement, juste pour échanger.
      </p>
      {!contactSent ? (
        !wantsContact ? (
          <button onClick={() => setWantsContact(true)} style={{ background: C.orange, border: "none", color: "#fff", padding: "11px 18px", fontFamily: "'Jost',sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", width: "100%" }}>
            Je souhaite être recontacté(e) dans les 48h
          </button>
        ) : (
          <div style={{ background: "#0A0805", border: "1px solid #C0784A33", padding: "14px" }}>
            <div style={{ fontSize: 12, color: C.text, marginBottom: 10 }}>Sur quel numéro WhatsApp peut-on vous joindre ?</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input id="contact-tel" className="inp" placeholder="+225 XX XX XX XX" style={{ flex: 1, marginBottom: 0 }} />
              <button onClick={() => {
                const tel = document.getElementById("contact-tel")?.value || "";
                triggerCrisisAlert({ clientName, gp, profil: "", patternScores: {}, alertLevel, tel });
                setContactSent(true);
              }} style={{ background: C.orange, border: "none", color: "#fff", padding: "10px 16px", fontFamily: "'Jost',sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Envoyer
              </button>
            </div>
          </div>
        )
      ) : (
        <div style={{ fontSize: 12, color: C.green, padding: "10px 0" }}>✓ Demande envoyée — Un conseiller vous contactera sous 48h.</div>
      )}
    </div>
  );
  if (alertLevel === ALERT_LEVELS.INFO) return (
    <div style={{ background: "#0A0C08", border: "1px solid #C9A84C22", padding: "12px 16px", marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
        ◈ Certaines dimensions de votre bilan méritent une attention régulière. Le programme mensuel abonné vous permettra de suivre votre progression sur 12 mois.
      </div>
    </div>
  );
  return null;
}

// ─── COMPOSANT : TÉMOIGNAGES AUTO-GÉNÉRÉS ────────────────────────────────────
function TestimonialsModal({ clientName, gp, profil, patternScores, scores, onClose }) {
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState({ v1: "", v2: "", v3: "" });
  const [selected, setSelected] = useState(null);
  const [edited, setEdited] = useState("");
  const [shared, setShared] = useState(false);
  useEffect(() => {
    (async () => {
      const prompt = buildTestimonialsPrompt(clientName, profil, gp, patternScores, scores);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/diagnostic-report`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ report }) });
        const text = data.text || "";
        const v1 = text.match(/VERSION_1:\s*(.+?)(?=VERSION_2:|$)/s)?.[1]?.trim() || "";
        const v2 = text.match(/VERSION_2:\s*(.+?)(?=VERSION_3:|$)/s)?.[1]?.trim() || "";
        const v3 = text.match(/VERSION_3:\s*(.+?)$/s)?.[1]?.trim() || "";
        setVersions({ v1, v2, v3 });
      } catch { setVersions({ v1: "Le bilan m'a permis de nommer ce que je vivais sans pouvoir le dire.", v2: "", v3: "" }); }
      setLoading(false);
    })();
  }, []);
  const labels = ["Le choc de reconnaissance", "Le déclic émotionnel", "Le résultat concret"];
  const vList = [versions.v1, versions.v2, versions.v3];
  const handleShare = () => {
    const msg = `"${edited || vList[selected]}"
— ${clientName.charAt(0)}., Bilan Eden 360°
academie-eden.com`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
    setShared(true);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000EE", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0D1018", border: "1px solid #C9A84C44", maxWidth: 500, width: "100%", padding: "28px 24px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontSize: 9, letterSpacing: ".26em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>◈ Votre témoignage</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: "#F0EBE0", marginBottom: 8 }}>Partagez votre expérience</div>
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 20 }}>
          Votre parcours peut aider d'autres personnes à faire le premier pas. Choisissez la version qui vous ressemble le plus — vous pouvez la modifier avant de partager.
        </p>
        {loading ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div className="loading-ring" style={{ margin: "0 auto 12px" }} />
            <div style={{ fontSize: 12, color: C.muted }}>Génération de vos témoignages…</div>
          </div>
        ) : (
          <div>
            {vList.filter(v => v).map((v, i) => (
              <div key={i} onClick={() => { setSelected(i); setEdited(v); }} style={{ background: selected === i ? "#0A1208" : "#080C10", border: `1px solid ${selected === i ? "#4A9B6A" : "#1E2330"}`, padding: "14px 16px", marginBottom: 10, cursor: "pointer", transition: "all .2s" }}>
                <div style={{ fontSize: 9, color: selected === i ? C.green : C.dim, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 6 }}>{labels[i]}</div>
                <div style={{ fontSize: 13, color: selected === i ? "#F0EBE0" : C.muted, lineHeight: 1.7, fontStyle: "italic" }}>"{v}"</div>
              </div>
            ))}
            {selected !== null && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, color: C.gold, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>Modifier si souhaité</div>
                <textarea className="ta" value={edited} onChange={e => setEdited(e.target.value)} style={{ minHeight: 80 }} />
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={onClose} style={{ flex: 1, background: "transparent", border: "1px solid #1E2330", color: C.dim, padding: "11px", fontFamily: "'Jost',sans-serif", fontSize: 11, cursor: "pointer" }}>Fermer</button>
              <button onClick={handleShare} disabled={selected === null} style={{ flex: 2, background: selected !== null ? "#25D366" : "#1E2330", border: "none", color: "#fff", padding: "11px", fontFamily: "'Jost',sans-serif", fontSize: 12, fontWeight: 600, cursor: selected !== null ? "pointer" : "not-allowed" }}>
                {shared ? "✓ Partagé" : "Partager sur WhatsApp"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ─── COMPOSANT : RAPPORT INTERNE CONSEILLER ──────────────────────────────────
// Protégé par mot de passe + téléchargeable en PDF
function InternalReportModal({ clientName, profil, genre, role, annees, enfants, scores, opens, patternScores, gp, rawAns, alertLevel, onClose }) {
  const [step, setStep] = useState("auth");
  const [pwd, setPwd] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [reportText, setReportText] = useState("");
  const [generating, setGenerating] = useState(false);
  const reportRef = useRef(null);

  const authenticate = () => {
    if (pwd === INTERNAL_REPORT_PASSWORD) { 
      setStep("loading"); 
      generateInternalReport(); 
    } else setPwdErr("Mot de passe incorrect.");
  };

  const generateInternalReport = async () => {
    setGenerating(true);
    const prompt = buildInternalReportPrompt(clientName, profil, genre, role, annees, enfants, scores, opens, patternScores, gp, rawAns, alertLevel);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/diagnostic-report`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ report }) });
      setReportText(data.text || "Erreur de génération.");
    } catch { setReportText("Erreur de connexion. Vérifiez le backend."); }
    setGenerating(false);
    setStep("report");
  };

  const handlePrintPDF = () => {
    const printWin = window.open("", "_blank");
    const urgenceLabel = alertLevel >= ALERT_LEVELS.CRISE ? "🔴 CRISE" : alertLevel >= ALERT_LEVELS.VIGILANCE ? "🟠 VIGILANCE" : alertLevel >= ALERT_LEVELS.INFO ? "🟡 INFO" : "🟢 STABLE";
    const scoresHtml = Object.entries(scores).map(([, v]) => 
      `<tr><td>${v.label}</td><td style="text-align:center;font-weight:bold;color:${v.p >= 65 ? "#2D6A4F" : v.p >= 50 ? "#8B6914" : v.p >= 35 ? "#C0784A" : "#C0614A"}">${v.p}/100</td><td>${v.lv.l}</td></tr>`
    ).join("");
    const patternsHtml = Object.entries(patternScores || {}).filter(([, v]) => v > 40).map(([k, v]) => 
      `<tr><td><strong>${k}</strong></td><td style="text-align:center">${v}/100</td><td>${ARCHETYPES[k]?.titre || ""}</td><td style="font-size:11px;color:#555">${ARCHETYPES[k]?.mecanisme?.slice(0, 150) || ""}...</td></tr>`
    ).join("");
    const opensHtml = opens.filter(o => o.ans?.trim()).map(o => 
      `<tr><td style="font-size:11px;color:#555">${o.q}</td><td style="font-size:12px">${o.ans}</td></tr>`
    ).join("");
    const reportHtml = reportText.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
    
    printWin.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapport Interne — ${clientName}</title><style> body{font-family:Arial,sans-serif;font-size:13px;color:#222;margin:0;padding:0} .page{max-width:700px;margin:0 auto;padding:32px} h1{font-size:22px;color:#0B0F1A;border-bottom:3px solid #C9A84C;padding-bottom:8px} h2{font-size:16px;color:#0B0F1A;margin-top:28px;margin-bottom:10px;background:#F5F3EE;padding:8px 12px} table{width:100%;border-collapse:collapse;margin-bottom:16px} td,th{border:1px solid #ddd;padding:7px 10px;vertical-align:top} th{background:#0B0F1A;color:#C9A84C;font-weight:bold;font-size:12px} .badge-crise{background:#C0614A;color:#fff;padding:3px 10px;font-weight:bold} .badge-vigilance{background:#C0784A;color:#fff;padding:3px 10px;font-weight:bold} .badge-info{background:#C9A84C;color:#0B0F1A;padding:3px 10px;font-weight:bold} .badge-stable{background:#4A9B6A;color:#fff;padding:3px 10px;font-weight:bold} .report-body{line-height:1.9;background:#FAFAF8;padding:16px;border-left:4px solid #C9A84C} .confidential{background:#0B0F1A;color:#C9A84C;text-align:center;padding:10px;font-size:11px;letter-spacing:.2em} @media print{.no-print{display:none}} </style></head><body> <div class="confidential">CONFIDENTIEL — USAGE INTERNE ACADÉMIE EDEN — NE PAS PARTAGER AVEC LE CLIENT</div> <div class="page"> <h1>Rapport Interne Conseiller</h1> <table><tr><th colspan="2">Fiche Signalétique</th></tr> <tr><td><strong>Client</strong></td><td>${clientName}</td></tr> <tr><td><strong>Profil</strong></td><td>${profil === "marie" ? "Marié(e)" : profil === "fiance" ? "Fiancé(e)" : "Célibataire"}${genre ? " · " + genre : ""}${role ? " · " + role : ""}</td></tr> <tr><td><strong>Score global</strong></td><td><strong>${gp}/100</strong></td></tr> <tr><td><strong>Urgence</strong></td><td><span class="${alertLevel >= ALERT_LEVELS.CRISE ? "badge-crise" : alertLevel >= ALERT_LEVELS.VIGILANCE ? "badge-vigilance" : alertLevel >= ALERT_LEVELS.INFO ? "badge-info" : "badge-stable"}">${urgenceLabel}</span></td></tr> <tr><td><strong>Date du bilan</strong></td><td>${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</td></tr>${annees ? `<tr><td><strong>Années mariage</strong></td><td>${annees} ans</td></tr>` : ""}${enfants ? `<tr><td><strong>Enfants</strong></td><td>${enfants}</td></tr>` : ""}
</table>
<h2>Scores par Dimension</h2>
<table><tr><th>Dimension</th><th>Score</th><th>Niveau</th></tr>${scoresHtml}</table>
${patternsHtml ? `<h2>Patterns Bibliques Détectés</h2><table><tr><th>Pattern</th><th>Score</th><th>Titre</th><th>Mécanisme</th></tr>${patternsHtml}</table>` : "<h2>Patterns</h2><p>Aucun pattern dominant détecté.</p>"}
${opensHtml ? `<h2>Réponses Ouvertes</h2><table><tr><th>Question</th><th>Réponse</th></tr>${opensHtml}</table>` : ""}
<h2>Analyse Clinique — Plan d'Action Conseiller</h2>
<div class="report-body">${reportHtml}</div>
<p style="margin-top:32px;font-size:10px;color:#888;text-align:center">Académie Eden · Institut de Leadership Familial · Fondé par Zady Zozoro · Document confidentiel généré le ${new Date().toLocaleDateString("fr-FR")}</p>
</div>
<div class="confidential">CONFIDENTIEL — USAGE INTERNE ACADÉMIE EDEN</div>
</body></html>`);
    printWin.document.close();
    setTimeout(() => printWin.print(), 500);
  };

  // Auth
  if (step === "auth") return (
    <div style={{ position: "fixed", inset: 0, background: "#000000F2", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0D1018", border: "1px solid #1E2330", maxWidth: 400, width: "100%", padding: "28px 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: ".24em", textTransform: "uppercase", color: C.dim, marginBottom: 12 }}>◈ Rapport Interne — Accès Équipe</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: "#F0EBE0", marginBottom: 16 }}>Accès Conseiller</div>
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>Ce rapport est réservé à l'équipe Eden. Mot de passe requis.</p>
        <input className="inp" type="password" placeholder="Mot de passe conseiller" value={pwd} onChange={e => { setPwd(e.target.value); setPwdErr(""); }} onKeyDown={e => e.key === "Enter" && authenticate()} />
        {pwdErr && <div style={{ fontSize: 11, color: C.red, marginBottom: 8 }}>{pwdErr}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={onClose} style={{ flex: 1, background: "transparent", border: "1px solid #1E2330", color: C.dim, padding: "11px", fontFamily: "'Jost',sans-serif", fontSize: 11, cursor: "pointer" }}>Annuler</button>
          <button onClick={authenticate} style={{ flex: 2, background: C.gold, border: "none", color: "#0B0F1A", padding: "11px", fontFamily: "'Jost',sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Accéder →</button>
        </div>
      </div>
    </div>
  );

  // Loading
  if (step === "loading") return (
    <div style={{ position: "fixed", inset: 0, background: "#000000F2", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div className="loading-ring" />
      <div style={{ fontSize: 12, color: C.muted }}>Génération du rapport interne conseiller…</div>
    </div>
  );

  // Report
  const reportSections = parseReport(reportText);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000F2", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div ref={reportRef} style={{ background: "#0D1018", border: "1px solid #C9A84C33", maxWidth: 620, width: "100%", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ background: "#080C10", borderBottom: "1px solid #1E2330", padding: "16px 20px", position: "sticky", top: 0, zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 8, letterSpacing: ".24em", textTransform: "uppercase", color: C.red, marginBottom: 4 }}>🔒 CONFIDENTIEL — USAGE INTERNE UNIQUEMENT</div>
            <div style={{ fontSize: 14, color: "#F0EBE0", fontWeight: 600 }}>Rapport Conseiller — {clientName}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handlePrintPDF} style={{ background: C.gold, border: "none", color: "#0B0F1A", padding: "8px 14px", fontFamily: "'Jost',sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>⬇ PDF</button>
            <button onClick={onClose} style={{ background: "transparent", border: "1px solid #1E2330", color: C.dim, padding: "8px 12px", fontFamily: "'Jost',sans-serif", fontSize: 11, cursor: "pointer" }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "20px" }}>
          <div style={{ background: "#080C10", border: "1px solid #1E2330", padding: "14px 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 10 }}>Fiche Signalétique</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px" }}>
              {[
                ["Client", clientName],
                ["Profil", profil === "marie" ? "Marié(e)" : profil === "fiance" ? "Fiancé(e)" : "Célibataire"],
                ["Score global", `${gp}/100`],
                ["Urgence", alertLevel >= ALERT_LEVELS.CRISE ? "🔴 CRISE" : alertLevel >= ALERT_LEVELS.VIGILANCE ? "🟠 VIGILANCE" : alertLevel >= ALERT_LEVELS.INFO ? "🟡 INFO" : "🟢 STABLE"],
                ["Date", new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })],
                ["Rôle", role || "N/A"],
              ].map(([k, v]) => <div key={k}><span style={{ fontSize: 10, color: C.dim }}>{k} : </span><span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{v}</span></div>)}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8 }}>Scores par Dimension</div>
            {Object.entries(scores).map(([, v]) => (
              <div key={v.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <div style={{ fontSize: 11, color: C.muted, width: 160, flexShrink: 0 }}>{v.label}</div>
                <div style={{ flex: 1, height: 4, background: "#1E2330" }}><div style={{ width: `${v.p}%`, height: "100%", background: v.p >= 65 ? C.green : v.p >= 50 ? C.gold : v.p >= 35 ? C.orange : C.red }} /></div>
                <div style={{ fontSize: 11, color: v.lv.c, width: 50, textAlign: "right", fontWeight: 600 }}>{v.p}/100</div>
              </div>
            ))}
          </div>

          {Object.entries(patternScores || {}).filter(([, v]) => v > 40).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: C.gold, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8 }}>Patterns Détectés — Preuves</div>
              {Object.entries(patternScores || {}).filter(([, v]) => v > 40).sort(([, a], [, b]) => b - a).map(([k, v]) => {
                const arch = ARCHETYPES[k];
                return (
                  <div key={k} style={{ background: "#080C10", border: `1px solid ${arch?.color || C.gold}33`, padding: "12px 14px", marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ fontSize: 13, color: arch?.color || C.gold, fontWeight: 600 }}>{k} — {arch?.titre}</div>
                      <div style={{ fontSize: 11, color: arch?.color || C.gold }}>{v}/100</div>
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>{arch?.mecanisme?.slice(0, 200)}…</div>
                    <div style={{ fontSize: 10, color: C.dim, marginTop: 4, fontStyle: "italic" }}>{arch?.ref} · {arch?.orientation?.slice(0, 120)}</div>
                  </div>
                );
              })}
            </div>
          )}

          {opens.filter(o => o.ans?.trim()).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: C.gold, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8 }}>Réponses Ouvertes</div>
              {opens.filter(o => o.ans?.trim()).map((o, i) => (
                <div key={i} style={{ background: "#080C10", border: "1px solid #1E2330", padding: "10px 14px", marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: C.dim, marginBottom: 4 }}>{o.q}</div>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7, fontStyle: "italic" }}>"{o.ans}"</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12 }}>Plan d'Action Conseiller</div>
            {reportSections.map((s, i) => (
              s.title
                ? <div key={i} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: C.gold, margin: "18px 0 8px", borderLeft: `3px solid ${C.gold}44`, paddingLeft: 12 }}>{s.title}</div>
                : <div key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.9, whiteSpace: "pre-wrap", marginBottom: 10 }}>{s.body}</div>
            ))}
          </div>
          <div style={{ fontSize: 9, color: C.dim, textAlign: "center", padding: "12px 0", borderTop: "1px solid #1E2330", marginTop: 16 }}>
            Académie Eden · Rapport confidentiel — Usage interne uniquement — {new Date().toLocaleDateString("fr-FR")}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT : PARTAGER RAPPORT AVEC CONSEILLER ──────────────────────────
function ShareWithConseiller({ clientName, gp, profil, riskLevel, patterns, scores, sections }) {
  const [step, setStep] = useState("closed");
  const [consentGiven, setConsentGiven] = useState(false);
  const [includeScores, setIncludeScores] = useState(true);
  const [includePatterns, setIncludePatterns] = useState(true);
  const [includeKeyPhrase, setIncludeKeyPhrase] = useState(true);
  const activePatterns = Object.entries(patterns || {})
    .filter(([, v]) => v > 40)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  const profilLabel = profil === "marie" ? "Marié(e)" : profil === "fiance" ? "Fiancé(e)" : "Célibataire";
  const phraseCle = sections?.find(s => (s.title || "").toUpperCase().includes("PHRASE") || (s.title || "").toUpperCase().includes("CLÉ"))?.body || "";

  function buildShareMessage() {
    let msg = `Bonjour Académie Eden,\n\n`;
    msg += `Je partage mon rapport Bilan 360° pour accompagnement.\n\n`;
    msg += `► PROFIL : ${clientName} · ${profilLabel}\n`;
    msg += `► SCORE GLOBAL : ${gp}/100 — ${riskLevel?.l || ""}\n`;
    if (includeScores && scores) {
      msg += `\n► SCORES PAR DIMENSION :\n`;
      Object.entries(scores).slice(0, 6).forEach(([, v]) => {
        const bar = v.p >= 65 ? "●●●●●" : v.p >= 50 ? "●●●●○" : v.p >= 35 ? "●●●○○" : "●●○○○";
        msg += `  ${v.label} : ${v.p}/100 ${bar}\n`;
      });
    }
    if (includePatterns && activePatterns.length > 0) {
      msg += `\n► PATTERNS DÉTECTÉS :\n`;
      activePatterns.forEach(([k, v]) => {
        msg += `  • ${k} (${v}/100)\n`;
      });
    }
    if (includeKeyPhrase && phraseCle) {
      msg += `\n► PHRASE CLÉ DE MON RAPPORT :\n"${phraseCle.slice(0, 200).trim()}${phraseCle.length > 200 ? "…" : ""}"\n`;
    }
    msg += `\n► CONSENTEMENT : Je consens explicitement au partage de ces données avec le Conseiller Eden pour un accompagnement personnalisé.\n`;
    msg += `► DATE DE CONSENTEMENT : ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}\n\n`;
    msg += `Je souhaite aller plus loin avec un accompagnement.`;
    return msg;
  }

  if (step === "closed") return (
    <div style={{ background: "#0A1208", border: "1px solid #4A9B6A33", borderLeft: "3px solid #4A9B6A", padding: "16px 20px", marginBottom: 16 }}>
      <div style={{ fontSize: 9, color: "#4A9B6A", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 8 }}>◈ Partager avec le Conseiller</div>
      <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 12 }}>
        Envoyez votre rapport complet à l'équipe Eden pour un accompagnement personnalisé. Vous choisissez ce que vous partagez.
      </p>
      <button onClick={() => setStep("consent")} style={{ background: "#4A9B6A", border: "none", color: "#fff", padding: "11px 18px", fontFamily: "'Jost',sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", width: "100%" }}>
        Partager mon rapport avec un Conseiller →
      </button>
    </div>
  );

  if (step === "consent") return (
    <div style={{ position: "fixed", inset: 0, background: "#000000EE", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0D1018", border: "1px solid #C9A84C44", maxWidth: 480, width: "100%", padding: "28px 24px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>◈ Consentement de partage</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: "#F0EBE0", marginBottom: 16, lineHeight: 1.35 }}>
          Choisissez ce que vous partagez
        </div>
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 20 }}>
          Ces informations seront transmises à l'équipe de l'Académie Eden uniquement, pour vous accompagner dans votre démarche. Elles ne seront jamais partagées avec des tiers.
        </p>
        {[
          { key: "scores", label: "Mes scores par dimension", sub: "Les 8-9 résultats chiffrés de mon bilan", val: includeScores, set: setIncludeScores, required: false },
          { key: "patterns", label: "Les patterns relationnels détectés", sub: "Les archétypes bibliques identifiés dans mon profil", val: includePatterns, set: setIncludePatterns, required: false },
          { key: "phrase", label: "La phrase clé de mon rapport", sub: "La phrase personnalisée générée par le Conseiller", val: includeKeyPhrase, set: setIncludeKeyPhrase, required: false },
        ].map(item => (
          <div key={item.key} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: "#080C14", border: "1px solid #1E2330", marginBottom: 8, cursor: "pointer" }} onClick={() => item.set(!item.val)}>
            <div style={{ width: 18, height: 18, border: `1px solid ${item.val ? "#C9A84C" : "#2A2E3A"}`, background: item.val ? "#C9A84C" : "transparent", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#0B0F1A", fontWeight: 700 }}>
              {item.val ? "✓" : ""}
            </div>
            <div>
              <div style={{ fontSize: 13, color: item.val ? "#F0EBE0" : C.muted }}>{item.label}</div>
              <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{item.sub}</div>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: "#0A0C10", border: `1px solid ${consentGiven ? "#C9A84C44" : "#1E2330"}`, marginBottom: 20, cursor: "pointer", marginTop: 12 }} onClick={() => setConsentGiven(!consentGiven)}>
          <div style={{ width: 18, height: 18, border: `1px solid ${consentGiven ? "#C9A84C" : "#C0614A"}`, background: consentGiven ? "#C9A84C" : "transparent", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#0B0F1A", fontWeight: 700 }}>
            {consentGiven ? "✓" : ""}
          </div>
          <div>
            <div style={{ fontSize: 12, color: consentGiven ? "#F0EBE0" : C.muted, fontWeight: 600 }}>Je consens au partage de ces informations avec l'équipe Eden</div>
            <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>Obligatoire — Ces données sont traitées de façon confidentielle conformément aux conditions d'utilisation.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setStep("closed")} style={{ flex: 1, background: "transparent", border: "1px solid #1E2330", color: C.dim, padding: "12px", fontFamily: "'Jost',sans-serif", fontSize: 11, cursor: "pointer" }}>Annuler</button>
          <button onClick={() => { if (consentGiven) setStep("confirm"); }} disabled={!consentGiven} style={{ flex: 2, background: consentGiven ? "#C9A84C" : "#1E2330", border: "none", color: consentGiven ? "#0B0F1A" : "#3A3E4A", padding: "12px", fontFamily: "'Jost',sans-serif", fontSize: 12, fontWeight: 600, cursor: consentGiven ? "pointer" : "not-allowed" }}>
            Prévisualiser mon message →
          </button>
        </div>
      </div>
    </div>
  );

  if (step === "confirm") {
    const msg = buildShareMessage();
    return (
      <div style={{ position: "fixed", inset: 0, background: "#000000EE", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#0D1018", border: "1px solid #4A9B6A44", maxWidth: 480, width: "100%", padding: "28px 24px", maxHeight: "90vh", overflowY: "auto" }}>
          <div style={{ fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: "#4A9B6A", marginBottom: 12 }}>◈ Prévisualisation du message</div>
          <div style={{ background: "#080C10", border: "1px solid #1E2330", padding: "14px", marginBottom: 20, borderRadius: 2 }}>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{msg}</div>
          </div>
          <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>Ce message s'ouvrira dans WhatsApp, adressé à l'Académie Eden. Vous pouvez le modifier avant d'envoyer.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep("consent")} style={{ flex: 1, background: "transparent", border: "1px solid #1E2330", color: C.dim, padding: "12px", fontFamily: "'Jost',sans-serif", fontSize: 11, cursor: "pointer" }}>← Modifier</button>
            <button onClick={() => { window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`); setStep("done"); }} style={{ flex: 2, background: "#25D366", border: "none", color: "#fff", padding: "12px", fontFamily: "'Jost',sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Envoyer sur WhatsApp →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "done") return (
    <div style={{ background: "#0A1208", border: "1px solid #4A9B6A44", borderLeft: "3px solid #4A9B6A", padding: "16px 20px", marginBottom: 16 }}>
      <div style={{ fontSize: 9, color: "#4A9B6A", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 8 }}>✓ Rapport partagé</div>
      <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>Votre rapport a été transmis à l'Académie Eden. Un Conseiller vous contactera sous 24-48h.</p>
    </div>
  );
  return null;
}

function SmartWhatsAppCTA({ clientName, gp, profil, riskLevel, patterns }) {
  const activePatterns = Object.keys(patterns || {}).filter(p => (patterns[p] || 0) > 40).slice(0, 2);
  const urgency = gp < 40 ? "URGENCE" : gp < 55 ? "PRIORITÉ" : "SUIVI";
  const formation = profil === "celibataire" ? "Eden Single" : profil === "fiance" ? "Eden Connexion" : gp < 45 ? "RESCUE 90 Jours" : "Les 12 Piliers";
  const prefilledMessage = `Bonjour Académie Eden,\n\n[${urgency}] Je viens de compléter mon Bilan 360°.\n\n📊 Score global : ${gp}/100 — ${riskLevel?.l || ""}\n👤 Profil : ${profil === "marie" ? "Marié(e)" : profil === "fiance" ? "Fiancé(e)" : "Célibataire"}${activePatterns.length > 0 ? `\n⚠ Patterns identifiés : ${activePatterns.join(", ")}` : ""}\n\nJe souhaite en savoir plus sur la formation "${formation}".\n\nMerci,\n${clientName}`;
  const buttonColor = gp < 45 ? C.red : gp < 60 ? C.orange : C.green;
  const buttonLabel = gp < 45 ? "Intervention urgente — Contacter maintenant" : gp < 60 ? "Prendre rendez-vous avec Zady Zozoro" : "Confirmer mon inscription à la formation";
  return (
    <div style={{ background: buttonColor + "12", border: `1px solid ${buttonColor}44`, borderLeft: `4px solid ${buttonColor}`, padding: "20px 22px", marginBottom: 24 }}>
      <div style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: buttonColor, marginBottom: 10 }}>{gp < 45 ? "⚠ Protocole d'urgence" : "✦ Prochaine étape"}</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#F0EBE0", marginBottom: 8, lineHeight: 1.4 }}>Formation recommandée : <span style={{ color: buttonColor }}>{formation}</span></div>
      <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 16 }}>Votre profil a été pré-analysé. En cliquant ci-dessous, Zady Zozoro reçoit directement votre résumé avant votre échange. <strong style={{ color: C.text }}>Vous n'avez rien à expliquer.</strong></p>
      <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(prefilledMessage)}`)} style={{ background: buttonColor, border: "none", color: "#fff", padding: "14px 24px", cursor: "pointer", fontFamily: "'Jost',sans-serif", fontSize: 12, fontWeight: 600, width: "100%", letterSpacing: ".04em" }}>{buttonLabel}</button>
      {gp >= 45 && <div style={{ fontSize: 10, color: "#4A5060", marginTop: 10, textAlign: "center" }}>Le montant du bilan (25 000 FCFA) est déduit du prix de la formation</div>}
    </div>
  );
}

function LegalDisclaimer({ gp, hasViolenceSignal }) {
  const critical = gp < 40 || hasViolenceSignal;
  return (
    <div style={{ background: "#080A10", border: "1px solid #1E2230", padding: "16px 18px", marginTop: 32, fontSize: 10, color: "#3A3E4A", lineHeight: 1.8 }}>
      {critical && <div style={{ background: "#1A0808", border: "1px solid #C0614A33", padding: "10px 14px", marginBottom: 14, fontSize: 11, color: "#E8A090", lineHeight: 1.7 }}>⚠ Situation critique détectée : ce bilan ne remplace pas une intervention professionnelle. Si vous êtes en danger, contactez le 1010 (Côte d'Ivoire), 116 (Sénégal) ou 3919 (France).</div>}
      <p><strong style={{ color: "#5A5E6A" }}>Avis important ·</strong> Ce bilan est un outil d'auto-évaluation éducatif. Il ne constitue pas un avis médical, psychologique ou thérapeutique, et ne remplace pas l'avis d'un professionnel qualifié. Les résultats reflètent vos perceptions au moment de la réponse.</p>
      <p style={{ marginTop: 8 }}>Vos données sont traitées conformément aux conditions d'utilisation acceptées lors de l'accès au bilan. Conservation : 24 mois. Droit à l'effacement sur demande via WhatsApp.</p>
      <p style={{ marginTop: 8, color: "#2A2E3A" }}>Académie Eden · Institut de Leadership Familial · Abidjan, Côte d'Ivoire · Fondée par Zady Zozoro © 2025</p>
    </div>
  );
}

// Question UI components for Portrait
function QuestionChoix({ q, value, onChange }) {
  return (
    <div className="mb24">
      <div className="q-text">{q.question}</div>
      {q.options.map(opt => (
        <div key={opt.val} className={`opt ${value === opt.val ? "selected" : ""}`} onClick={() => onChange(opt.val)}>
          <div className="opt-dot" /><div className="opt-label">{opt.label}</div>
        </div>
      ))}
      {q.followUp && value && (!q.condition || q.condition(value)) && (
        <div>
          <div className="q-follow">{q.followUp}</div>
          <textarea className="ta" placeholder="Répondez en vos propres mots…" onChange={e => onChange(value, e.target.value)} />
        </div>
      )}
    </div>
  );
}

function QuestionOuvert({ q, value, onChange }) {
  return (
    <div className="mb24">
      <div className="q-text">{q.question}</div>
      <textarea className={`ta ${q.type === "ouvert_court" ? "ta-short" : ""}`} placeholder={q.placeholder || "Votre réponse…"} value={value || ""} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function QuestionLikert({ q, value, onChange }) {
  return (
    <div className="mb24">
      <div className="q-text">{q.question}</div>
      <div className="likert">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} className={`likert-btn ${value === n ? "selected" : ""}`} onClick={() => onChange(n)}>{n}<br />{q.scale[n - 1]}</button>
        ))}
      </div>
    </div>
  );
}

function QuestionMultiCheck({ q, values, onChange, openValue, onOpenChange }) {
  const toggle = val => {
    const current = values || [];
    if (current.includes(val)) onChange(current.filter(v => v !== val));
    else onChange([...current, val]);
  };
  return (
    <div className="mb24">
      <div className="q-text">{q.question}</div>
      {q.options.map(opt => (
        <div key={opt.val} className={`check-item ${(values || []).includes(opt.val) ? "selected" : ""}`} onClick={() => toggle(opt.val)}>
          <div className="check-box">{(values || []).includes(opt.val) && "✓"}</div>
          <div className="opt-label">{opt.label}</div>
        </div>
      ))}
      {q.followUp && q.condition && q.condition(values) && (
        <div>
          <div className="q-follow">{q.followUp}</div>
          <textarea className="ta" placeholder="Décrivez ce schéma…" value={openValue || ""} onChange={e => onOpenChange(e.target.value)} />
        </div>
      )}
    </div>
  );
}

function RankingLangages({ values, onChange }) {
  const [ranked, setRanked] = useState(values || []);
  const selectItem = id => {
    setRanked(prev => {
      if (prev.includes(id)) { const next = prev.filter(v => v !== id); onChange(next); return next; }
      if (prev.length >= 5) return prev;
      const next = [...prev, id]; onChange(next); return next;
    });
  };
  return (
    <div className="rank-list">
      {PROFIL_APPRECIATION_OPTIONS.map(opt => {
        const pos = ranked.indexOf(opt.id);
        return (
          <div key={opt.id} className={`rank-item ${pos >= 0 ? "ranked" : ""}`} onClick={() => selectItem(opt.id)}>
            <div className="rank-num">{pos >= 0 ? pos + 1 : opt.icon}</div>
            <div className="rank-label">{opt.label}</div>
          </div>
        );
      })}
      <div style={{ fontSize: 10, color: "#3A3E4A", marginTop: 4 }}>Cliquez dans l'ordre de vos préférences (1 = le plus important)</div>
    </div>
  );
}

function ScenarioAttachement({ scenario, value, onChange }) {
  return (
    <div style={{ background: "#0D1018", border: "1px solid #1E2330", padding: "18px", marginBottom: 16 }}>
      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 14, fontStyle: "italic" }}>"{scenario.scenario}"</div>
      {scenario.reponses.map(r => (
        <div key={r.val} className={`opt ${value === r.val ? "selected" : ""}`} onClick={() => onChange(r.val)}>
          <div className="opt-dot" /><div className="opt-label">{r.label}</div>
        </div>
      ))}
    </div>
  );
}
// ── RENDER VIEWS ──
  if (view === "code_entry") {
    return (
      <div className="section">
        <div className="section-tag">◈ Bilan 360° Eden</div>
        <div className="section-title">Entrez votre code d'accès</div>
        <div className="section-desc">Votre code vous a été remis par l'Académie Eden. Il est à usage unique et personnel.</div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: C.gold, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>Votre prénom</div>
          <input className="inp" placeholder="Jean-Marc" value={clientName} onChange={e => setClientName(e.target.value)} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: C.gold, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>Genre</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Homme", "Femme"].map(g => <div key={g} className={`opt ${clientGenre === g ? "selected" : ""}`} style={{ flex: 1 }} onClick={() => setClientGenre(g)}><div className="opt-dot" /><div className="opt-label">{g}</div></div>)}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: C.gold, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>Profil</div>
          {[{ id: "marie", label: "Marié(e)" }, { id: "fiance", label: "Fiancé(e)" }, { id: "celibataire", label: "Célibataire" }].map(p => (
            <div key={p.id} className={`opt ${clientProfil === p.id ? "selected" : ""}`} onClick={() => setClientProfil(p.id)}><div className="opt-dot" /><div className="opt-label">{p.label}</div></div>
          ))}
        </div>
        {clientProfil === "marie" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: C.gold, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>Années de mariage</div>
              <input className="inp" placeholder="Ex: 7" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={clientAnnees} onChange={e => setClientAnnees(e.target.value.replace(/[^0-9]/g, ""))} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: C.gold, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>Nombre d'enfants</div>
              <input className="inp" placeholder="Ex: 2" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={clientEnfants} onChange={e => setClientEnfants(e.target.value.replace(/[^0-9]/g, ""))} />
            </div>
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: C.gold, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>Profession (optionnel)</div>
          <select className="inp" style={{ cursor: "pointer" }} value={clientRole} onChange={e => setClientRole(e.target.value)}>
            <option value="">Sélectionner…</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {clientRole === "Autre" && <input className="inp" placeholder="Précisez votre profession" value={clientRoleCustom} onChange={e => setClientRoleCustom(e.target.value)} />}
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: C.gold, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>Code d'accès</div>
          <input className="inp" placeholder="XXXX-XXXX" value={enteredCode} onChange={e => setEnteredCode(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCodeEntry()} />
        </div>
        {codeMsg.text && <div style={{ fontSize: 12, color: codeMsg.ok ? C.green : C.red, marginBottom: 12 }}>{codeMsg.text}</div>}
        <button className="btn-primary" onClick={handleCodeEntry}>Commencer mon bilan →</button>
        <div style={{ marginTop: 16, fontSize: 11, color: C.dim, lineHeight: 1.6 }}>Vous n'avez pas de code ? <span style={{ color: C.gold, cursor: "pointer", textDecoration: "underline" }} onClick={() => window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent("Bonjour, je souhaite obtenir un code d'accès pour le Bilan 360° Eden.")}`)}>Contactez l'Académie Eden sur WhatsApp</span></div>
      </div>
    );
  }
  if (view === "diagnostic" && mod) {
    const progress = (dimIdx / dims.length) * 85;
    if (phase === "q") {
      const dimOk = dim?.qs.every(q => ans[q.id] !== undefined);
      const allOk = dims.every(d => d.qs.every(q => ans[q.id] !== undefined));
      return (
        <div className="section">
          {facadeActive && <FacadeAlert ans={ans} profil={clientProfil} onContinue={() => handleCheckViolence()} onRevise={() => setFacadeActive(false)} />}
          {violenceSignals && <ViolenceProtocol signals={violenceSignals} onContinue={() => handleSubmit()} />}
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>Dimension {dimIdx + 1}/{dims.length} — {dim?.label}</div>
          {dim && (
            <div>
              {dim.qs.map(q => (
                <div key={q.id} style={{ marginBottom: 24 }}>
                  <div className="q-text">{q.t}</div>
                  <div className="scale-row">
                    {SCALE.map(v => (
                      <button key={v} className={`scale-btn ${ans[q.id] === v ? "selected" : ""}`} onClick={() => doAns(q.id, v)}>
                        {v}<br /><span style={{ fontSize: 9 }}>{SL[v]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="nav-row">
            <button className="btn-secondary" style={{ flex: "0 0 auto" }} onClick={() => { if (dimIdx === 0) setView("code_entry"); else setDimIdx(i => i - 1); }}>← Retour</button>
            <button className="btn-primary" disabled={!dimOk} onClick={() => {
              if (dimIdx < dims.length - 1) setDimIdx(i => i + 1);
              else if (allOk) setPhase("oq");
            }}>{dimIdx < dims.length - 1 ? "Suivant →" : "Questions ouvertes →"}</button>
          </div>
        </div>
      );
    }
    if (phase === "oq") {
      return (
        <div className="section">
          <div className="section-tag">◈ Questions ouvertes</div>
          <div className="section-title">Quelques mots de vous</div>
          <div className="section-desc">Ces questions permettent au Conseiller Eden de personnaliser davantage votre rapport. Répondez librement — ou passez si vous préférez.</div>
          {mod.oqs.map(q => (
            <div key={q.id} style={{ marginBottom: 24 }}>
              <div className="q-text">{q.t}</div>
              <textarea className="ta" value={oAns[q.id] || ""} onChange={e => doOAns(q.id, e.target.value)} />
            </div>
          ))}
          <div className="nav-row">
            <button className="btn-secondary" style={{ flex: "0 0 auto" }} onClick={() => setPhase("q")}>← Retour</button>
            <button className="btn-primary" onClick={handleCheckFacade}>Générer mon rapport →</button>
          </div>
        </div>
      );
    }
  }
  if (view === "loading") {
    const msgs = LOADING_MSGS[clientProfil] || LOADING_MSGS.marie;
    const safeIdx = loadIdx % msgs.length;
    return (
      <div className="loading-screen">
        <div className="loading-ring" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 9, color: C.gold, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 12 }}>{msgs[safeIdx][0]}</div>
          <div className="loading-msg">{msgs[safeIdx][1]}</div>
        </div>
        <div className="loading-sub">Académie Eden · Analyse en cours</div>
      </div>
    );
  }
  if (view === "results" && results) {
    const sections = parseReport(results.text);
    const gl = lvl(results.gp);
    const formations = FORMATIONS.filter(f => f.profil.includes(results.profil));
    const activePatterns = results.patternScores ? Object.entries(results.patternScores).filter(([, v]) => v > 40).sort(([, a], [, b]) => b - a) : [];
    const entries = Object.entries(results.scores);
    const N = entries.length;
    const CX = 200, CY = 200, R = 140, RINT = 28;
    const radarPts = entries.map(([k, d], i) => { const angle = (2 * Math.PI * i / N) - Math.PI / 2; const r2 = RINT + (d.p / 100) * (R - RINT); return { x: CX + r2 * Math.cos(angle), y: CY + r2 * Math.sin(angle), k, d, angle }; });
    const poly = radarPts.map(p => `${p.x},${p.y}`).join(" ");
    const bm = BM[results.profil] || {};
    const remaining = MAX_QUESTIONS - questionsUsed;
    const clockData = canHorloge ? computeRelationshipClock(results.gp, results.patternScores || {}, clientAnnees, results.profil) : null;
    return (
      <div className="section">
        {activeLetterModal && (
          letterLoading ? (
            <div style={{ position: "fixed", inset: 0, background: "#000000F0", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
              <div className="loading-ring" /><div style={{ fontSize: 12, color: C.muted }}>Génération de votre lettre…</div>
            </div>
          ) : (
            <FutureLetter letter={letterText} clientName={clientName} gp={results.gp} onClose={() => setActiveLetterModal(false)} />
          )
        )}
        {shareCardActive && canViralShare && <ViralShareCard clientName={clientName} gp={results.gp} profil={results.profil} riskLevel={gl} onClose={() => setShareCardActive(false)} />}
        <div style={{ background: "linear-gradient(135deg,#0B0F1A,#0D1020,#080A10)", border: "1px solid #1E2330", padding: "24px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 8, letterSpacing: ".3em", textTransform: "uppercase", color: C.gold, marginBottom: 8 }}>Bilan 360° Eden — {MODS[results.profil]?.label}</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: "#F0EBE0", marginBottom: 4 }}>Rapport de {clientName}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 48, color: gl.c, lineHeight: 1 }}>{results.gp}</div>
            <div>
              <div style={{ fontSize: 14, color: gl.c }}>/100</div>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".1em", textTransform: "uppercase" }}>{gl.l}</div>
            </div>
          </div>
        </div>
        <AlertBanner alertLevel={results.alertLevel || 0} clientName={clientName} gp={results.gp} />
        {testimonialsOpen && <TestimonialsModal clientName={clientName} gp={results.gp} profil={results.profil} patternScores={results.patternScores || {}} scores={results.scores} onClose={() => setTestimonialsOpen(false)} />}
        {internalReportOpen && <InternalReportModal clientName={clientName} profil={results.profil} genre={clientGenre} role={clientRole === "Autre" && clientRoleCustom ? clientRoleCustom : clientRole} annees={clientAnnees} enfants={clientEnfants} scores={results.scores} opens={results.openAns || []} patternScores={results.patternScores || {}} gp={results.gp} rawAns={results.rawAns || {}} alertLevel={results.alertLevel || 0} onClose={() => setInternalReportOpen(false)} />}
        {activePatterns.length > 0 && (
          <div className="pat-box" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>Patterns archétypaux détectés</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {activePatterns.map(([k, v]) => <span key={k} style={{ padding: "3px 10px", border: `1px solid ${ARCHETYPES[k]?.color || C.gold}66`, fontSize: 10, color: ARCHETYPES[k]?.color || C.gold }}>{k}</span>)}
            </div>
          </div>
        )}
        {results.indices && Object.keys(results.indices).length > 0 && (
          <div className="indices-grid">
            {Object.entries(results.indices).map(([k, v]) => (
              <div key={k} className="index-card" onClick={() => setModal({ title: IE[k]?.titre || k, sub: "Indice composite", body: IE[k]?.def || "", danger: false })}>
                <div style={{ fontSize: 9, color: v.color, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 6 }}>{k}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: v.color, lineHeight: 1 }}>{v.p}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{v.label}</div>
              </div>
            ))}
          </div>
        )}
        <div className="radar-wrap">
          <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>◈ Carte dimensionnelle</div>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 12 }}>Cliquez sur une dimension pour l'analyser</div>
          <svg viewBox="0 0 400 400" style={{ width: "100%", maxWidth: 380, display: "block", margin: "0 auto" }}>
            {[20, 40, 60, 80, 100].map(pp => {
              const r2 = RINT + (pp / 100) * (R - RINT);
              const rp = Array.from({ length: N }, (_, i) => { const a = (2 * Math.PI * i / N) - Math.PI / 2; return `${CX + r2 * Math.cos(a)},${CY + r2 * Math.sin(a)}`; }).join(" ");
              return <polygon key={pp} points={rp} fill="none" stroke="#1E2330" strokeWidth="1" />;
            })}
            {entries.map(([k], i) => { const a = (2 * Math.PI * i / N) - Math.PI / 2; return <line key={k} x1={CX} y1={CY} x2={CX + (R + 12) * Math.cos(a)} y2={CY + (R + 12) * Math.sin(a)} stroke="#1E2330" strokeWidth="1" />; })}
            <polygon points={poly} fill="#C9A84C18" stroke="#C9A84C" strokeWidth="1.5" />
            {radarPts.map((p, i) => (
              <g key={i} style={{ cursor: "pointer" }} onClick={() => setModal({ title: DE[p.k]?.titre || p.d.label, sub: `Score : ${p.d.p}/100 — ${p.d.lv.l}`, body: DE[p.k]?.texte || "", danger: false })}>
                <circle cx={p.x} cy={p.y} r="5" fill={p.d.lv.c} />
              </g>
            ))}
            {radarPts.map((p, i) => { const isR = Math.cos(p.angle) > 0.1, isL = Math.cos(p.angle) < -0.1; const anchor = isR ? "start" : isL ? "end" : "middle"; const lx = CX + (R + 26) * Math.cos(p.angle), ly = CY + (R + 26) * Math.sin(p.angle); return <text key={i} x={lx} y={ly} textAnchor={anchor} fontSize="9" fill={C.dim}>{p.d.label.split(" ")[0]}</text>; })}
          </svg>
        </div>
        <div className="sg">
          {entries.map(([k, d]) => {
            const sp = bm[k]?.stable || null;
            return (
              <div key={k} className="score-bar-item" onClick={() => setModal({ title: DE[k]?.titre || d.label, sub: `Score : ${d.p}/100 — ${d.lv.l}`, body: DE[k]?.texte || "", danger: false })}>
                <div className="score-bar-header">
                  <span className="score-bar-label">{d.label}</span>
                  <span className="score-bar-value" style={{ color: d.lv.c }}>{d.p}/100</span>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: `${d.p}%`, background: d.lv.c }} />
                </div>
                {sp && <div style={{ fontSize: 9, color: C.dim, marginTop: 3 }}>Référence stable : {sp}/100{d.p >= sp ? " ✓" : ` (${d.p - sp})`}</div>}
              </div>
            );
          })}
        </div>
        {sections.map((s, i) => {
          const t = (s.title || "").toUpperCase();
          const isPlan = t.includes("PLAN") || t.includes("7 JOURS") || t.includes("ACTION");
          const isReco = t.includes("PRESCRIPTION") || t.includes("RECOMMANDATION");
          const isPhrase = t.includes("PHRASE") || t.includes("CLÉ") || t.includes("CLE");
          if (isPlan) return <div key={i} className="plan-box"><div className="plan-title">✦ {s.title}</div><div className="rbt">{s.body}</div></div>;
          if (isReco) return <div key={i} className="reco-box"><div className="reco-title">✦ {s.title}</div><div className="rbt">{s.body}</div></div>;
          if (isPhrase) return <div key={i} className="phrase-box"><div className="phrase-text">"{s.body}"</div></div>;
          return <div key={i} className="rb">{s.title && <div className="stl">{s.title}</div>}<div className="rbt">{s.body}</div></div>;
        })}
        {clockData && canHorloge && <RelationshipClock clockData={clockData} />}
        {!canHorloge && results.profil === "marie" && (
          <PremiumGate feature="Horloge Relationnelle — Projection temporelle Gottman" onUpgrade={onRequestUpgrade} />
        )}
        {canMicroPertes ? (
          <MicroPertesSection scores={results.scores} profil={results.profil} />
        ) : results.profil !== "celibataire" && (
          <PremiumGate feature="Micro-Pertes Invisibles — Ce que vous perdez déjà" onUpgrade={onRequestUpgrade} />
        )}
        {!canLectureMiroir && results.profil !== "celibataire" && (
          <PremiumGate feature="Lecture Miroir Enrichie — Ce que votre partenaire ressent probablement" onUpgrade={onRequestUpgrade} />
        )}
        <SmartWhatsAppCTA clientName={clientName} gp={results.gp} profil={results.profil} riskLevel={gl} patterns={results.patternScores || {}} />
        {canFutureLetter ? (
          <div className="card-gold-left" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 10 }}>◈ Lettre du Moi dans 5 ans</div>
            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 14 }}>Une lettre générée à la première personne, depuis votre futur possible. Technique utilisée en thérapie cognitive émotionnelle.</p>
            <button onClick={handleGenerateLetter} className="btn-gold-outline" style={{ width: "100%" }}>Recevoir la lettre de mon futur</button>
          </div>
        ) : (
          <PremiumGate feature="Lettre du Moi Futur — Impact émotionnel maximal" onUpgrade={onRequestUpgrade} />
        )}
        {canViralShare ? (
          <div className="card-gold" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 10 }}>◈ Partager votre révélation</div>
            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 14 }}>Partagez votre score et votre verdict sans révéler votre rapport complet.</p>
            <button className="btn-wa" onClick={() => setShareCardActive(true)}>Générer ma carte de partage</button>
          </div>
        ) : (
          <PremiumGate feature="Carte Virale de Partage — Moteur de vente autonome" onUpgrade={onRequestUpgrade} />
        )}
        <div style={{ marginBottom: 8 }}><div className="stl">Formations recommandées</div></div>
        <div className="form-grid">
          {formations.map(f => (
            <div key={f.id} className="form-card" onClick={() => setModal({ title: f.nom, sub: f.detail || "Formation Eden Académie", body: `${f.desc}\n\nPrix : ${f.prix}`, danger: false })}>
              <div className="form-card-name">{f.nom}</div>
              <div className="form-card-prix">{f.prix}</div>
              <div className="form-card-desc">{f.desc.slice(0, 80)}…</div>
            </div>
          ))}
        </div>
        <div className="qa-section">
          <div className="qa-header">✦ Approfondissez votre bilan<span className={`qa-counter ${remaining === 0 ? "exhausted" : ""}`}>{remaining} question{remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""}</span></div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>Posez jusqu'à {MAX_QUESTIONS} questions personnalisées sur votre rapport.</div>
          {chatHistory.length > 0 && (
            <div className="qa-history">
              {chatHistory.map((msg, i) => (
                <div key={i} className={msg.role === "user" ? "qa-bubble-user" : "qa-bubble-ai"}>
                  <div className="qa-bubble-label" style={{ color: msg.role === "user" ? C.gold : C.green }}>{msg.role === "user" ? clientName : "Eden Académie"}</div>
                  <div className="qa-bubble-text">{msg.content}</div>
                </div>
              ))}
              {chatLoading && <div className="qa-typing"><span style={{ fontSize: 9, color: C.green, letterSpacing: ".12em", textTransform: "uppercase", marginRight: 6 }}>Eden</span><span className="qa-dot" /><span className="qa-dot" /><span className="qa-dot" /></div>}
              <div ref={chatEndRef} />
            </div>
          )}
          {remaining > 0 ? (
            <div className="qa-input-row">
              <textarea className="ta" style={{ marginBottom: 0, minHeight: 56 }} placeholder="Posez votre question…" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAskQuestion(); } }} disabled={chatLoading} />
              <button className="qa-send" onClick={handleAskQuestion} disabled={!chatInput.trim() || chatLoading}>{chatLoading ? "…" : "Envoyer"}</button>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 13, color: C.gold, fontFamily: "'Cormorant Garamond',serif", marginBottom: 6 }}>Vous avez utilisé vos {MAX_QUESTIONS} questions</div>
              <div style={{ fontSize: 11, color: C.muted }}>Pour un accompagnement personnalisé, contactez l'Académie Eden.</div>
            </div>
          )}
            </div>

        <ShareWithConseiller
          clientName={clientName}
          gp={results.gp}
          profil={results.profil}
          riskLevel={gl}
          patterns={results.patternScores || {}}
          scores={results.scores}
          sections={sections}
        />

        <LegalDisclaimer
          gp={results.gp}
          hasViolenceSignal={violenceSignals !== null}
        />

           </div>
    );
  }

  return null;
}
const AffichageResultat = ({ phase, nom, profil, rapport, appreciationRecevoir, appreciationDonner, repAttachement }) => {

  if (phase === "generation") return (
    <div className="loading-screen">
      <div className="loading-ring" />
      <div className="loading-msg">{loadMsg}</div>
      <div className="loading-sub">Académie Eden · Portrait en cours de rédaction</div>
    </div>
  );

function AfficherMonRapport({ phase, nom, profil, rapport, appreciationRecevoir, appreciationDonner, repAttachement }) {

const RapportSection = ({ phase, nom, profil, rapport, appreciationRecevoir, appreciationDonner, repAttachement }) => {

// ── RAPPORT ──
  if (phase === "rapport") { }
    const attachStyle = computeAttachementStyle(repAttachement);
    const primaryRecevoir = PROFIL_APPRECIATION_OPTIONS.find(o => o.id === appreciationRecevoir[0])?.label || "Non renseigné";
    const primaryDonner = PROFIL_APPRECIATION_OPTIONS.find(o => o.id === appreciationDonner[0])?.label || "Non renseigné";
    const decalage = appreciationRecevoir[0] !== appreciationDonner[0];
    const sections = rapport.split(/\*\*([^*]+)\*\*/).reduce((acc, part, i) => {
      if (i % 2 === 0) {
        if (part.trim()) acc.push({ type: "body", text: part.trim() });
      } else {
        acc.push({ type: "title", text: part.trim() });
      }
      return acc;
    }, []);
    return (
      <div className="section">
        <div style={{ background: "linear-gradient(135deg,#0B0F1A,#0D1020)", border: "1px solid #C9A84C33", padding: "24px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 8, letterSpacing: ".28em", textTransform: "uppercase", color: C.gold, marginBottom: 8 }}>◈ Portrait Eden · Eaux · Os · Chair</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: "#F0EBE0", marginBottom: 4 }}>{nom}</div>
          <div style={{ fontSize: 10, color: C.dim }}>{new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
        </div>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="stl">Synthèse · Profil d'Appréciation & Attachement</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}><span style={{ color: C.gold }}>Vous recevez l'amour principalement par :</span><br />{primaryRecevoir}</div>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}><span style={{ color: C.gold }}>Vous exprimez l'amour naturellement par :</span><br />{primaryDonner}</div>
            {decalage && <div style={{ background: "#1A1000", border: "1px solid #C9A84C33", padding: "10px 14px", fontSize: 11, color: C.gold, lineHeight: 1.6 }}>◈ Décalage interne : vous donnez l'amour différemment de la manière dont vous aimeriez le recevoir. Ce décalage peut créer de l'incompréhension dans vos relations.</div>}
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}><span style={{ color: C.blue }}>Style d'attachement probable :</span><br />{attachStyle}</div>
          </div>
        </div>
        <div className="rb">
          <div className="stl">Votre Portrait Complet</div>
          {sections.map((s, i) => (
            s.type === "title"
              ? <div key={i} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: C.gold, margin: "20px 0 10px" }}>{s.text}</div>
              : <div key={i} className="rbt" style={{ marginBottom: 12 }}>{s.text}</div>
          ))}
        </div>
        <div style={{ background: "#0A0C12", border: "1px solid #1E2330", padding: "14px", marginBottom: 20, fontSize: 10, color: C.dim, lineHeight: 1.7 }}>Ce portrait est une analyse indicative basée sur vos réponses. Il ne remplace pas un accompagnement professionnel et ne constitue pas un avis médical ou psychologique.</div>
        <div className="cta-box">
          <div className="cta-title">Aller plus loin, {nom}</div>
          <p className="cta-sub">Ce portrait est votre point de départ. Pour un accompagnement direct avec Zady Zozoro, contactez l'Académie Eden.</p>
          <button className="btn-wa" onClick={() => window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(`Bonjour Académie Eden,\n\nJe viens de compléter mon Portrait Eden.\nPrénom : ${nom} · Profil : ${profil}\n\nJe souhaite aller plus loin avec un accompagnement.`)}`)}>Contacter l'Académie Eden · WhatsApp</button>
        </div>
        <LegalDisclaimer gp={75} hasViolenceSignal={false} />
      </div>
    );
  }
  }
  };
// ═══════════════════════════════════════════════════════════════════════════
// SECTION 9 — MODULE ADMIN
// ═══════════════════════════════════════════════════════════════════════════
function AdminModule({ codes, onSaveCodes, onBack }) {
  const [genCount, setGenCount] = useState(10);
  const [newCodes, setNewCodes] = useState([]);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("codes");
  const total = Object.keys(codes).length;
  const usedC = Object.values(codes).filter(c => c.used).length;
  const coupleCount = new Set(Object.values(codes).filter(c => c.coupleId).map(c => c.coupleId)).size;
  const recentUsed = Object.entries(codes).filter(([, c]) => c.used && c.usedAt).sort(([, a], [, b]) => new Date(b.usedAt) - new Date(a.usedAt)).slice(0, 10);

  async function handleGenerate(isCouple = false) {
    const fresh = { ...codes };
    const generated = [];
    for (let i = 0; i < genCount; i++) {
      if (isCouple) {
        let cid; do { cid = Math.random().toString(36).slice(2, 8).toUpperCase(); } while (Object.values(fresh).some(c => c.coupleId === cid));
        const cA = cid.slice(0, 3) + "-" + cid.slice(3, 6) + "A";
        const cB = cid.slice(0, 3) + "-" + cid.slice(3, 6) + "B";
        fresh[cA] = { used: false, createdAt: new Date().toISOString(), coupleId: cid, partnerNum: 1 };
        fresh[cB] = { used: false, createdAt: new Date().toISOString(), coupleId: cid, partnerNum: 2 };
        generated.push(cA + " + " + cB);
      } else {
        let code; do { code = genCode(); } while (fresh[code]);
        fresh[code] = { used: false, createdAt: new Date().toISOString() };
        generated.push(code);
      }
    }
    await onSaveCodes(fresh);
    setNewCodes(generated);
  }

  async function handleDelete(code) {
    const updated = { ...codes };
    delete updated[code];
    await onSaveCodes(updated);
  }

  const available = Object.entries(codes).filter(([, c]) => !c.used);
  const usedList = Object.entries(codes).filter(([, c]) => c.used);

  return (
    <div className="section">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div className="section-tag">◈ Administration</div>
          <div className="section-title" style={{ fontSize: 20, marginBottom: 0 }}>Tableau de bord</div>
        </div>
        <button className="btn-secondary" onClick={onBack}>← Retour</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
        {[
          { label: "Codes total", val: total, color: C.gold },
          { label: "Codes utilisés", val: usedC, color: C.green },
          { label: "Couples", val: coupleCount, color: C.blue }
        ].map(stat => (
          <div key={stat.label} style={{ background: "#0D1018", border: "1px solid #1E2330", padding: "14px 12px" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: stat.color, lineHeight: 1 }}>{stat.val}</div>
            <div style={{ fontSize: 9, color: C.dim, letterSpacing: ".1em", textTransform: "uppercase", marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1px solid #1E2330" }}>
        {["codes", "generer", "activite"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: "transparent", border: "none", color: tab === t ? C.gold : C.dim, padding: "10px 16px", fontFamily: "'Jost',sans-serif", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", borderBottom: tab === t ? `2px solid ${C.gold}` : "2px solid transparent", cursor: "pointer" }}>
            {t === "codes" ? "Codes disponibles" : t === "generer" ? "Générer" : "Activité récente"}
          </button>
        ))}
      </div>
      {tab === "codes" && (
        <div>
          <div style={{ fontSize: 10, color: C.dim, marginBottom: 12 }}>{available.length} codes disponibles</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 400, overflowY: "auto" }}>
            {available.map(([code, data]) => (
              <div key={code} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0D1018", border: "1px solid #1E2330" }}>
                <div>
                  <div style={{ fontSize: 13, color: C.gold, letterSpacing: ".08em", fontFamily: "monospace" }}>{code}</div>
                  <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>{new Date(data.createdAt).toLocaleDateString("fr-FR")} {data.coupleId ? `· Couple ${data.coupleId} P${data.partnerNum}` : ""}</div>
                </div>
                <button onClick={() => handleDelete(code)} style={{ background: "transparent", border: "1px solid #C0614A33", color: C.red, padding: "4px 10px", cursor: "pointer", fontSize: 10 }}>Supprimer</button>
              </div>
            ))}
            {available.length === 0 && <div style={{ fontSize: 12, color: C.dim, textAlign: "center", padding: 20 }}>Aucun code disponible.</div>}
          </div>
          {usedList.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 10, color: C.dim, marginBottom: 12 }}>{usedList.length} codes utilisés</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto" }}>
                {usedList.map(([code, data]) => (
                  <div key={code} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0D1018", border: "1px solid #1E2330", opacity: .6 }}>
                    <div>
                      <div style={{ fontSize: 12, color: C.muted, letterSpacing: ".08em", fontFamily: "monospace" }}>{code}</div>
                      <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>{data.clientName || "—"} · {data.usedAt ? new Date(data.usedAt).toLocaleDateString("fr-FR") : "date inconnue"}</div>
                    </div>
                    <div style={{ fontSize: 9, color: C.green }}>✓ Utilisé</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {tab === "generer" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: C.gold, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>Nombre de codes à générer</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {[1, 5, 10, 20, 50].map(n => (
                <button key={n} onClick={() => setGenCount(n)} style={{ background: genCount === n ? C.gold : "transparent", border: `1px solid ${genCount === n ? C.gold : "#1E2330"}`, color: genCount === n ? "#0B0F1A" : C.muted, padding: "8px 14px", cursor: "pointer", fontFamily: "'Jost',sans-serif", fontSize: 12 }}>{n}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleGenerate(false)}>Générer {genCount} code{genCount > 1 ? "s" : ""} individuels</button>
            <button className="btn-gold-outline" style={{ flex: 1 }} onClick={() => handleGenerate(true)}>Générer {genCount} paire{genCount > 1 ? "s" : ""} couple</button>
          </div>
          {newCodes.length > 0 && (
            <div className="card-gold">
              <div className="stl">Codes générés</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16, maxHeight: 300, overflowY: "auto" }}>
                {newCodes.map((c, i) => (
                  <div key={i} style={{ fontFamily: "monospace", fontSize: 13, color: C.gold, padding: "8px 12px", background: "#080C10", border: "1px solid #C9A84C22" }}>{c}</div>
                ))}
              </div>
              <button className="btn-gold-outline" style={{ width: "100%" }} onClick={() => {
                navigator.clipboard.writeText(newCodes.join("\n")).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
              }}>{copied ? "✓ Copié" : "Copier tous les codes"}</button>
            </div>
          )}
        </div>
      )}
      {tab === "activite" && (
        <div>
          <div style={{ fontSize: 10, color: C.dim, marginBottom: 12 }}>10 dernières utilisations</div>
          {recentUsed.length === 0 && <div style={{ fontSize: 12, color: C.dim, textAlign: "center", padding: 20 }}>Aucune activité enregistrée.</div>}
          {recentUsed.map(([code, data]) => (
            <div key={code} style={{ padding: "12px 14px", background: "#0D1018", border: "1px solid #1E2330", marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontSize: 12, color: C.text }}>{data.clientName || "Anonyme"}</div>
                <div style={{ fontSize: 10, color: C.dim }}>{data.usedAt ? new Date(data.usedAt).toLocaleDateString("fr-FR") : ""}</div>
              </div>
              <div style={{ fontSize: 10, color: C.muted }}>{code} {data.coupleId ? "· Couple" : ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════════════
// SECTION 10 — COMPOSANT PRINCIPAL APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [currentModule, setCurrentModule] = useState("home");
  const [codes, setCodes] = useState({});
  const [abonnementLevel, setAbonnementLevel] = useState("none");
  const [subscriberProfile, setSubscriberProfile] = useState(null);
  const isAbonne = abonnementLevel !== "none";
  const [adminPwd, setAdminPwd] = useState("");
  const [adminErr, setAdminErr] = useState("");
  const [modal, setModal] = useState(null);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const codesRef = useRef({});
  const SUBSCRIBER_KEY = "eden_subscriber_v1";

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY, true);
        if (r && r.value) { const d = JSON.parse(r.value); codesRef.current = d; setCodes(d); }
      } catch {}
      try {
        const rs = await window.storage.get("eden_subscriber_v1", true);
        if (rs && rs.value) {
          const p = JSON.parse(rs.value);
          setSubscriberProfile(p);
          if (p.actif) setAbonnementLevel(p.abonnementLevel || "simple");
        }
      } catch {}
    })();
  }, []);

  async function handleSaveSubscriberProfile(profile) {
    setSubscriberProfile(profile);
    try { await window.storage.set("eden_subscriber_v1", JSON.stringify(profile), true); } catch {}
  }

  async function handleSaveCodes(c) {
    codesRef.current = c;
    setCodes(c);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(c), true); } catch {}
  }

  function handleAdminLogin() {
    if (adminPwd === ADMIN_PASSWORD) { setAdminErr(""); setCurrentModule("admin"); }
    else setAdminErr("Mot de passe incorrect.");
  }

  if (modal) return (
    <div className="eden-app">
      <div className="modal-overlay" onClick={() => setModal(null)}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <div className="modal-sub">{modal.sub}</div>
          <div className="modal-title">{modal.title}</div>
          <div className="modal-body">{modal.body}</div>
          <button className="btn-primary" onClick={() => setModal(null)}>Fermer</button>
        </div>
      </div>
    </div>
  );

  if (upgradeModal) {
    const TIERS = [
      {
        id: "simple", label: "Simple", couleur: "#4A9B6A",
        prix: "15 000 FCFA/mois",
        features: ["Bilan 360° illimité", "Portrait Eaux·Os·Chair", "1 diagnostic thématique/mois", "Seed of Eden quotidien", "Arche Eden hebdomadaire", "Groupe WhatsApp privé", "IA illimitée (30 questions/mois)", "1 formation offerte/mois"]
      },
      {
        id: "argent", label: "Argent", couleur: "#7BAFC9",
        prix: "25 000 FCFA/mois",
        extra: "Tout Simple +",
        features: ["Accès à toutes les formations", "Accès à tous les PDF", "Suivi mensuel personnalisé", "Export PDF des rapports"]
      },
      {
        id: "premium", label: "Premium", couleur: "#C9A84C",
        prix: "40 000 FCFA/mois",
        extra: "Tout Argent +",
        features: ["Séance 30 min/mois (accompagnateur)", "Séance trimestrielle avec Zady", "Accès aux replays", "Plan d'action IA mensuel", "Graphiques de progression", "Alertes proactives"]
      }
    ];
    return (
      <div className="eden-app">
        <div className="modal-overlay" onClick={() => setUpgradeModal(false)}>
          <div style={{ background: "#0D1018", border: "1px solid #C9A84C33", maxWidth: 520, width: "100%", padding: "28px 24px", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 8, letterSpacing: ".28em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>✦ Eden — Abonnements</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "#F0EBE0", marginBottom: 6 }}>Choisissez votre niveau</div>
            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 20 }}>Tous les niveaux incluent les bilans mensuels, seeds quotidiens et l'Arche Eden hebdomadaire.</p>
            {TIERS.map(tier => (
              <div key={tier.id} style={{ background: "#080C14", border: `1px solid ${tier.couleur}44`, padding: "16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: tier.couleur, marginBottom: 4 }}>✦ Abonnement {tier.label}</div>
                    {tier.extra && <div style={{ fontSize: 10, color: C.dim, marginBottom: 4 }}>{tier.extra}</div>}
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {tier.features.map((f, i) => <div key={i} style={{ fontSize: 11, color: C.text }}><span style={{ color: tier.couleur, marginRight: 6 }}>✓</span>{f}</div>)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: tier.couleur, lineHeight: 1 }}>{tier.prix.split("/")[0]}</div>
                    <div style={{ fontSize: 9, color: C.dim }}>/mois</div>
                  </div>
                </div>
                <button onClick={() => { window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(`Bonjour, je souhaite activer l'abonnement Eden ${tier.label} (${tier.prix}).`)}`); }} style={{ background: tier.couleur, border: "none", color: "#0B0F1A", padding: "10px 16px", fontFamily: "'Jost',sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer", width: "100%" }}>
                  Activer via WhatsApp
                </button>
              </div>
            ))}
            <button style={{ background: "transparent", border: "1px solid #1E2330", color: C.dim, padding: "10px 16px", fontFamily: "'Jost',sans-serif", fontSize: 11, cursor: "pointer", width: "100%", marginTop: 4 }} onClick={() => setUpgradeModal(false)}>Fermer</button>
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <span style={{ fontSize: 10, color: C.dim, cursor: "pointer" }} onClick={() => { setAbonnementLevel("premium"); setUpgradeModal(false); }}>
                [Mode démo — Activer Premium sans paiement]
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentModule === "home") return (
    <div className="eden-app">
      <div className="eden-header">
        <div className="eden-logo">Académie Eden · Institut de Leadership Familial</div>
        <div className="eden-title">Outils d'<em style={{ fontStyle: "italic" }}>évaluation</em></div>
        <div className="eden-subtitle">Fondé par Zady Zozoro · Abidjan, Côte d'Ivoire</div>
      </div>
      <div className="eden-wrap">
        <div className="section">
          {isAbonne && (
            <div className="abonne-banner" style={{ borderColor: `${getLevelColor(abonnementLevel)}44` }}>
              <div style={{ fontSize: 10, color: getLevelColor(abonnementLevel), letterSpacing: ".12em", textTransform: "uppercase" }}>
                ✦ Eden {getLevelLabel(abonnementLevel)} actif
              </div>
              <button onClick={() => setAbonnementLevel("none")} style={{ background: "transparent", border: "none", color: C.dim, fontSize: 10, cursor: "pointer" }}>Désactiver</button>
            </div>
          )}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 9, color: C.dim, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 16 }}>Choisissez votre module</div>
            <div className="home-module-card featured" onClick={() => setCurrentModule("bilan")}>
              <div className="home-module-tag">◈ Module 1 · Accès par code</div>
              <div className="home-module-title">Bilan 360° Eden</div>
              <div className="home-module-desc">Évaluation approfondie sur 12 dimensions relationnelles. 50 questions, rapport personnalisé par le Conseiller Eden, indices composites et patterns archétypaux bibliques.</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                {["Marié(e)", "Fiancé(e)", "Célibataire"].map(p => <span key={p} style={{ padding: "3px 10px", border: `1px solid ${C.gold}44`, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: C.gold }}>{p}</span>)}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: C.dim }}>25 000 FCFA · Code à usage unique</div>
            </div>
            <div className="home-module-card" onClick={() => hasAccess("portrait", abonnementLevel) ? setCurrentModule("portrait") : setUpgradeModal(true)}>
              <div className="home-module-tag">◆ Module 2 · {isAbonne ? `Inclus — ${getLevelLabel(abonnementLevel)}` : "Abonnement requis"}</div>
              <div className="home-module-title">Portrait Eaux · Os · Chair</div>
              <div className="home-module-desc">Exploration en profondeur de votre histoire, vos convictions et votre manière de vivre les relations. Framework propriétaire fondé sur Genèse 2:23. Profil d'attachement + langages de l'amour.</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                {["Histoire familiale", "Os constitutifs", "Profil d'attachement", "Archétypes bibliques"].map(t => <span key={t} style={{ padding: "3px 10px", border: "1px solid #1E2330", fontSize: 9, color: C.dim }}>{t}</span>)}
              </div>
              <div className="home-module-badge" style={{ borderColor: isAbonne ? `${C.green}44` : `${C.gold}44`, color: isAbonne ? C.green : C.gold }}>
                {isAbonne ? `✦ Inclus — Eden ${getLevelLabel(abonnementLevel)}` : "✦ Abonnement requis · dès 15 000 FCFA/mois"}
              </div>
            </div>
          </div>
          {!isAbonne && (
            <div style={{ background: "linear-gradient(135deg,#0D0E18,#10141E)", border: "1px solid #C9A84C22", padding: "20px", marginBottom: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: C.gold, marginBottom: 8 }}>✦ Eden Premium</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "#F0EBE0", marginBottom: 8 }}>Accès illimité aux deux modules</div>
              <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 14 }}>Bilan 360° + Portrait Eaux·Os·Chair + 5 fonctionnalités exclusives pour 15 000 FCFA/mois.</p>
              <button className="btn-primary" onClick={() => setUpgradeModal(true)}>Découvrir l'abonnement Premium</button>
            </div>
          )}
          {isAbonne && (
            <div style={{ background: "linear-gradient(135deg,#0A1208,#0D1018)", border: "1px solid #4A9B6A44", padding: "20px", marginBottom: 12 }}>
              <div style={{ fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: C.green, marginBottom: 8 }}>✦ Eden Premium</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "#F0EBE0", marginBottom: 8 }}>
                {subscriberProfile ? `Bienvenue, ${subscriberProfile.nom}` : "Votre espace abonné"}
              </div>
              <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 14 }}>Piliers mensuels · Seeds quotidiens · Rapport annuel · Conseiller IA avec mémoire</p>
              <button style={{ background: C.green, border: "none", color: "#0B0F1A", padding: "12px 20px", fontFamily: "'Jost',sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", width: "100%" }} onClick={() => {
                if (!subscriberProfile) {
                  const demo = {
                    abonneId: "demo_" + Date.now(),
                    nom: "Abonné(e)",
                    profil: "marie",
                    dateInscription: new Date().toISOString(),
                    actif: true,
                    bilans: [],
                    formations: [],
                    seeds: [{
                      date: new Date().toISOString(),
                      mois: new Date().getMonth() + 1,
                      jour: new Date().getDate(),
                      pilier: "communication",
                      contenu: "Ce soir, prenez 15 minutes — sans téléphone — pour vous regarder dans les yeux et répondre à cette question : 'Qu'est-ce que tu vis en ce moment que tu ne m'as pas encore dit ?'",
                      action: "Posez la question. Écoutez sans interrompre. Puis répondez vous aussi."
                    }],
                    questions: [],
                    rapportAnnuel: null,
                    bilanInitial: null,
                    notesAdmin: ""
                  };
                  handleSaveSubscriberProfile(demo);
                }
                setCurrentModule("espace_abonne");
              }}>
                Accéder à mon espace →
              </button>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn-secondary" style={{ flex: 1, fontSize: 10 }} onClick={() => setCurrentModule("admin_login")}>Administration</button>
            <button className="btn-secondary" style={{ flex: 1, fontSize: 10 }} onClick={() => { setAbonnementLevel("premium"); setCurrentModule("bilan"); }}>Démo (Premium)</button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );

  if (currentModule === "admin_login") return (
    <div className="eden-app">
      <div className="eden-header">
        <div className="eden-logo">Académie Eden</div>
        <div className="eden-title">Administration</div>
      </div>
      <div className="eden-wrap">
        <div className="section">
          <div className="section-tag">◈ Accès sécurisé</div>
          <div className="section-desc">Accès réservé à l'équipe Eden Académie.</div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: C.gold, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>Mot de passe</div>
            <input className="inp" type="password" placeholder="••••••••••" value={adminPwd} onChange={e => setAdminPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdminLogin()} />
          </div>
          {adminErr && <div style={{ fontSize: 12, color: C.red, marginBottom: 12 }}>{adminErr}</div>}
          <div className="nav-row">
            <button className="btn-secondary" style={{ flex: "0 0 auto" }} onClick={() => { setCurrentModule("home"); setAdminPwd(""); setAdminErr(""); }}>← Retour</button>
            <button className="btn-primary" onClick={handleAdminLogin}>Accéder →</button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );

  if (currentModule === "admin") return (
    <div className="eden-app">
      <div className="eden-header">
        <div className="eden-logo">Académie Eden</div>
        <div className="eden-title">Administration</div>
      </div>
      <div className="eden-wrap">
        <AdminModule codes={codes} onSaveCodes={handleSaveCodes} onBack={() => setCurrentModule("home")} />
        <Footer />
      </div>
    </div>
  );

  if (currentModule === "bilan") return (
    <div className="eden-app">
      <div className="eden-header">
        <div className="eden-logo">Académie Eden · Institut de Leadership Familial</div>
        <div className="eden-title">Bilan <em style={{ fontStyle: "italic" }}>360°</em></div>
        <div className="eden-subtitle">Évaluation relationnelle approfondie</div>
        {isAbonne && <div style={{ marginTop: 6, display: "inline-block", padding: "2px 10px", border: `1px solid ${getLevelColor(abonnementLevel)}44`, fontSize: 9, color: getLevelColor(abonnementLevel), letterSpacing: ".12em", textTransform: "uppercase" }}>✦ Eden {getLevelLabel(abonnementLevel)}</div>}
      </div>
      <div style={{ padding: "10px 20px", borderBottom: "1px solid #1E2330", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => setCurrentModule("home")} style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", fontSize: 11, fontFamily: "'Jost',sans-serif" }}>← Accueil</button>
        {isAbonne ? <div style={{ fontSize: 9, color: getLevelColor(abonnementLevel), letterSpacing: ".12em", textTransform: "uppercase" }}>✦ {getLevelLabel(abonnementLevel)}</div> : <button onClick={() => setUpgradeModal(true)} style={{ background: "transparent", border: `1px solid ${C.gold}44`, color: C.gold, padding: "4px 12px", cursor: "pointer", fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "'Jost',sans-serif" }}>✦ S'abonner</button>}
      </div>
      <div className="eden-wrap">
        <DiagnosticModule codes={codes} onSaveCodes={handleSaveCodes} isAbonne={isAbonne} abonnementLevel={abonnementLevel} onRequestUpgrade={() => setUpgradeModal(true)} subscriberProfile={subscriberProfile} onUpdateSubscriber={handleSaveSubscriberProfile} />
        <Footer />
      </div>
    </div>
  );

  if (currentModule === "portrait") return (
    <div className="eden-app">
      <div className="eden-header">
        <div className="eden-logo">Académie Eden · Institut de Leadership Familial</div>
        <div className="eden-title">Portrait <em style={{ fontStyle: "italic" }}>de Personne</em></div>
        <div className="eden-subtitle">Eaux · Os · Chair · Framework propriétaire Zady Zozoro</div>
        {isAbonne && <div style={{ marginTop: 6, display: "inline-block", padding: "2px 10px", border: `1px solid ${getLevelColor(abonnementLevel)}44`, fontSize: 9, color: getLevelColor(abonnementLevel), letterSpacing: ".12em", textTransform: "uppercase" }}>✦ Eden {getLevelLabel(abonnementLevel)}</div>}
      </div>
      <div style={{ padding: "10px 20px", borderBottom: "1px solid #1E2330" }}>
        <button onClick={() => setCurrentModule("home")} style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", fontSize: 11, fontFamily: "'Jost',sans-serif" }}>← Accueil</button>
      </div>
      <div className="eden-wrap">
        <PortraitModule isAbonne={isAbonne} abonnementLevel={abonnementLevel} onRequestUpgrade={() => setUpgradeModal(true)} />
        <Footer />
      </div>
    </div>
  );

  if (currentModule === "espace_abonne" && subscriberProfile) return (
    <div className="eden-app">
      <div style={{ padding: "10px 20px", borderBottom: "1px solid #1E2330", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => setCurrentModule("home")} style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", fontSize: 11, fontFamily: "'Jost',sans-serif" }}>← Accueil</button>
        <div style={{ fontSize: 9, color: C.green, letterSpacing: ".12em", textTransform: "uppercase" }}>✦ Premium</div>
      </div>
      {typeof EspaceAbonne !== "undefined"
        ? <EspaceAbonne profile={subscriberProfile} abonnementLevel={abonnementLevel} onUpdateProfile={handleSaveSubscriberProfile} />
        : (
          <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: ".3em", textTransform: "uppercase", marginBottom: 16 }}>✦ Espace Abonné</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: "#F0EBE0", marginBottom: 12 }}>
              {subscriberProfile?.nom ? `Bienvenue, ${subscriberProfile.nom}` : "Espace Abonné"}
            </div>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8, marginBottom: 20 }}>
              Import EdenSubscriber.jsx requis en production Vite.
            </p>
            <div style={{ background: "#0D1018", border: "1px solid #4A9B6A33", padding: "16px 20px", textAlign: "left", marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: C.green, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>Activation</div>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: C.text, lineHeight: 2 }}>
                1. EdenSubscriber.jsx → src/<br />
                2. Décommenter ligne 2 : import EspaceAbonne from "./EdenSubscriber"
              </div>
            </div>
            <button onClick={() => setCurrentModule("home")} style={{ background: C.gold, border: "none", color: "#0B0F1A", padding: "12px 24px", fontFamily: "'Jost',sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Retour</button>
          </div>
        )}
      <Footer />
    </div>
  );

    // Remplacez "return null;" par ceci :
  return (
    <div className="eden-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', padding: 20 }}>
      <div>
        <div style={{ color: C.gold, fontSize: 10, letterSpacing: '.2em', marginBottom: 20 }}>✦ ACADÉMIE EDEN ✦</div>
        <p style={{ color: C.text, marginBottom: 20 }}>Une erreur de navigation est survenue.</p>
        <button className="btn-primary" onClick={() => setCurrentModule("home")}>
          Retourner à l'accueil
        </button>
      </div>
    </div>
  );
}

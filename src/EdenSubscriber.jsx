import { useState, useEffect, useRef } from “react”;

// ═══════════════════════════════════════════════════════════════════════════
// EDEN ACADÉMIE — Système Abonné v1.0
// Module complet : Piliers mensuels · Seeds quotidiens · Rapport annuel · IA mémorisante
// Institut de Leadership Familial — Fondé par Zady Zozoro
// ═══════════════════════════════════════════════════════════════════════════

const WHATSAPP_NUM = “2250141800001”;
const WHATSAPP_GROUP_LINK = “https://chat.whatsapp.com/CONFIGURER_ICI”; // ← Lien groupe WhatsApp privé abonnés
const C = {
bg:”#080C14”, surface:”#0D1018”, border:”#1E2330”,
gold:”#C9A84C”, goldLight:”#D4B86A”,
green:”#4A9B6A”, blue:”#7BAFC9”,
red:”#C0614A”, orange:”#C0784A”,
text:”#C8C0B0”, muted:”#8A8070”, dim:”#4A5060”,
};

// ─── LES 12 PILIERS — Programme annuel ───────────────────────────────────
export const PILIERS_ANNUELS = [
{ mois:1,  id:“communication”,  label:“Communication & Dialogue”,        icon:“◈”, couleur:C.gold,   verset:“Proverbes 18:13”,  resume:“Apprendre à parler vrai et à écouter profondément.” },
{ mois:2,  id:“gouvernance”,    label:“Gouvernance & Rôles”,              icon:“◆”, couleur:C.blue,   verset:“1 Corinthiens 11:3”, resume:“Redéfinir qui tient le cap et comment les décisions se prennent.” },
{ mois:3,  id:“intimite”,       label:“Intimité & Connexion”,             icon:“◉”, couleur:C.red,    verset:“Genèse 2:24”,      resume:“Reconstruire la proximité émotionnelle et physique.” },
{ mois:4,  id:“vision”,         label:“Vision & Projet Commun”,           icon:“◎”, couleur:C.green,  verset:“Habacuc 2:2”,      resume:“Écrire ensemble le futur que vous voulez bâtir.” },
{ mois:5,  id:“conflits”,       label:“Gestion des Conflits”,             icon:“◐”, couleur:C.orange, verset:“Éphésiens 4:26”,   resume:“Transformer les disputes en tremplins de croissance.” },
{ mois:6,  id:“spiritualite”,   label:“Foi & Vie Spirituelle”,            icon:“✦”, couleur:C.gold,   verset:“Josué 24:15”,      resume:“Faire de Dieu le centre réel de votre foyer.” },
{ mois:7,  id:“equilibre”,      label:“Équilibre Pro / Famille”,          icon:“◑”, couleur:C.blue,   verset:“Deutéronome 6:7”,  resume:“Être présent(e) là où vous êtes vraiment.” },
{ mois:8,  id:“heritage”,       label:“Parentalité & Héritage”,           icon:“◇”, couleur:C.green,  verset:“Proverbes 22:6”,   resume:“Transmettre des valeurs, pas seulement des règles.” },
{ mois:9,  id:“dynamiques”,     label:“Dynamiques Relationnelles”,        icon:“◑”, couleur:C.orange, verset:“Genèse 3:12”,      resume:“Identifier et interrompre les patterns inconscients.” },
{ mois:10, id:“blessures”,      label:“Guérison & Pardon”,                icon:“◉”, couleur:C.red,    verset:“Éphésiens 4:32”,   resume:“Ce qui n’est pas guéri se répète. Ce qui est pardonné se libère.” },
{ mois:11, id:“finances”,       label:“Finances & Transparence”,          icon:“◈”, couleur:C.gold,   verset:“Luc 16:11”,        resume:“L’argent révèle les vraies priorités du couple.” },
{ mois:12, id:“bilan_annuel”,   label:“Bilan & Projection Annuelle”,      icon:“✦”, couleur:C.green,  verset:“Psaume 90:12”,     resume:“Mesurer le chemin parcouru. Préparer l’année suivante.” },
];

// ─── STRUCTURE PROFIL ABONNÉ ─────────────────────────────────────────────
export function createSubscriberProfile(nom, profil, abonneId) {
return {
abonneId: abonneId || `eden_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
nom,
profil, // marie | fiance | celibataire
dateInscription: new Date().toISOString(),
actif: true,
// Bilans mensuels — un par pilier
bilans: [],          // [{ mois, pilier, scores, gp, rapport, date }]
// Formations suivies
formations: [],      // [{ id, titre, completedAt }]
// Seeds reçus et réponses
seeds: [],           // [{ date, mois, jour, pilier, contenu, action, reponse, reponduAt }]
// Historique Q&A avec l’IA
questions: [],       // [{ date, question, reponse, pilierActif }]
// Rapport annuel généré en décembre
rapportAnnuel: null, // { generatedAt, texte, progressionParDimension }
// Bilan initial (si fait le mois 0)
bilanInitial: null,  // { scores, gp, rapport, date }
// Contexte mémorisé pour l’IA
notesAdmin: “”,      // Notes privées de Zady sur cet abonné
};
}

// ─── UTILITAIRES PROFIL ───────────────────────────────────────────────────
export function getPilierMoisCourant() {
const mois = new Date().getMonth() + 1; // 1-12
return PILIERS_ANNUELS.find(p => p.mois === mois) || PILIERS_ANNUELS[0];
}

export function getProgressionAnnuelle(bilans) {
if (!bilans || bilans.length === 0) return null;
const progression = {};
bilans.forEach(b => {
if (b.scores) {
Object.entries(b.scores).forEach(([dim, val]) => {
if (!progression[dim]) progression[dim] = [];
progression[dim].push({ mois: b.mois, p: val.p });
});
}
});
return progression;
}

export function computeContextMemoire(profile) {
if (!profile) return “”;
const pilierActuel = getPilierMoisCourant();
const bilanInitial = profile.bilanInitial;
const bilansRecents = (profile.bilans || []).slice(-3);
const formationsText = (profile.formations || []).map(f => f.titre).join(”, “);
const seedsRecents = (profile.seeds || []).filter(s => s.reponse).slice(-5);
const questionsRecentes = (profile.questions || []).slice(-10);
const progression = getProgressionAnnuelle(profile.bilans);

let ctx = `═══ MÉMOIRE ABONNÉ ═══\nNom : ${profile.nom} | Profil : ${profile.profil} | Inscrit le : ${new Date(profile.dateInscription).toLocaleDateString("fr-FR")}\n`;
ctx += `Pilier du mois : ${pilierActuel.label} (${pilierActuel.verset})\n`;

if (bilanInitial) {
ctx += `\n─── BILAN INITIAL ───\nScore global : ${bilanInitial.gp}/100\nScores : ${Object.entries(bilanInitial.scores || {}).map(([,v]) => `${v.label} ${v.p}/100`).join(", ")}\n`;
}

if (bilansRecents.length > 0) {
ctx += `\n─── BILANS MENSUELS RÉCENTS ───\n`;
bilansRecents.forEach(b => {
ctx += `Mois ${b.mois} — ${b.pilier} : GP ${b.gp}/100 (${new Date(b.date).toLocaleDateString("fr-FR")})\n`;
});
}

if (progression && Object.keys(progression).length > 0) {
const dims = Object.entries(progression).slice(0, 4);
ctx += `\n─── TENDANCES OBSERVÉES ───\n`;
dims.forEach(([dim, vals]) => {
if (vals.length >= 2) {
const delta = vals[vals.length-1].p - vals[0].p;
ctx += `${dim} : ${delta > 0 ? "↑" : delta < 0 ? "↓" : "→"} ${Math.abs(delta)} pts sur ${vals.length} bilans\n`;
}
});
}

if (formationsText) {
ctx += `\n─── FORMATIONS SUIVIES ───\n${formationsText}\n`;
}

if (seedsRecents.length > 0) {
ctx += `\n─── SEEDS RÉCENTS & RÉPONSES ───\n`;
seedsRecents.slice(-3).forEach(s => {
ctx += `Seed (${new Date(s.date).toLocaleDateString("fr-FR")}) : "${s.contenu}"\n`;
if (s.reponse) ctx += `→ Réponse : "${s.reponse.slice(0, 120)}…"\n`;
});
}

if (questionsRecentes.length > 0) {
ctx += `\n─── QUESTIONS POSÉES RÉCEMMENT ───\n`;
questionsRecentes.slice(-5).forEach(q => {
ctx += `Q : "${q.question.slice(0, 80)}"\nR : "${q.reponse?.slice(0, 100)}…"\n`;
});
}

if (profile.notesAdmin) {
ctx += `\n─── NOTES DU CONSEILLER ───\n${profile.notesAdmin}\n`;
}

ctx += `\n═══ FIN MÉMOIRE ═══`;
return ctx;
}

// ─── PROMPT RAPPORT ANNUEL ────────────────────────────────────────────────
export function buildRapportAnnuelPrompt(profile) {
const bilans = profile.bilans || [];
const bilanInitial = profile.bilanInitial;
const pilierCouverts = bilans.map(b => b.pilier).join(”, “);
const progression = getProgressionAnnuelle(bilans);

const progressionText = progression ? Object.entries(progression).map(([dim, vals]) => {
if (vals.length < 2) return null;
const debut = vals[0].p;
const fin = vals[vals.length-1].p;
const delta = fin - debut;
return `${dim} : ${debut} → ${fin} (${delta > 0 ? "+" : ""}${delta} pts)`;
}).filter(Boolean).join(”\n”) : “Données insuffisantes”;

const seedsAvecReponse = (profile.seeds || []).filter(s => s.reponse).length;
const totalSeeds = (profile.seeds || []).length;
const tauxEngagement = totalSeeds > 0 ? Math.round((seedsAvecReponse / totalSeeds) * 100) : 0;

return `Tu es le Conseiller Senior de l'Académie Eden, fondé par Zady Zozoro.\n\nTu génères le RAPPORT ANNUEL DE PROGRESSION de ${profile.nom}.\n\nDONNÉES DE L'ANNÉE :\n- Profil : ${profile.profil}\n- Date d'inscription : ${new Date(profile.dateInscription).toLocaleDateString("fr-FR")}\n- Piliers travaillés : ${pilierCouverts}\n- Nombre de bilans mensuels : ${bilans.length}\n- Formations suivies : ${(profile.formations || []).map(f => f.titre).join(", ") || "Aucune"}\n- Seeds reçus : ${totalSeeds} · Taux d'engagement : ${tauxEngagement}%\n- Questions posées à l'IA : ${(profile.questions || []).length}\n\nBILAN INITIAL :\nScore global : ${bilanInitial?.gp || "Non effectué"}/100\n\nPROGRESSION PAR DIMENSION :\n${progressionText}\n\nBILANS MENSUELS DÉTAIL :\n${bilans.map(b => `Mois ${b.mois} (${b.pilier}) : ${b.gp}/100`).join("\n")}\n\nSTRUCTURE OBLIGATOIRE DU RAPPORT (avec titres **EN GRAS**) :\n\n**L'ANNÉE DE ${profile.nom.toUpperCase()} EN UN REGARD**\nRésumé narratif de la trajectoire : ce qui a bougé, ce qui résiste, ce qui est émergé.\n\n**VOTRE PLUS GRANDE VICTOIRE DE L'ANNÉE**\nLa progression la plus significative, avec les données précises et leur signification.\n\n**CE QUI RÉSISTE ENCORE**\nLes 2 dimensions qui ont peu progressé ou régressé. Analyse sans jugement.\n\n**PATTERNS OBSERVÉS SUR 12 MOIS**\nLes dynamiques qui se répètent. Ce que l'année révèle sur la structure profonde.\n\n**VOTRE TAUX D'ENGAGEMENT**\n${tauxEngagement}% de seeds auxquels vous avez répondu. Ce que cela dit de votre engagement.\n\n**RECOMMANDATIONS POUR L'ANNÉE PROCHAINE**\n3 priorités concrètes. Une formation recommandée avec justification. Un verset fondateur pour l'année à venir.\n\n**MOT DU CONSEILLER**\nUn message pastoral personnel à ${profile.nom}, basé sur toute la trajectoire observée.\n\nRÈGLES : Utiliser le prénom ${profile.nom} naturellement. Ton pastoral, expert, chaleureux. Jamais de jargon clinique. Références bibliques naturellement intégrées. MINIMUM 600 MOTS.`;
}

// ─── STYLES CSS ABONNÉ ────────────────────────────────────────────────────
const SUBSCRIBER_CSS = `.sub-wrap{max-width:640px;margin:0 auto;padding:0 20px 80px;} .sub-header{padding:24px 20px 16px;border-bottom:1px solid #1E2330;background:linear-gradient(180deg,#0B0F1A,#080C14);} .pilier-card{background:linear-gradient(135deg,#0D1018,#111828);border:1px solid;padding:24px;margin-bottom:16px;position:relative;overflow:hidden;} .pilier-card::before{content:'';position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:currentColor;opacity:.04;} .pilier-icon{font-size:28px;margin-bottom:12px;} .pilier-label{font-size:8px;letter-spacing:.28em;text-transform:uppercase;margin-bottom:6px;} .pilier-titre{font-family:'Cormorant Garamond',serif;font-size:22px;color:#F0EBE0;line-height:1.3;margin-bottom:8px;} .pilier-resume{font-size:12px;color:#8A8070;line-height:1.7;margin-bottom:12px;} .pilier-verset{font-size:10px;color:#4A5060;font-style:italic;} .progression-bar{height:2px;background:#1E2330;margin:6px 0;} .progression-fill{height:100%;transition:width 1s ease;} .seed-item{background:#0D1018;border:1px solid #1E2330;padding:16px;margin-bottom:8px;} .seed-item.today{border-color:#C9A84C44;background:#0D1018;} .seed-date{font-size:9px;color:#4A5060;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px;} .seed-contenu{font-family:'Cormorant Garamond',serif;font-size:16px;color:#F0EBE0;line-height:1.5;margin-bottom:8px;} .seed-action{font-size:12px;color:#8A8070;line-height:1.6;margin-bottom:10px;padding:8px 12px;background:#080C10;border-left:2px solid #C9A84C66;} .seed-reponse-input{width:100%;background:#080C10;border:1px solid #1E2330;color:#C8C0B0;font-family:'Jost',sans-serif;font-size:12px;padding:10px 12px;min-height:64px;resize:vertical;line-height:1.6;} .seed-reponse-input:focus{border-color:#C9A84C44;outline:none;} .bilan-mensuel-card{background:#0D1018;border:1px solid #1E2330;padding:16px;margin-bottom:8px;cursor:pointer;transition:all .2s;} .bilan-mensuel-card:hover{border-color:#C9A84C33;background:#111520;} .bilan-mensuel-done{border-color:#4A9B6A33;} .bilan-mensuel-pending{border-color:#C9A84C33;} .annual-report{background:linear-gradient(135deg,#0B0F1A,#0D1020,#080A10);border:1px solid #C9A84C33;padding:28px;} .stat-trio{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:20px;} .stat-box{background:#0D1018;border:1px solid #1E2330;padding:14px 12px;text-align:center;} .stat-num{font-family:'Cormorant Garamond',serif;font-size:32px;line-height:1;} .stat-label{font-size:9px;color:#4A5060;letter-spacing:.1em;text-transform:uppercase;margin-top:4px;} .tabs{display:flex;gap:0;border-bottom:1px solid #1E2330;margin-bottom:20px;} .tab{background:transparent;border:none;color:#4A5060;padding:10px 14px;font-family:'Jost',sans-serif;font-size:10px;letter-spacing:.1em;text-transform:uppercase;border-bottom:2px solid transparent;cursor:pointer;transition:all .2s;} .tab.active{color:#C9A84C;border-bottom-color:#C9A84C;} .tab:hover{color:#8A8070;} .qa-abonne{background:#0D1018;border:1px solid #C9A84C33;padding:20px;margin-top:20px;} .qa-abonne-counter{display:inline-flex;gap:4px;align-items:center;padding:4px 12px;border:1px solid #C9A84C33;margin-bottom:14px;} .qa-abonne-dots{display:flex;gap:3px;align-items:center;} .qa-abonne-dot{width:6px;height:6px;border-radius:50%;background:#1E2330;} .qa-abonne-dot.used{background:#C9A84C;} .memory-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid #4A9B6A33;background:#0A1208;margin-bottom:12px;} .memory-badge-dot{width:6px;height:6px;border-radius:50%;background:#4A9B6A;animation:pulse 2s infinite;} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`;

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL — ESPACE ABONNÉ
// ═══════════════════════════════════════════════════════════════════════════

export default function EspaceAbonne({ profile, abonnementLevel, onUpdateProfile }) {
// Niveau par défaut : simple si non précisé
const niveau = abonnementLevel || “simple”;
const [tab, setTab] = useState(“accueil”);
const [selectedSeed, setSelectedSeed] = useState(null);
const [seedReponse, setSeedReponse] = useState(””);
const [seedSaving, setSeedSaving] = useState(false);
const [bilanModal, setBilanModal] = useState(null);
const [rapportAnnuelLoading, setRapportAnnuelLoading] = useState(false);
const [chatHistory, setChatHistory] = useState([]);
const [chatInput, setChatInput] = useState(””);
const [chatLoading, setChatLoading] = useState(false);
const chatEndRef = useRef(null);

useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:“smooth” }); }, [chatHistory, chatLoading]);

const pilierActuel = getPilierMoisCourant();
const bilansMois = profile.bilans || [];
const questionsUtiliseesCeMois = (profile.questions || []).filter(q => {
const d = new Date(q.date);
const now = new Date();
return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}).length;
const questionsRestantes = Math.max(0, 30 - questionsUtiliseesCeMois);
const moisActuel = new Date().getMonth() + 1;
const bilanCeMois = bilansMois.find(b => b.mois === moisActuel);
const totalSeeds = (profile.seeds || []).length;
const seedsRepondus = (profile.seeds || []).filter(s => s.reponse).length;
const tauxEngagement = totalSeeds > 0 ? Math.round((seedsRepondus / totalSeeds) * 100) : 0;

// ── Seeds du mois courant ──
const seedsDuMois = (profile.seeds || []).filter(s => {
const d = new Date(s.date);
const now = new Date();
return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}).sort((a, b) => new Date(a.date) - new Date(b.date));

const today = new Date().toDateString();
const seedAujourdhui = seedsDuMois.find(s => new Date(s.date).toDateString() === today);

// ── Sauvegarder réponse seed ──
async function handleSaveReponse(seedDate) {
if (!seedReponse.trim()) return;
setSeedSaving(true);
const updatedSeeds = (profile.seeds || []).map(s => {
if (s.date === seedDate) return { …s, reponse: seedReponse.trim(), reponduAt: new Date().toISOString() };
return s;
});
await onUpdateProfile({ …profile, seeds: updatedSeeds });
setSeedReponse(””);
setSelectedSeed(null);
setSeedSaving(false);
}

// ── Générer rapport annuel ──
async function handleGenerateRapportAnnuel() {
setRapportAnnuelLoading(true);
const prompt = buildRapportAnnuelPrompt(profile);
try {
const res = await fetch(”/api/diagnostic-report”, {
method:“POST”,
headers:{“Content-Type”:“application/json”},
body:JSON.stringify({ prompt }),
});
const data = await res.json();
const rapport = {
generatedAt: new Date().toISOString(),
texte: data.text || “”,
progressionParDimension: getProgressionAnnuelle(profile.bilans),
};
await onUpdateProfile({ …profile, rapportAnnuel: rapport });
} catch(e) {
console.error(“Erreur rapport annuel:”, e);
}
setRapportAnnuelLoading(false);
}

// ── Q&A mémorisante ──
async function handleAskQuestion() {
if (!chatInput.trim() || questionsRestantes <= 0 || chatLoading) return;
const question = chatInput.trim();
setChatInput(””);
const newHistory = […chatHistory, { role:“user”, content:question }];
setChatHistory(newHistory);
setChatLoading(true);

```
// Construire la mémoire contextuelle
const memoire = computeContextMemoire(profile);
const systemPrompt = `Tu es le Conseiller de l'Académie Eden — Institut du Leadership Familial fondé par Zady Zozoro à Abidjan.\n\nTu parles avec ${profile.nom}, un(e) abonné(e) Premium Eden.\n\n${memoire}\n\nTon rôle : Conseiller expert et bienveillant qui connaît parfaitement l'histoire et le parcours de ${profile.nom}. Tes réponses doivent :\n- Tenir compte de toute la trajectoire observée (bilans, formations, seeds, questions précédentes)\n- Faire référence naturellement aux données spécifiques quand c'est pertinent\n- Identifier les patterns récurrents et les nommer avec bienveillance\n- Proposer des angles non explorés dans les bilans\n- Utiliser le prénom ${profile.nom} naturellement\n- Maximum 350 mots par réponse\n- Jamais de jargon clinique ou médical\n- Références bibliques si pertinent\n- Ne jamais mentionner l'IA, Claude ou la technologie`;

try {
  const res = await fetch("/api/diagnostic-report", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      prompt: question,
      systemPrompt,
      history: newHistory.slice(-12).map(m => ({ role:m.role, content:m.content })),
    }),
  });
  const data = await res.json();
  const reponse = data.text || "Je n'ai pas pu générer une réponse.";
  const newMsg = { role:"assistant", content:reponse };
  setChatHistory(h => [...h, newMsg]);

  // Sauvegarder la question dans le profil
  const nouvelleQuestion = {
    date: new Date().toISOString(),
    question,
    reponse,
    pilierActif: pilierActuel.id,
  };
  await onUpdateProfile({
    ...profile,
    questions: [...(profile.questions || []), nouvelleQuestion],
  });

} catch {
  setChatHistory(h => [...h, { role:"assistant", content:"Une erreur s'est produite. Vérifiez votre connexion." }]);
}
setChatLoading(false);
```

}

// ═════════════════════════════════════════════════════════════════════════
// RENDU
// ═════════════════════════════════════════════════════════════════════════

return (
<div>
<style>{SUBSCRIBER_CSS}</style>

```
  {/* ── Header abonné ── */}
  <div className="sub-header">
    <div style={{ fontSize:8, letterSpacing:".28em", textTransform:"uppercase", color:C.green, marginBottom:6 }}>✦ Espace Abonné Premium</div>
    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, color:"#F0EBE0", lineHeight:1.2, marginBottom:4 }}>{profile.nom}</div>
    <div style={{ display:"flex", gap:12, alignItems:"center" }}>
      <div style={{ fontSize:10, color:C.dim }}>{profile.profil === "marie" ? "Marié(e)" : profile.profil === "fiance" ? "Fiancé(e)" : "Célibataire"}</div>
      <div style={{ width:1, height:12, background:C.border }} />
      <div style={{ fontSize:10, color:C.dim }}>Abonné depuis le {new Date(profile.dateInscription).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" })}</div>
    </div>
  </div>

  {/* ── Tabs ── */}
  <div style={{ padding:"0 20px" }}>
    <div className="tabs">
      {[
        { id:"accueil",   label:"Accueil" },
        { id:"pilier",    label:"Pilier du mois" },
        { id:"seeds",     label:"Seeds" },
        { id:"bilans",    label:"Mes bilans" },
        { id:"conseiller",label:"Conseiller IA" },
        { id:"annuel",    label:"Rapport annuel" },
      ].map(t => (
        <button key={t.id} className={`tab ${tab===t.id?"active":""}`} onClick={() => setTab(t.id)}>{t.label}</button>
      ))}
    </div>
  </div>

  <div className="sub-wrap">

    {/* ─────────────── ACCUEIL ─────────────── */}
    {tab === "accueil" && (
      <div>
        {/* Pilier du mois en vedette */}
        <div className="pilier-card" style={{ borderColor:pilierActuel.couleur+"44", color:pilierActuel.couleur }}>
          <div className="pilier-icon">{pilierActuel.icon}</div>
          <div className="pilier-label" style={{ color:pilierActuel.couleur }}>Pilier du mois — {new Date().toLocaleDateString("fr-FR",{month:"long",year:"numeric"})}</div>
          <div className="pilier-titre">{pilierActuel.label}</div>
          <div className="pilier-resume">{pilierActuel.resume}</div>
          <div className="pilier-verset">{pilierActuel.verset}</div>
          {!bilanCeMois && (
            <button
              onClick={() => setBilanModal({ pilier:pilierActuel, type:"mensuel" })}
              style={{ marginTop:16, background:pilierActuel.couleur, border:"none", color:"#0B0F1A", padding:"12px 20px", fontFamily:"'Jost',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer", width:"100%" }}
            >
              Faire mon bilan du mois →
            </button>
          )}
          {bilanCeMois && (
            <div style={{ marginTop:12, padding:"8px 12px", background:"#0A1208", border:"1px solid #4A9B6A33", fontSize:11, color:C.green }}>
              ✓ Bilan du mois complété — Score : {bilanCeMois.gp}/100
            </div>
          )}
        </div>

        {/* Seed d'aujourd'hui */}
        {seedAujourdhui && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:9, color:C.gold, letterSpacing:".2em", textTransform:"uppercase", marginBottom:10 }}>◈ Seed du jour</div>
            <div className="seed-item today">
              <div className="seed-contenu">{seedAujourdhui.contenu}</div>
              <div className="seed-action">Action : {seedAujourdhui.action}</div>
              {!seedAujourdhui.reponse ? (
                <div>
                  <textarea
                    className="seed-reponse-input"
                    placeholder="Votre réponse à cette action…"
                    value={selectedSeed === seedAujourdhui.date ? seedReponse : ""}
                    onChange={e => { setSelectedSeed(seedAujourdhui.date); setSeedReponse(e.target.value); }}
                  />
                  {selectedSeed === seedAujourdhui.date && seedReponse.trim() && (
                    <button
                      onClick={() => handleSaveReponse(seedAujourdhui.date)}
                      disabled={seedSaving}
                      style={{ background:C.gold, border:"none", color:"#0B0F1A", padding:"10px 18px", fontFamily:"'Jost',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer", marginTop:8, width:"100%" }}
                    >
                      {seedSaving ? "Sauvegarde…" : "Enregistrer ma réponse"}
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ padding:"8px 12px", background:"#0A1208", border:"1px solid #4A9B6A33", fontSize:12, color:C.muted, fontStyle:"italic" }}>
                  ✓ "{seedAujourdhui.reponse.slice(0,80)}{seedAujourdhui.reponse.length > 80 ? "…" : ""}"
                </div>
              )}
            </div>
          </div>
        )}
        {!seedAujourdhui && (
          <div style={{ background:"#0D1018", border:"1px solid #1E2330", padding:"16px", marginBottom:16 }}>
            <div style={{ fontSize:9, color:C.dim, letterSpacing:".16em", textTransform:"uppercase", marginBottom:6 }}>◈ Seed du jour</div>
            <div style={{ fontSize:12, color:C.muted }}>Le seed d'aujourd'hui n'a pas encore été envoyé par l'Académie Eden. Revenez plus tard ou contactez Zady.</div>
          </div>
        )}

        {/* Stats synthèse */}
        <div className="stat-trio">
          <div className="stat-box">
            <div className="stat-num" style={{ color:C.gold }}>{bilansMois.length}</div>
            <div className="stat-label">Bilans mensuels</div>
          </div>
          <div className="stat-box">
            <div className="stat-num" style={{ color:C.green }}>{tauxEngagement}%</div>
            <div className="stat-label">Engagement seeds</div>
          </div>
          <div className="stat-box">
            <div className="stat-num" style={{ color:C.blue }}>{questionsRestantes}</div>
            <div className="stat-label">Questions restantes</div>
          </div>
        </div>

        {/* Arche Eden */}
        <div style={{ background:"linear-gradient(135deg,#0A1208,#0D1018)", border:"1px solid #C9A84C33", padding:"16px", marginBottom:16 }}>
          <div style={{ fontSize:9, color:C.gold, letterSpacing:".2em", textTransform:"uppercase", marginBottom:8 }}>◈ Arche Eden</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:"#F0EBE0", marginBottom:6 }}>Prière & Q&R hebdomadaire avec Zady Zozoro</div>
          <p style={{ fontSize:12, color:C.muted, lineHeight:1.6, marginBottom:12 }}>Chaque semaine, un moment de prière et de ressourcement en direct avec Zady. Questions en live, enseignement sur le pilier du mois, communauté d'abonnés.</p>
          <button style={{ background:"transparent", border:`1px solid ${C.gold}44`, color:C.gold, padding:"10px 16px", fontFamily:"'Jost',sans-serif", fontSize:11, cursor:"pointer", width:"100%" }}
            onClick={() => window.open(WHATSAPP_GROUP_LINK)}>
            Rejoindre le groupe WhatsApp privé →
          </button>
        </div>

        {/* Q&A rapide */}
        <div className="qa-abonne">
          <div style={{ fontSize:9, color:C.gold, letterSpacing:".2em", textTransform:"uppercase", marginBottom:8 }}>✦ Conseiller Eden — Accès rapide</div>
          <div className="memory-badge">
            <div className="memory-badge-dot" />
            <span style={{ fontSize:10, color:C.green }}>Mémoire active — {bilansMois.length} bilan{bilansMois.length>1?"s":""} + {(profile.questions||[]).length} question{(profile.questions||[]).length>1?"s":""} mémorisée{(profile.questions||[]).length>1?"s":""}</span>
          </div>
          <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>Le Conseiller connaît votre parcours complet. {questionsRestantes} question{questionsRestantes>1?"s":""} restante{questionsRestantes>1?"s":""} ce mois.</div>
          <button onClick={() => setTab("conseiller")} style={{ background:"transparent", border:`1px solid ${C.gold}44`, color:C.gold, padding:"10px 18px", fontFamily:"'Jost',sans-serif", fontSize:11, cursor:"pointer", width:"100%" }}>
            Ouvrir le Conseiller Eden →
          </button>
        </div>
      </div>
    )}

    {/* ─────────────── PILIER DU MOIS ─────────────── */}
    {tab === "pilier" && (
      <div>
        <div style={{ fontSize:9, color:C.dim, letterSpacing:".18em", textTransform:"uppercase", marginBottom:16 }}>Programme — 12 Piliers sur 12 mois</div>
        {PILIERS_ANNUELS.map(p => {
          const bilan = bilansMois.find(b => b.pilier === p.id || b.mois === p.mois);
          const estActuel = p.mois === moisActuel;
          const estPasse = p.mois < moisActuel;
          return (
            <div key={p.id} className={`bilan-mensuel-card ${bilan ? "bilan-mensuel-done" : estActuel ? "bilan-mensuel-pending" : ""}`} onClick={() => estActuel ? setBilanModal({ pilier:p, type:"mensuel" }) : null}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                    <span style={{ fontSize:10, color:p.couleur }}>{p.icon}</span>
                    <span style={{ fontSize:9, color:C.dim, letterSpacing:".1em", textTransform:"uppercase" }}>Mois {p.mois}</span>
                    {estActuel && <span style={{ fontSize:8, padding:"2px 6px", border:`1px solid ${C.gold}44`, color:C.gold, letterSpacing:".1em", textTransform:"uppercase" }}>En cours</span>}
                  </div>
                  <div style={{ fontSize:13, color: bilan ? C.green : estActuel ? "#F0EBE0" : C.muted, marginBottom:4 }}>{p.label}</div>
                  <div style={{ fontSize:10, color:C.dim, fontStyle:"italic" }}>{p.verset}</div>
                  {bilan && <div style={{ marginTop:6 }}>
                    <div style={{ fontSize:11, color:C.green }}>Score : {bilan.gp}/100</div>
                    <div className="progression-bar"><div className="progression-fill" style={{ width:`${bilan.gp}%`, background:C.green }} /></div>
                  </div>}
                </div>
                <div style={{ fontSize:22, color:bilan ? C.green : estActuel ? C.gold : "#2A2E3A", marginLeft:12, flexShrink:0 }}>
                  {bilan ? "✓" : estActuel ? "→" : "○"}
                </div>
              </div>
              {estActuel && !bilan && (
                <div style={{ marginTop:12, fontSize:11, color:C.gold }}>Cliquez pour faire votre bilan de ce mois</div>
              )}
            </div>
          );
        })}
      </div>
    )}

    {/* ─────────────── SEEDS ─────────────── */}
    {tab === "seeds" && (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontSize:9, color:C.dim, letterSpacing:".18em", textTransform:"uppercase" }}>Seeds du mois — {pilierActuel.label}</div>
          <div style={{ fontSize:10, color:C.muted }}>{seedsRepondus}/{totalSeeds} répondus</div>
        </div>
        {seedsDuMois.length === 0 && (
          <div style={{ background:"#0D1018", border:"1px solid #1E2330", padding:"24px", textAlign:"center" }}>
            <div style={{ fontSize:13, color:C.muted, marginBottom:8 }}>Aucun seed reçu ce mois.</div>
            <div style={{ fontSize:11, color:C.dim }}>Les seeds sont envoyés par l'Académie Eden. Contactez Zady si vous n'en avez pas reçu.</div>
          </div>
        )}
        {seedsDuMois.map(seed => {
          const isToday = new Date(seed.date).toDateString() === today;
          return (
            <div key={seed.date} className={`seed-item ${isToday ? "today" : ""}`}>
              <div className="seed-date">
                {new Date(seed.date).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}
                {isToday && <span style={{ marginLeft:8, color:C.gold }}>— Aujourd'hui</span>}
              </div>
              <div className="seed-contenu">{seed.contenu}</div>
              <div className="seed-action">Action du jour : {seed.action}</div>
              {seed.reponse ? (
                <div style={{ padding:"8px 12px", background:"#0A1208", border:"1px solid #4A9B6A33", fontSize:12, color:C.muted, fontStyle:"italic" }}>
                  ✓ Votre réponse : "{seed.reponse}"
                  <div style={{ fontSize:9, color:C.dim, marginTop:4 }}>{new Date(seed.reponduAt).toLocaleDateString("fr-FR")}</div>
                </div>
              ) : (
                <div>
                  {selectedSeed === seed.date ? (
                    <div>
                      <textarea className="seed-reponse-input" placeholder="Votre réponse à cette action…" value={seedReponse} onChange={e => setSeedReponse(e.target.value)} />
                      <div style={{ display:"flex", gap:8, marginTop:8 }}>
                        <button onClick={() => { setSelectedSeed(null); setSeedReponse(""); }} style={{ background:"transparent", border:"1px solid #1E2330", color:C.dim, padding:"8px 14px", fontFamily:"'Jost',sans-serif", fontSize:11, cursor:"pointer" }}>Annuler</button>
                        <button onClick={() => handleSaveReponse(seed.date)} disabled={seedSaving || !seedReponse.trim()} style={{ flex:1, background:C.gold, border:"none", color:"#0B0F1A", padding:"8px 14px", fontFamily:"'Jost',sans-serif", fontSize:11, fontWeight:600, cursor:"pointer", opacity:seedReponse.trim()?1:.5 }}>{seedSaving?"Sauvegarde…":"Enregistrer"}</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setSelectedSeed(seed.date); setSeedReponse(""); }} style={{ background:"transparent", border:`1px solid ${C.gold}33`, color:C.gold, padding:"8px 14px", fontFamily:"'Jost',sans-serif", fontSize:11, cursor:"pointer", width:"100%", marginTop:4 }}>Répondre à ce seed</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}

    {/* ─────────────── BILANS ─────────────── */}
    {tab === "bilans" && (
      <div>
        <div style={{ fontSize:9, color:C.dim, letterSpacing:".18em", textTransform:"uppercase", marginBottom:16 }}>Historique de mes bilans</div>
        {profile.bilanInitial && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:9, color:C.muted, letterSpacing:".14em", textTransform:"uppercase", marginBottom:8 }}>Bilan initial</div>
            <div style={{ background:"#0D1018", border:"1px solid #C9A84C33", padding:"14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:"#F0EBE0" }}>Score global : {profile.bilanInitial.gp}/100</div>
                <div style={{ fontSize:10, color:C.dim }}>{new Date(profile.bilanInitial.date).toLocaleDateString("fr-FR")}</div>
              </div>
              <div className="progression-bar" style={{ marginTop:8 }}><div className="progression-fill" style={{ width:`${profile.bilanInitial.gp}%`, background:C.gold }} /></div>
            </div>
          </div>
        )}
        {bilansMois.length === 0 && (
          <div style={{ background:"#0D1018", border:"1px solid #1E2330", padding:"24px", textAlign:"center" }}>
            <div style={{ fontSize:13, color:C.muted, marginBottom:8 }}>Aucun bilan mensuel enregistré.</div>
            <div style={{ fontSize:11, color:C.dim }}>Votre premier bilan mensuel apparaîtra ici après l'avoir complété dans "Pilier du mois".</div>
          </div>
        )}
        {bilansMois.sort((a,b) => b.mois - a.mois).map(b => {
          const pilier = PILIERS_ANNUELS.find(p => p.mois === b.mois);
          return (
            <div key={b.mois} style={{ background:"#0D1018", border:"1px solid #4A9B6A33", padding:"14px", marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:9, color:C.green, letterSpacing:".12em", textTransform:"uppercase", marginBottom:4 }}>Mois {b.mois} — {b.date ? new Date(b.date).toLocaleDateString("fr-FR",{month:"long",year:"numeric"}) : ""}</div>
                  <div style={{ fontSize:14, color:"#F0EBE0" }}>{pilier?.label || b.pilier}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:C.green, lineHeight:1 }}>{b.gp}</div>
                  <div style={{ fontSize:9, color:C.dim }}>/100</div>
                </div>
              </div>
              <div className="progression-bar"><div className="progression-fill" style={{ width:`${b.gp}%`, background:C.green }} /></div>
              {/* Mini score bars par dimension */}
              {b.scores && (
                <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:4 }}>
                  {Object.entries(b.scores).slice(0, 3).map(([,v]) => (
                    <div key={v.label} style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <div style={{ fontSize:10, color:C.muted, width:120, flexShrink:0 }}>{v.label.split(" ")[0]}</div>
                      <div style={{ flex:1, height:2, background:"#1E2330" }}><div style={{ width:`${v.p}%`, height:"100%", background:v.p>=65?C.green:v.p>=50?C.gold:C.red }} /></div>
                      <div style={{ fontSize:10, color:C.muted, width:30, textAlign:"right" }}>{v.p}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {/* Bouton comparer si ≥ 2 bilans */}
        {bilansMois.length >= 2 && profile.bilanInitial && (
          <div style={{ marginTop:16, background:"#0A1208", border:"1px solid #4A9B6A33", border:"1px solid #4A9B6A33", padding:"16px" }}>
            <div style={{ fontSize:9, color:C.green, letterSpacing:".2em", textTransform:"uppercase", marginBottom:8 }}>◈ Progression depuis le bilan initial</div>
            {Object.entries(bilansMois[bilansMois.length-1]?.scores || {}).slice(0,4).map(([dim, v]) => {
              const initial = profile.bilanInitial?.scores?.[dim];
              if (!initial) return null;
              const delta = v.p - initial.p;
              return (
                <div key={dim} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                  <div style={{ fontSize:10, color:C.muted, flex:1 }}>{v.label.split(" ")[0]}</div>
                  <div style={{ fontSize:11, color:delta>0?C.green:delta<0?C.red:C.dim, fontWeight:600 }}>{delta>0?"+":""}{delta} pts</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}

    {/* ─────────────── CONSEILLER IA ─────────────── */}
    {tab === "conseiller" && (
      <div>
        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
        <div style={{ fontSize:8, letterSpacing:".2em", textTransform:"uppercase", padding:"3px 10px", border:"1px solid", borderColor: niveau==="premium"?"#C9A84C44":niveau==="argent"?"#7BAFC944":"#4A9B6A44", color: niveau==="premium"?C.gold:niveau==="argent"?C.blue:C.green }}>✦ Eden {niveau.charAt(0).toUpperCase()+niveau.slice(1)}</div>
        <div style={{ fontSize:10, color:C.dim }}>30 questions IA/mois</div>
      </div>
      <div className="memory-badge" style={{ marginBottom:16 }}>
          <div className="memory-badge-dot" />
          <span style={{ fontSize:10, color:C.green }}>Mémoire active — {bilansMois.length} bilan{bilansMois.length>1?"s":""}, {(profile.questions||[]).length} question{(profile.questions||[]).length>1?"s":""} mémorisée{(profile.questions||[]).length>1?"s":""}, {seedsRepondus} seed{seedsRepondus>1?"s":""} répondu{seedsRepondus>1?"s":""}</span>
        </div>
        {/* Compteur questions */}
        <div className="qa-abonne-counter" style={{ marginBottom:16 }}>
          <div className="qa-abonne-dots">
            {Array.from({length:30}).map((_,i) => <div key={i} className={`qa-abonne-dot ${i < questionsUtiliseesCeMois ? "used" : ""}`} />)}
          </div>
          <span style={{ fontSize:10, color:questionsRestantes===0?C.red:C.gold, marginLeft:8 }}>{questionsRestantes}/30 ce mois</span>
        </div>
        {chatHistory.length > 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16, maxHeight:480, overflowY:"auto" }}>
            {chatHistory.map((msg,i) => (
              <div key={i} style={{ padding:"12px 16px", background:msg.role==="user"?"#111520":"#0A1410", borderLeft:`3px solid ${msg.role==="user"?C.gold:C.green}` }}>
                <div style={{ fontSize:9, letterSpacing:".14em", textTransform:"uppercase", color:msg.role==="user"?C.gold:C.green, marginBottom:6 }}>{msg.role==="user"?profile.nom:"Eden Académie"}</div>
                <div style={{ fontSize:13, color:C.text, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{msg.content}</div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"12px 16px", background:"#0A1410", borderLeft:`3px solid ${C.green}` }}>
                <span style={{ fontSize:9, color:C.green, letterSpacing:".12em", textTransform:"uppercase", marginRight:4 }}>Eden</span>
                {[0,1,2].map(i => <div key={i} style={{ width:5, height:5, borderRadius:"50%", background:C.green, animation:`qdot .9s ease-in-out ${i*.15}s infinite` }} />)}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
        {questionsRestantes > 0 ? (
          <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
            <textarea
              style={{ flex:1, background:"#0D1018", border:"1px solid #1E2330", color:C.text, fontFamily:"'Jost',sans-serif", fontSize:13, padding:"12px 14px", minHeight:64, resize:"vertical", lineHeight:1.7 }}
              placeholder={`Posez votre question à l'Académie Eden… (${questionsRestantes} restante${questionsRestantes>1?"s":""})`}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleAskQuestion();} }}
              disabled={chatLoading}
            />
            <button onClick={handleAskQuestion} disabled={!chatInput.trim()||chatLoading} style={{ background:C.gold, border:"none", color:"#0B0F1A", padding:"14px 16px", fontFamily:"'Jost',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer", opacity:chatInput.trim()?1:.5 }}>
              {chatLoading?"…":"Envoyer"}
            </button>
          </div>
        ) : (
          <div style={{ background:"#14100A", border:"1px solid #C9A84C44", padding:"18px 20px", textAlign:"center" }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:17, color:C.gold, marginBottom:6 }}>Vous avez utilisé vos 30 questions ce mois</div>
            <div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>Vos questions se renouvellent le 1er du mois prochain. Pour un accompagnement plus intensif, contactez l'Académie Eden.</div>
            <button className="btn-wa" style={{ marginTop:14, background:"#25D366", border:"none", color:"#fff", padding:"12px 20px", fontFamily:"'Jost',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer", width:"100%" }} onClick={() => window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(`Bonjour, je suis l'abonné(e) ${profile.nom} et j'ai utilisé mes 30 questions ce mois. Je souhaite un accompagnement supplémentaire.`)}`)}>Contacter Zady directement</button>
          </div>
        )}
        {chatHistory.length === 0 && questionsRestantes > 0 && (
          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:10, color:C.dim, marginBottom:10 }}>Questions suggérées ce mois :</div>
            {[
              `Qu'est-ce que mon dernier bilan révèle sur ${pilierActuel.label.toLowerCase()} dans notre couple ?`,
              `Comment appliquer concrètement le seed d'hier dans notre quotidien ?`,
              `Quelle est la progression la plus significative que tu observes dans mon parcours ?`,
            ].map((q,i) => (
              <div key={i} onClick={() => setChatInput(q)} style={{ padding:"10px 14px", background:"#0D1018", border:"1px solid #1E2330", marginBottom:6, cursor:"pointer", fontSize:12, color:C.muted, transition:"all .2s" }} onMouseEnter={e=>e.currentTarget.style.borderColor="#C9A84C44"} onMouseLeave={e=>e.currentTarget.style.borderColor="#1E2330"}>
                {q}
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* ─────────────── RAPPORT ANNUEL ─────────────── */}
    {tab === "annuel" && (
      <div>
        {bilansMois.length < 12 ? (
          <div>
            <div style={{ background:"#0D1018", border:"1px solid #C9A84C33", padding:"24px", marginBottom:20 }}>
              <div style={{ fontSize:9, color:C.gold, letterSpacing:".22em", textTransform:"uppercase", marginBottom:8 }}>◈ Rapport de Progression Annuelle</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:"#F0EBE0", marginBottom:12, lineHeight:1.3 }}>Disponible après 12 bilans mensuels</div>
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:11, color:C.muted }}>Progression</span>
                  <span style={{ fontSize:11, color:C.gold }}>{bilansMois.length}/12 bilans complétés</span>
                </div>
                <div className="progression-bar" style={{ height:6 }}>
                  <div className="progression-fill" style={{ width:`${(bilansMois.length/12)*100}%`, background:C.gold }} />
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {PILIERS_ANNUELS.map(p => {
                  const fait = bilansMois.find(b => b.mois === p.mois);
                  return (
                    <div key={p.id} style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <div style={{ fontSize:10, color:fait?C.green:"#2A2E3A", width:16 }}>{fait?"✓":"○"}</div>
                      <div style={{ fontSize:11, color:fait?C.text:C.dim }}>{p.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {bilansMois.length >= 3 && (
              <div style={{ background:"#0A1208", border:"1px solid #4A9B6A33", padding:"16px" }}>
                <div style={{ fontSize:9, color:C.green, letterSpacing:".2em", textTransform:"uppercase", marginBottom:8 }}>◈ Aperçu de progression ({bilansMois.length} bilans)</div>
                {Object.entries(getProgressionAnnuelle(bilansMois) || {}).slice(0,4).map(([dim, vals]) => {
                  if (vals.length < 2) return null;
                  const delta = vals[vals.length-1].p - vals[0].p;
                  return (
                    <div key={dim} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
                      <div style={{ fontSize:11, color:C.muted, flex:1 }}>{dim.charAt(0).toUpperCase()+dim.slice(1)}</div>
                      <div style={{ fontSize:11, color:delta>0?C.green:delta<0?C.red:C.dim, fontWeight:600 }}>{delta>0?"+":""}{delta} pts</div>
                      <div style={{ fontSize:10, color:C.dim }}>{vals[0].p} → {vals[vals.length-1].p}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            {!profile.rapportAnnuel ? (
              <div style={{ background:"linear-gradient(135deg,#0B0F1A,#0D1020)", border:"1px solid #C9A84C33", padding:"28px", textAlign:"center", marginBottom:20 }}>
                <div style={{ fontSize:9, color:C.gold, letterSpacing:".3em", textTransform:"uppercase", marginBottom:12 }}>✦ Rapport Annuel</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:"#F0EBE0", marginBottom:12, lineHeight:1.3 }}>Vous avez complété vos 12 bilans.<br/>Votre rapport est prêt à être généré.</div>
                <div style={{ fontSize:12, color:C.muted, lineHeight:1.7, marginBottom:20 }}>Le Conseiller Eden va analyser l'ensemble de votre trajectoire annuelle — 12 bilans, {(profile.questions||[]).length} questions, {seedsRepondus} seeds répondus — pour vous livrer un rapport de progression complet avec recommandations.</div>
                <button onClick={handleGenerateRapportAnnuel} disabled={rapportAnnuelLoading} style={{ background:C.gold, border:"none", color:"#0B0F1A", padding:"16px 28px", fontFamily:"'Jost',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", opacity:rapportAnnuelLoading?.5:1 }}>
                  {rapportAnnuelLoading ? "Génération en cours…" : "Générer mon rapport annuel →"}
                </button>
              </div>
            ) : (
              <div className="annual-report">
                <div style={{ fontSize:8, letterSpacing:".3em", textTransform:"uppercase", color:C.gold, marginBottom:8 }}>✦ Rapport Annuel Eden</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:"#F0EBE0", marginBottom:4 }}>{profile.nom}</div>
                <div style={{ fontSize:10, color:C.dim, marginBottom:20 }}>Généré le {new Date(profile.rapportAnnuel.generatedAt).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</div>
                {parseRapportAnnuel(profile.rapportAnnuel.texte).map((s,i) => (
                  s.type==="title"
                    ? <div key={i} style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:17, color:C.gold, margin:"20px 0 10px" }}>{s.text}</div>
                    : <div key={i} style={{ fontSize:13, color:C.text, lineHeight:1.9, whiteSpace:"pre-wrap", marginBottom:12 }}>{s.text}</div>
                ))}
                <div style={{ marginTop:24, padding:"14px", background:"#080A12", border:"1px solid #1E2230", fontSize:10, color:C.dim, lineHeight:1.7 }}>Ce rapport est une analyse indicative. Il ne remplace pas un accompagnement professionnel.</div>
                <button style={{ marginTop:16, background:"#25D366", border:"none", color:"#fff", padding:"12px 20px", fontFamily:"'Jost',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer", width:"100%" }} onClick={() => window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(`Bonjour Académie Eden, je viens de recevoir mon rapport annuel. Je souhaite en discuter avec Zady.`)}`)}>
                  Discuter de mon rapport avec Zady
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )}

  </div>

  {/* ── Modal bilan mensuel ── */}
  {bilanModal && (
    <BilanMensuelModal
      pilier={bilanModal.pilier}
      profile={profile}
      onComplete={async (bilan) => {
        const updated = {
          ...profile,
          bilans: [...(profile.bilans||[]).filter(b=>b.mois!==bilanModal.pilier.mois), bilan],
        };
        await onUpdateProfile(updated);
        setBilanModal(null);
      }}
      onClose={() => setBilanModal(null)}
    />
  )}
</div>
```

);
}

// ─── Parser rapport annuel ────────────────────────────────────────────────
function parseRapportAnnuel(text) {
if (!text) return [];
return text.split(/**([^*]+)**/).reduce((acc,part,i)=>{
if(i%2===0){if(part.trim())acc.push({type:“body”,text:part.trim()});}
else{acc.push({type:“title”,text:part.trim()});}
return acc;
},[]);
}

// ─── Modal Bilan Mensuel ──────────────────────────────────────────────────
function BilanMensuelModal({ pilier, profile, onComplete, onClose }) {
const [scores, setScores] = useState({});
const [loading, setLoading] = useState(false);
const SCALE = [1,2,3,4,5];
const SL = {1:“Jamais”,2:“Rarement”,3:“Parfois”,4:“Souvent”,5:“Toujours”};

// Questions spécifiques au pilier (5 questions ciblées)
const questions = PILIER_QUESTIONS[pilier.id] || PILIER_QUESTIONS.default;

const allAnswered = questions.every(q => scores[q.id] !== undefined);

async function handleSubmit() {
if (!allAnswered) return;
setLoading(true);
// Calculer score global du bilan mensuel
const vals = Object.values(scores);
const gp = Math.round(vals.reduce((s,v)=>s+v,0)/vals.length*20);
// Construire contexte mémoire pour le rapport
const memoire = computeContextMemoire(profile);
const prompt = `Tu es le Conseiller de l'Académie Eden.\n\n${memoire}\n\nBILAN MENSUEL — Pilier : ${pilier.label} (Mois ${pilier.mois})\nVerset : ${pilier.verset}\nScore global : ${gp}/100\nRéponses :\n${questions.map(q=>`${q.label} : ${scores[q.id]}/5`).join("\n")}\n\nGénère un rapport mensuel court (250-350 mots) sur le pilier "${pilier.label}" pour ${profile.nom}.\nStructure :\n**CE QUE CE BILAN RÉVÈLE**\n**VOS FORCES SUR CE PILIER**\n**CE QUI DEMANDE ATTENTION**\n**UN PRINCIPE POUR CE MOIS**\nTon : pastoral, bienveillant, concret. Intégrer le verset ${pilier.verset} naturellement. Pas de jargon clinique.`;
try {
const res = await fetch(”/api/diagnostic-report”,{method:“POST”,headers:{“Content-Type”:“application/json”},body:JSON.stringify({prompt})});
const data = await res.json();
const bilan = {
mois: pilier.mois,
pilier: pilier.id,
gp,
scores: Object.fromEntries(questions.map(q=>([q.id,{label:q.label,p:scores[q.id]*20}]))),
rapport: data.text||””,
date: new Date().toISOString(),
};
await onComplete(bilan);
} catch {
const bilan = { mois:pilier.mois, pilier:pilier.id, gp, scores:{}, rapport:””, date:new Date().toISOString() };
await onComplete(bilan);
}
setLoading(false);
}

return (
<div style={{ position:“fixed”,inset:0,background:”#000000EE”,zIndex:300,display:“flex”,alignItems:“center”,justifyContent:“center”,padding:20,overflowY:“auto” }}>
<div style={{ background:”#0D1018”,border:`1px solid ${pilier.couleur}44`,maxWidth:520,width:“100%”,padding:“28px 24px” }}>
<div style={{ fontSize:8,letterSpacing:”.26em”,textTransform:“uppercase”,color:pilier.couleur,marginBottom:8 }}>Bilan mensuel — Mois {pilier.mois}</div>
<div style={{ fontFamily:”‘Cormorant Garamond’,serif”,fontSize:20,color:”#F0EBE0”,marginBottom:6 }}>{pilier.label}</div>
<div style={{ fontSize:11,color:C.dim,fontStyle:“italic”,marginBottom:20 }}>{pilier.verset}</div>
{questions.map(q => (
<div key={q.id} style={{ marginBottom:20 }}>
<div style={{ fontSize:13,color:”#F0EBE0”,lineHeight:1.5,marginBottom:8,fontFamily:”‘Cormorant Garamond’,serif” }}>{q.label}</div>
<div style={{ display:“flex”,gap:6 }}>
{SCALE.map(v => (
<button key={v} onClick={()=>setScores(p=>({…p,[q.id]:v}))} style={{ flex:1,padding:“10px 4px”,border:`1px solid ${scores[q.id]===v?pilier.couleur:"#1E2330"}`,background:scores[q.id]===v?pilier.couleur+“22”:”#0D1018”,color:scores[q.id]===v?pilier.couleur:C.dim,fontFamily:”‘Jost’,sans-serif”,fontSize:10,cursor:“pointer”,textAlign:“center”,lineHeight:1.4 }}>
{v}<br/>{SL[v]}
</button>
))}
</div>
</div>
))}
<div style={{ display:“flex”,gap:8,marginTop:8 }}>
<button onClick={onClose} style={{ background:“transparent”,border:“1px solid #1E2330”,color:C.dim,padding:“12px 18px”,fontFamily:”‘Jost’,sans-serif”,fontSize:11,cursor:“pointer” }}>Annuler</button>
<button onClick={handleSubmit} disabled={!allAnswered||loading} style={{ flex:1,background:allAnswered?pilier.couleur:”#1E2330”,border:“none”,color:”#0B0F1A”,padding:“12px 18px”,fontFamily:”‘Jost’,sans-serif”,fontSize:12,fontWeight:600,cursor:“pointer”,opacity:allAnswered?1:.5 }}>
{loading?“Génération…”:“Valider ce bilan →”}
</button>
</div>
</div>
</div>
);
}

// ─── QUESTIONS PAR PILIER (5 questions ciblées par pilier) ───────────────
const PILIER_QUESTIONS = {
communication: [
{id:“p1”,label:“Ce mois, nous avons pris du temps pour des conversations profondes, sans distraction.”},
{id:“p2”,label:“Je me suis senti(e) vraiment écouté(e) par mon conjoint ce mois.”},
{id:“p3”,label:“J’ai exprimé mes besoins clairement, sans attendre que l’autre les devine.”},
{id:“p4”,label:“Il y a des sujets que nous avons continué à éviter ce mois.”},
{id:“p5”,label:“La qualité de notre dialogue a progressé par rapport au mois dernier.”},
],
gouvernance: [
{id:“p1”,label:“Les décisions importantes ce mois ont été prises ensemble, en consultation mutuelle.”},
{id:“p2”,label:“Les rôles de chacun étaient clairs et acceptés dans le foyer ce mois.”},
{id:“p3”,label:“J’ai exercé mon rôle de leadership sans dominer ni abdiquer.”},
{id:“p4”,label:“Des décisions ont été prises sans que je sois consulté(e) ce mois.”},
{id:“p5”,label:“Notre gouvernance familiale s’est clarifiée depuis le début de ce programme.”},
],
intimite: [
{id:“p1”,label:“Je me suis senti(e) profondément connu(e) et accepté(e) par mon conjoint ce mois.”},
{id:“p2”,label:“Notre connexion émotionnelle a été une source de force ce mois.”},
{id:“p3”,label:“Il m’est arrivé de me sentir seul(e) même en présence de mon conjoint.”},
{id:“p4”,label:“Nous avons eu des conversations sur nos peurs, rêves ou insécurités profondes.”},
{id:“p5”,label:“Notre intimité (émotionnelle et physique) était une source de connexion, pas de tension.”},
],
vision: [
{id:“p1”,label:“Ce mois, nous avons parlé de nos projets d’avenir communs.”},
{id:“p2”,label:“Je sens que mon conjoint et moi allons dans la même direction.”},
{id:“p3”,label:“Nous avons pris une décision concrète ce mois qui reflète notre vision commune.”},
{id:“p4”,label:“Notre couple a un sens clair pour moi au-delà du quotidien.”},
{id:“p5”,label:“La clarté de notre vision commune a progressé depuis le début du programme.”},
],
conflits: [
{id:“p1”,label:“Ce mois, nos désaccords se sont terminés par une compréhension mutuelle.”},
{id:“p2”,label:“Nous avons évité les accusations personnelles lors de nos conflits.”},
{id:“p3”,label:“Je n’ai pas cédé sous pression sans que mon point de vue soit entendu.”},
{id:“p4”,label:“Nous avons résolu un conflit ancien ou récurrent ce mois.”},
{id:“p5”,label:“Ma manière de gérer les conflits s’est améliorée ce mois.”},
],
spiritualite: [
{id:“p1”,label:“Nous avons prié ensemble au moins une fois cette semaine.”},
{id:“p2”,label:“La foi était une force active dans nos décisions de couple ce mois.”},
{id:“p3”,label:“En cas de difficulté, notre premier réflexe a été de nous tourner vers Dieu.”},
{id:“p4”,label:“Nous avons eu des conversations sur notre vie spirituelle commune.”},
{id:“p5”,label:“Notre fondation spirituelle de couple s’est renforcée ce mois.”},
],
equilibre: [
{id:“p1”,label:“Je suis rentré(e) à la maison présent(e) mentalement, pas seulement physiquement.”},
{id:“p2”,label:“Mon conjoint s’est senti une priorité réelle dans ma vie ce mois.”},
{id:“p3”,label:“Mon travail a empiété sur notre vie de couple de façon problématique ce mois.”},
{id:“p4”,label:“Nous avons eu des moments réservés uniquement à notre couple, sans obligations.”},
{id:“p5”,label:“Mon équilibre pro/famille s’est amélioré depuis le début du programme.”},
],
heritage: [
{id:“p1”,label:“Nous présentons un front uni devant nos enfants sur les questions éducatives.”},
{id:“p2”,label:“Nous avons parlé concrètement des valeurs que nous voulons transmettre.”},
{id:“p3”,label:“Nos tensions de couple ont affecté nos enfants ce mois.”},
{id:“p4”,label:“Nous maintenons des rituels ou traditions qui nous ancrent en famille.”},
{id:“p5”,label:“Notre cohérence parentale s’est améliorée depuis le début du programme.”},
],
dynamiques: [
{id:“p1”,label:“J’ai identifié un pattern inconscient qui opère dans notre relation ce mois.”},
{id:“p2”,label:“J’ai agi différemment face à une situation que j’aurais mal gérée avant.”},
{id:“p3”,label:“Les mêmes types de tensions sont revenus ce mois.”},
{id:“p4”,label:“Je reconnais l’influence de mon histoire familiale sur mes comportements actuels.”},
{id:“p5”,label:“Je transforme activement les patterns négatifs hérités.”},
],
blessures: [
{id:“p1”,label:“J’ai fait un pas de pardon concret ce mois — envers mon conjoint ou envers moi-même.”},
{id:“p2”,label:“Des blessures passées ont influencé mes réactions de manière disproportionnée ce mois.”},
{id:“p3”,label:“Je me sens plus libre émotionnellement que le mois dernier.”},
{id:“p4”,label:“J’ai pu exprimer une blessure à mon conjoint dans un espace de sécurité.”},
{id:“p5”,label:“Ma guérison intérieure progresse visiblement.”},
],
finances: [
{id:“p1”,label:“Nous avons eu une conversation honnête et ouverte sur nos finances ce mois.”},
{id:“p2”,label:“Nos dépenses ce mois reflétaient nos vraies priorités communes.”},
{id:“p3”,label:“Il y a des aspects financiers que nous continuons d’éviter d’aborder.”},
{id:“p4”,label:“Nous avançons vers plus de transparence et d’alignement financier.”},
{id:“p5”,label:“La confiance financière dans notre couple a progressé ce mois.”},
],
bilan_annuel: [
{id:“p1”,label:“Je suis satisfait(e) de la croissance de notre couple cette année.”},
{id:“p2”,label:“Les piliers travaillés ont produit des changements concrets dans notre quotidien.”},
{id:“p3”,label:“Je suis capable d’identifier clairement ce qui a changé en moi cette année.”},
{id:“p4”,label:“Nous avons les outils pour continuer à progresser l’année prochaine.”},
{id:“p5”,label:“Je me réjouis de ce que notre couple est devenu cette année.”},
],
default: [
{id:“p1”,label:“Ce mois a été une période de croissance pour notre couple.”},
{id:“p2”,label:“J’ai appliqué les apprentissages du programme dans mon quotidien.”},
{id:“p3”,label:“Je me suis senti(e) soutenu(e) et accompagné(e) par le programme.”},
{id:“p4”,label:“Des difficultés imprévues ont testé notre couple ce mois.”},
{id:“p5”,label:“Je suis engagé(e) à continuer cette démarche le mois prochain.”},
],
};

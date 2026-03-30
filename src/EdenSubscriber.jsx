import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// EDEN ACADÉMIE — Système Abonné v1.0
// Module complet : Piliers mensuels · Seeds quotidiens · Rapport annuel · IA mémorisante
// Institut de Leadership Familial — Fondé par Zady Zozoro
// ═══════════════════════════════════════════════════════════════════════════

const WHATSAPP_NUM = "2250141800001";
const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/CONFIGURER_ICI"; // ← Lien groupe WhatsApp privé abonnés
const C = {
bg:"#080C14", surface:"#0D1018", border:"#1E2330",
gold:"#C9A84C", goldLight:"#D4B86A",
green:"#4A9B6A", blue:"#7BAFC9",
red:"#C0614A", orange:"#C0784A",
text:"#C8C0B0", muted:"#8A8070", dim:"#4A5060",
};

// ─── LES 12 PILIERS — Programme annuel ───────────────────────────────────
export const PILIERS_ANNUELS = [
{ mois:1,  id:"communication",  label:"Communication & Dialogue",        icon:"◈", couleur:C.gold,   verset:"Proverbes 18:13",  resume:"Apprendre à parler vrai et à écouter profondément." },
{ mois:2,  id:"gouvernance",    label:"Gouvernance & Rôles",              icon:"◆", couleur:C.blue,   verset:"1 Corinthiens 11:3", resume:"Redéfinir qui tient le cap et comment les décisions se prennent." },
{ mois:3,  id:"intimite",       label:"Intimité & Connexion",             icon:"◉", couleur:C.red,    verset:"Genèse 2:24",      resume:"Reconstruire la proximité émotionnelle et physique." },
{ mois:4,  id:"vision",         label:"Vision & Projet Commun",           icon:"◎", couleur:C.green,  verset:"Habacuc 2:2",      resume:"Écrire ensemble le futur que vous voulez bâtir." },
{ mois:5,  id:"conflits",       label:"Gestion des Conflits",             icon:"◐", couleur:C.orange, verset:"Éphésiens 4:26",   resume:"Transformer les disputes en tremplins de croissance." },
{ mois:6,  id:"spiritualite",   label:"Foi & Vie Spirituelle",            icon:"✦", couleur:C.gold,   verset:"Josué 24:15",      resume:"Faire de Dieu le centre réel de votre foyer." },
{ mois:7,  id:"equilibre",      label:"Équilibre Pro / Famille",          icon:"◑", couleur:C.blue,   verset:"Deutéronome 6:7",  resume:"Être présent(e) là où vous êtes vraiment." },
{ mois:8,  id:"heritage",       label:"Parentalité & Héritage",           icon:"◇", couleur:C.green,  verset:"Proverbes 22:6",   resume:"Transmettre des valeurs, pas seulement des règles." },
{ mois:9,  id:"dynamiques",     label:"Dynamiques Relationnelles",        icon:"◑", couleur:C.orange, verset:"Genèse 3:12",      resume:"Identifier et interrompre les patterns inconscients." },
{ mois:10, id:"blessures",      label:"Guérison & Pardon",                icon:"◉", couleur:C.red,    verset:"Éphésiens 4:32",   resume:"Ce qui n'est pas guéri se répète. Ce qui est pardonné se libère." },
{ mois:11, id:"finances",       label:"Finances & Transparence",          icon:"◈", couleur:C.gold,   verset:"Luc 16:11",        resume:"L'argent révèle les vraies priorités du couple." },
{ mois:12, id:"bilan_annuel",   label:"Bilan & Projection Annuelle",      icon:"✦", couleur:C.green,  verset:"Psaume 90:12",     resume:"Mesurer le chemin parcouru. Préparer l'année suivante." },
];

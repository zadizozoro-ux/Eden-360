import { useState, useEffect } from "react";

export const PILIERS_ANNUELS = [
  { mois: 1, id: "communication", label: "Communication & Dialogue" },
  { mois: 2, id: "gouvernance", label: "Gouvernance & Rôles" },
  { mois: 3, id: "intimite", label: "Intimité & Connexion" }
];

export const createSubscriberProfile = (data) => ({ id: Date.now(), ...data });

export default function EspaceAbonne() {
  return (
    <div style={{ padding: '20px', background: '#0D1018', borderRadius: '8px', border: '1px solid #1E2330' }}>
      <h3 style={{ color: '#C9A84C' }}>Votre Programme de Leadership</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {PILIERS_ANNUELS.map(pilier => (
          <li key={pilier.id} style={{ padding: '15px', borderBottom: '1px solid #1E2330', display: 'flex', justifyContent: 'space-between' }}>
            <span>Mois {pilier.mois} : {pilier.label}</span>
            <span style={{ color: '#4A9B6A' }}>✓ Disponible</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

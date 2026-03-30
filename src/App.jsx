import { useState, useEffect, useRef } from "react";
import EspaceAbonne, { createSubscriberProfile, PILIERS_ANNUELS } from "./EdenSubscriber";

const C = {
  bg: "#080C14", surface: "#0D1018", border: "#1E2330",
  gold: "#C9A84C", text: "#C8C0B0", muted: "#8A8070"
};

export default function App() {
  const [view, setView] = useState("home");
  const [subscriberProfile, setSubscriberProfile] = useState(null);

  return (
    <div style={{ backgroundColor: C.bg, color: C.text, minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header style={{ padding: '20px', textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ color: C.gold, fontSize: '1.5rem', letterSpacing: '2px' }}>EDEN 360°</h1>
      </header>

      <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        {view === "home" ? (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <h2 style={{ color: '#F0EBE0' }}>Bienvenue dans l'Institut de Leadership Familial</h2>
            <p style={{ color: C.muted, marginBottom: '30px' }}>Commencez votre bilan ou accédez à votre espace.</p>
            <button 
              onClick={() => setView("abonne")}
              style={{ background: C.gold, color: '#000', border: 'none', padding: '15px 30px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ACCÉDER À L'ESPACE ABONNÉ
            </button>
          </div>
        ) : (
          <div>
            <button onClick={() => setView("home")} style={{ color: C.gold, background: 'none', border: 'none', marginBottom: '20px' }}>← Retour</button>
            <EspaceAbonne />
          </div>
        )}
      </main>
    </div>
  );
}

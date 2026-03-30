import { useState } from "react";

export default function App() {
  return (
    <div style={{ backgroundColor: '#080C14', color: '#C9A84C', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem' }}>✦ ACADÉMIE EDEN ✦</h1>
      <p style={{ color: '#C8C0B0' }}>Le nouveau projet est en ligne.</p>
      <div style={{ border: '1px solid #C9A84C', padding: '20px', borderRadius: '8px' }}>
        Prêt pour l'installation sur iPad
      </div>
    </div>
  );
}

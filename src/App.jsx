import { useState } from "react";
import EspaceAbonne from "./EdenSubscriber.jsx";

function App() {
  // Profil utilisateur pour l'espace abonné
  const [profile, setProfile] = useState({
    nom: "Utilisateur",
    profil: "marie",
    dateInscription: new Date().toISOString(),
    bilans: [],
    formations: [],
    seeds: [
      {
        date: new Date().toISOString(),
        mois: new Date().getMonth() + 1,
        jour: new Date().getDate(),
        pilier: "communication",
        contenu: "Ce soir, prenez 15 minutes — sans téléphone — pour vous regarder dans les yeux et répondre à cette question : 'Qu'est-ce que tu vis en ce moment que tu ne m'as pas encore dit ?'",
        action: "Posez la question. Écoutez sans interrompre. Puis répondez vous aussi.",
      }
    ],
    questions: [],
    rapportAnnuel: null,
    bilanInitial: null,
    notesAdmin: "",
  });

  const handleUpdateProfile = (newProfile) => {
    setProfile(newProfile);
    console.log("Profil mis à jour:", newProfile);
  };

  return (
    <div className="eden-app">
      <EspaceAbonne 
        profile={profile}
        abonnementLevel="premium"
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
}

export default App;

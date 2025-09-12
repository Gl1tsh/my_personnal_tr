// src/pages/signup.ts

export function initSignupPage() {
  console.log('🎭 Signup page initialisée');

  const form = document.getElementById('signup_form') as HTMLFormElement | null;
  console.log('📝 Formulaire trouvé:', form);
  
  if (!form) {
    console.error('❌ Formulaire signup_form non trouvé !');
    return;
  }
  
  form?.reset();

  form?.addEventListener('submit', async (e) => {
    console.log('🚀 Soumission du formulaire détectée');
    e.preventDefault();
    
    // Récupère les valeurs
    const username = (document.getElementById('su_username') as HTMLInputElement).value.trim();
    const email = (document.getElementById('su_email') as HTMLInputElement).value.trim();
    const password = (document.getElementById('su_password') as HTMLInputElement).value;

    console.log('📋 Données récupérées:', { username, email, password: '***' });

    // Validation côté client
    if (!username || !email || !password) {
      console.error('❌ Champs manquants');
      alert('Tous les champs sont obligatoires');
      return;
    }

    if (password.length < 6) {
      console.error('❌ Mot de passe trop court');
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Appel à l'API backend pour créer l'utilisateur
    console.log('🌐 Envoi vers l\'API backend...');
    
    try {
      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: username,
          login: username, // On utilise le username comme login
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'inscription');
      }

      const result = await response.json();
      console.log('✅ Utilisateur créé côté serveur:', result);

      // Créer le profil utilisateur local pour l'UI (optionnel)
      const userProfile = {
        id: result.id,
        displayName: username,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        rank: Math.floor(Math.random() * 100) + 1,
        wins: 0,
        losses: 0,
        totalMatches: 0,
        matchHistory: [],
        lastActivity: new Date().toISOString()
      };

      // Sauvegarder les infos utilisateur pour l'UI
      const currentUser = {
        id: result.id,
        name: username,
        login: username,
        email: email
      };

      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      alert('Compte créé avec succès ! Vos données sont maintenant stockées en base.');
      window.location.hash = '#profile';

    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });

  // Retour au login si annulation
  document.getElementById('button-cancel-signup')?.addEventListener('click', () => {
    window.location.hash = '#login';
  });
}

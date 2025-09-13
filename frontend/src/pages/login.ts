/* eslint-disable no-undef */
// src/pages/login.ts
export function initLoginPage() {
  console.log('Login');
  // Récup le formulaire de login et reset les input (champs)
  const form = document.getElementById('login_form') as HTMLFormElement;
  // form.reset();

  // Bouton vers la page de creat account
  const button_Signup = document.getElementById('button-signup');
  button_Signup?.addEventListener('click', () => {
    window.location.hash = '#signup';
  });

  form.onsubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(form);
    const { identifier, password } = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        alert('Erreur: ' + result.error);
        return;
      }

      console.log('✅ Connexion réussie:', result);
      
      // Sauvegarder les infos utilisateur
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      
      // Créer/mettre à jour le profil avec les données de l'utilisateur
      const userProfile = {
        id: result.user.id,
        displayName: result.user.name,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${result.user.name}`,
        rank: 1,
        wins: 0,
        losses: 0,
        totalMatches: 0,
        matchHistory: [],
        lastActivity: new Date().toISOString()
      };
      localStorage.setItem('userProfile', JSON.stringify(userProfile));

      alert('Connexion réussie !');
      window.location.hash = '#live-chat';
    } catch (error) {
      console.error('Error during login:', error);
      alert('Erreur de connexion au serveur');
    }
  };
}

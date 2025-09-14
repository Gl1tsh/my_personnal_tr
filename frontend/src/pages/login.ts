/* eslint-disable no-undef */
// src/pages/login.ts
export function initLoginPage() {
  console.log('Login');
  
  const form = document.getElementById('login_form') as HTMLFormElement;

  // Bouton vers la page de création de compte
  const button_Signup = document.getElementById('button-signup');
  button_Signup?.addEventListener('click', () => {
    window.location.hash = '#signup';
  });

  form.onsubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(form);
    const { identifier, password } = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
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
      
      // 🔑 SAUVEGARDER SEULEMENT LE TOKEN DE SESSION (pas de localStorage user)
      if (result.sessionToken) {
        sessionStorage.setItem('authToken', result.sessionToken);
        console.log('🔐 Token de session sauvegardé');
      }

      // 🎉 Notification de succès
      alert(`🎉 Connexion réussie ! 
      
✅ Bienvenue ${result.user.name} !
➡️ Redirection vers votre profil...`);
      
      // Rediriger vers le profil (les données seront récupérées depuis la BDD)
      window.location.hash = '#profile';
      
    } catch (error) {
      console.error('Error during login:', error);
      alert('Erreur de connexion au serveur');
    }
  };
}

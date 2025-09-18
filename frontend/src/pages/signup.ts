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
        // Même technique que login.ts pour éviter "Unexpected end of JSON input"
        const text = await response.text();
        let errorData;
        try {
          errorData = text ? JSON.parse(text) : { error: 'Erreur serveur' };
        } catch (parseError) {
          console.error('❌ Erreur parsing réponse d\'erreur:', parseError);
          throw new Error('Erreur serveur: réponse invalide');
        }
        throw new Error(errorData.error || 'Erreur lors de l\'inscription');
      }

      // Même technique que login.ts pour le parsing JSON
      const text = await response.text();
      let result;
      try {
        if (!text || text.trim() === '') {
          console.error('❌ Réponse vide du serveur signup');
          throw new Error('Le serveur a renvoyé une réponse vide');
        }
        result = JSON.parse(text);
        console.log('📋 JSON signup parsé avec succès:', result);
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON signup:', parseError);
        throw new Error('Impossible de parser la réponse du serveur');
      }
      console.log('✅ Utilisateur créé côté serveur:', result);

      // 🎉 NOTIFICATION DE SUCCÈS - Plus rien en localStorage !
      alert(`🎉 Compte créé avec succès ! 
      
✅ Votre compte "${username}" est maintenant enregistré dans la base de données.
➡️ Vous pouvez maintenant vous connecter.`);
      
      // Rediriger vers la page de connexion
      window.location.hash = '#login';

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

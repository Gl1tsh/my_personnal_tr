/* eslint-disable no-undef */
// src/pages/profile.ts

interface User {
  id: number;
  name: string;
  login: string;
  email: string;
  rank?: number;
  avatar?: string | null;
}

// 🚫 FINI LE LOCALSTORAGE ! Tout vient de la BDD
async function fetchUserFromDB(): Promise<User | null> {
  const token = sessionStorage.getItem('authToken');
  if (!token) {
    console.log('❌ Aucun token de session');
    return null;
  }

  try {
    const response = await fetch('http://localhost:3001/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Session expirée ou invalide');
    }

    const result = await response.json();
    return result.user;
  } catch (error) {
    console.error('❌ Erreur récupération profil:', error);
    return null;
  }
}

// Générer un avatar par défaut si pas d'avatar en BDD
function getDefaultAvatar(username: string): string {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
}

// Afficher le profil avec les données de la BDD
function renderProfile(container: HTMLElement, user: User) {
  const avatar = user.avatar || getDefaultAvatar(user.name);
  const rank = user.rank || 1;
  
  container.innerHTML = `
    <div class="glass-morphism p-8 rounded-lg">
      <!-- En-tête du profil -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-8">
          <img id="profile-avatar" src="${avatar}" alt="Avatar" class="w-32 h-32 rounded-full border-4 border-white/10 shadow-lg"/>
          <div>
            <div class="flex items-center gap-4 mb-4">
              <h2 id="display-name" class="text-4xl font-light tracking-wider text-white/90">${user.name}</h2>
              <button id="logout-btn" class="glass-button text-sm bg-red-500/20 hover:bg-red-500/30">
                🚪 DÉCONNEXION
              </button>
            </div>
            <div class="text-white/70 mb-2">Login: ${user.login}</div>
            <div class="text-white/70 mb-4">Email: ${user.email}</div>
            <div class="flex gap-4 mb-4">
              <button id="edit-name-btn" class="glass-button">
                ✏️ MODIFIER PSEUDO
              </button>
              <button id="delete-account-btn" class="glass-button bg-red-500/20 hover:bg-red-500/30">
                🗑️ SUPPRIMER COMPTE
              </button>
            </div>
            <div class="flex gap-4">
              <button id="dm-button" class="glass-button">
                💬 DISCUTER
              </button>
              <button id="challenge-button" class="glass-button">
                ⚔️ DÉFIER
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="glass-morphism p-4 rounded text-center">
          <div class="text-2xl font-bold text-white/90">#${rank}</div>
          <div class="text-white/60 text-sm tracking-wider">RANG</div>
        </div>
        <div class="glass-morphism p-4 rounded text-center">
          <div class="text-2xl font-bold text-green-400">0</div>
          <div class="text-white/60 text-sm tracking-wider">VICTOIRES</div>
        </div>
        <div class="glass-morphism p-4 rounded text-center">
          <div class="text-2xl font-bold text-red-400">0</div>
          <div class="text-white/60 text-sm tracking-wider">DÉFAITES</div>
        </div>
      </div>

      <!-- Historique des matchs -->
      <div>
        <h3 class="text-xl font-light tracking-wider text-white/90 mb-4">DERNIERS MATCHS</h3>
        <div class="text-white/60 text-center p-4">
          <p>🎮 Aucun match joué pour le moment</p>
          <p class="text-sm mt-2">Lancez votre première partie pour voir vos statistiques !</p>
        </div>
      </div>
    </div>
  `;

  // Event listeners
  const logoutBtn = container.querySelector('#logout-btn') as HTMLButtonElement;
  
  // 🚪 Bouton de déconnexion - Nettoie TOUT
  logoutBtn.addEventListener('click', async () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      const token = sessionStorage.getItem('authToken');
      
      // Appeler l'API de déconnexion
      if (token) {
        try {
          await fetch('http://localhost:3001/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include'
          });
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
        }
      }
      
      // Nettoyer le stockage local
      sessionStorage.removeItem('authToken');
      localStorage.clear(); // Vider tout au cas où
      
      alert('Déconnexion réussie !');
      window.location.hash = '#login';
    }
  });

  // Autres boutons
  container.querySelector('#dm-button')?.addEventListener('click', () => {
    window.location.hash = '#live-chat';
  });
  
  container.querySelector('#challenge-button')?.addEventListener('click', () => {
    window.location.hash = '#game-modes';
  });

  // ✏️ Bouton modifier pseudo
  container.querySelector('#edit-name-btn')?.addEventListener('click', async () => {
    const newName = prompt('Nouveau pseudo:', user.name);
    if (newName && newName.trim() !== '' && newName.trim() !== user.name) {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        alert('Erreur: Session expirée');
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/auth/profile/name', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ newName: newName.trim() }),
          credentials: 'include'
        });

        if (response.ok) {
          alert('✅ Pseudo modifié avec succès !');
          // Recharger la page profil pour afficher le nouveau pseudo
          initProfilePage();
        } else {
          const error = await response.json();
          alert(`❌ Erreur: ${error.error}`);
        }
      } catch (error) {
        console.error('Erreur modification pseudo:', error);
        alert('❌ Erreur lors de la modification du pseudo');
      }
    }
  });

  // 🗑️ Bouton supprimer compte
  container.querySelector('#delete-account-btn')?.addEventListener('click', async () => {
    const confirmation = confirm(
      '⚠️ ATTENTION : Cette action est IRRÉVERSIBLE !\n\n' +
      'Supprimer votre compte effacera définitivement :\n' +
      '• Votre profil\n' +
      '• Vos statistiques\n' +
      '• Votre historique de jeux\n' +
      '• Tous vos messages\n\n' +
      'Êtes-vous absolument sûr de vouloir continuer ?'
    );
    
    if (confirmation) {
      const doubleConfirmation = confirm(
        '🚨 DERNIÈRE CHANCE !\n\n' +
        'Tapez exactement votre pseudo pour confirmer la suppression :'
      );
      
      if (doubleConfirmation) {
        const typedName = prompt(`Tapez "${user.name}" pour confirmer :`);
        if (typedName === user.name) {
          const token = sessionStorage.getItem('authToken');
          if (!token) {
            alert('Erreur: Session expirée');
            return;
          }

          try {
            const response = await fetch('http://localhost:3001/auth/profile', {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              credentials: 'include'
            });

            if (response.ok) {
              // Nettoyer tout le stockage
              sessionStorage.removeItem('authToken');
              localStorage.clear();
              
              alert('💔 Compte supprimé avec succès.\nAu revoir !');
              window.location.hash = '#home';
            } else {
              const error = await response.json();
              alert(`❌ Erreur: ${error.error}`);
            }
          } catch (error) {
            console.error('Erreur suppression compte:', error);
            alert('❌ Erreur lors de la suppression du compte');
          }
        } else {
          alert('❌ Pseudo incorrect. Suppression annulée.');
        }
      }
    }
  });

  // Bouton pour ouvrir le formulaire d'édition (design amélioré)
  const editFormBtn = document.createElement('button');
  editFormBtn.innerHTML = '<span style="font-size:1.2em;vertical-align:middle;">🖊️</span> <span style="font-weight:500;">Modifier mes infos</span>';
  editFormBtn.className = 'glass-button mb-4 px-6 py-2 rounded-lg shadow transition-all bg-gradient-to-r from-blue-500/30 to-blue-700/30 hover:from-blue-600/40 hover:to-blue-800/40 text-white flex items-center gap-2';
  container.prepend(editFormBtn);

  editFormBtn.addEventListener('click', () => {
    // Crée le formulaire d'édition inline avec design moderne
    const formHtml = `
      <form id="edit-profile-form" class="glass-morphism p-6 rounded-lg mb-4 flex flex-col gap-4 shadow-lg border border-blue-500/20 animate-fade-in">
        <div class="flex gap-4">
          <label class="flex-1">
            <span class="block mb-1 text-white/80">Pseudo</span>
            <input type="text" name="name" value="${user.name}" class="w-full px-3 py-2 rounded bg-gray-900/60 text-white border border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label class="flex-1">
            <span class="block mb-1 text-white/80">Email</span>
            <input type="email" name="email" value="${user.email}" class="w-full px-3 py-2 rounded bg-gray-900/60 text-white border border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
        </div>
        <div class="flex gap-4">
          <label class="flex-1">
            <span class="block mb-1 text-white/80">Identifiant</span>
            <input type="text" name="login" value="${user.login}" class="w-full px-3 py-2 rounded bg-gray-900/60 text-white border border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label class="flex-1">
            <span class="block mb-1 text-white/80">Mot de passe</span>
            <input type="password" name="password" placeholder="Nouveau mot de passe" class="w-full px-3 py-2 rounded bg-gray-900/60 text-white border border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
        </div>
        <div class="flex gap-4 mt-2">
          <button type="submit" class="glass-button flex-1 bg-gradient-to-r from-green-500/30 to-green-700/30 hover:from-green-600/40 hover:to-green-800/40 text-white font-semibold rounded-lg shadow transition-all py-2">✅ Valider</button>
          <button type="button" id="cancel-edit" class="glass-button flex-1 bg-gradient-to-r from-gray-500/30 to-gray-700/30 hover:from-gray-600/40 hover:to-gray-800/40 text-white font-semibold rounded-lg shadow transition-all py-2">❌ Annuler</button>
        </div>
      </form>
    `;
    container.insertAdjacentHTML('afterbegin', formHtml);
    editFormBtn.style.display = 'none';

    const form = container.querySelector('#edit-profile-form') as HTMLFormElement;
    const cancelBtn = container.querySelector('#cancel-edit') as HTMLButtonElement;
    cancelBtn.addEventListener('click', () => {
      form.remove();
      editFormBtn.style.display = '';
    });
    form.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const updates: any = {};
      for (const [key, value] of formData.entries()) {
        if (value && value !== (user as any)[key]) updates[key] = value;
      }
      if (Object.keys(updates).length === 0) {
        alert('Aucune modification détectée.');
        return;
      }
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        alert('Erreur: Session expirée');
        return;
      }
      try {
        const response = await fetch('http://localhost:3001/auth/profile', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates),
          credentials: 'include'
        });
        if (response.ok) {
          alert('✅ Profil modifié avec succès !');
          form.remove();
          editFormBtn.style.display = '';
          initProfilePage();
        } else {
          const error = await response.json();
          alert(`❌ Erreur: ${error.error}`);
        }
      } catch (error) {
        console.error('Erreur modification profil:', error);
        alert('❌ Erreur lors de la modification du profil');
      }
    };
  });
}

// Point d'entrée pour la page Profil
export async function initProfilePage() {
  const container = document.getElementById('profile');
  if (!container) {
    console.error('❌ Container profile non trouvé !');
    return;
  }
  
  // 🔄 Afficher un loading
  container.innerHTML = `
    <div class="glass-morphism p-8 rounded-lg text-center">
      <div class="text-2xl font-light text-white/90 mb-4">⏳ Chargement du profil...</div>
      <div class="text-white/60">Récupération des données depuis la base de données</div>
    </div>
  `;
  
  // 🗄️ Récupérer le profil depuis la BDD
  const user = await fetchUserFromDB();
  
  if (!user) {
    // Pas connecté ou session expirée
    container.innerHTML = `
      <div class="glass-morphism p-8 rounded-lg text-center">
        <div class="text-2xl font-light text-white/90 mb-4">🔒 Accès refusé</div>
        <div class="text-white/60 mb-6">Vous devez être connecté pour voir votre profil</div>
        <button onclick="window.location.hash='#login'" class="glass-button">
          Se connecter
        </button>
      </div>
    `;
    return;
  }

  console.log('✅ Profil récupéré depuis la BDD:', user);
  
  // Afficher le profil avec les données de la BDD
  renderProfile(container, user);
}

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
            <div class="flex gap-4">
              <button id="dm-button" class="glass-button">
                � DISCUTER
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

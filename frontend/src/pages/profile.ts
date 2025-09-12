/* eslint-disable no-undef */
// src/pages/profile.ts

interface UserProfile {
  avatarUrl: string;
  username: string;
  ranking: number;
  wins: number;
  losses: number;
  matches: number;
}

// Fonctions pour gérer le profil utilisateur
function getUserProfile(): Profile | null {
  const saved = localStorage.getItem('userProfile');
  return saved ? JSON.parse(saved) : null;
}

function saveUserProfile(profile: Profile): void {
  localStorage.setItem('userProfile', JSON.stringify(profile));
  // Émettre un événement pour que les autres pages soient notifiées
  window.dispatchEvent(new CustomEvent('profileUpdated', { detail: profile }));
}

function getDefaultProfile(): Profile {
  return {
    id: "user-" + Date.now(),
    displayName: "Joueur" + Math.floor(Math.random() * 1000),
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=" + Math.random(),
    rank: Math.floor(Math.random() * 100) + 1,
    wins: Math.floor(Math.random() * 50),
    losses: Math.floor(Math.random() * 30),
    totalMatches: 0,
    matchHistory: [],
    lastActivity: new Date().toISOString()
  };
}

// Profil de secours si l'API ne répond pas
const DEMO_PROFILE: UserProfile = {
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=User42',
  username: 'User42',
  ranking: 12,
  wins: 8,
  losses: 3,
  matches: 11,
};

// Récupère le profil depuis l'API ou renvoie le mode démo
async function fetchUserProfile(): Promise<UserProfile> {
  try {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return DEMO_PROFILE;
  }
}

// element du profil
function renderProfile(container: HTMLElement, user: Profile) {
  container.innerHTML = `
    <div class="glass-morphism p-8 rounded-lg">
      <!-- En-tête du profil -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-8">
          <img id="profile-avatar" src="${user.avatar}" alt="Avatar" class="w-32 h-32 rounded-full border-4 border-white/10 shadow-lg cursor-pointer hover:opacity-80"/>
          <div>
            <div class="flex items-center gap-4 mb-4">
              <h2 id="display-name" class="text-4xl font-light tracking-wider text-white/90">${user.displayName}</h2>
              <button id="edit-profile-btn" class="glass-button text-sm">
                ✏️ MODIFIER
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

      <!-- Modal d'édition (caché par défaut) -->
      <div id="edit-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center z-50">
        <div class="glass-morphism p-6 rounded-lg w-96">
          <h3 class="text-2xl font-light text-white/90 mb-6">Modifier le profil</h3>
          <form id="edit-profile-form">
            <div class="mb-4">
              <label class="block text-white/70 mb-2">Nom d'utilisateur</label>
              <input 
                type="text" 
                id="edit-username" 
                value="${user.displayName}"
                class="w-full p-3 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                maxlength="20"
                required
              />
            </div>
            <div class="mb-6">
              <label class="block text-white/70 mb-2">Avatar (URL)</label>
              <input 
                type="url" 
                id="edit-avatar" 
                value="${user.avatar}"
                class="w-full p-3 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                placeholder="https://exemple.com/mon-avatar.png"
              />
            </div>
            <div class="flex gap-3">
              <button type="submit" class="flex-1 glass-button">
                💾 SAUVEGARDER
              </button>
              <button type="button" id="cancel-edit" class="flex-1 glass-button bg-red-500/20 hover:bg-red-500/30">
                ❌ ANNULER
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="glass-morphism p-4 rounded text-center">
          <div class="text-2xl font-bold text-white/90">#${user.rank}</div>
          <div class="text-white/60 text-sm tracking-wider">RANG</div>
        </div>
        <div class="glass-morphism p-4 rounded text-center">
          <div class="text-2xl font-bold text-green-400">${user.wins}</div>
          <div class="text-white/60 text-sm tracking-wider">VICTOIRES</div>
        </div>
        <div class="glass-morphism p-4 rounded text-center">
          <div class="text-2xl font-bold text-red-400">${user.losses}</div>
          <div class="text-white/60 text-sm tracking-wider">DÉFAITES</div>
        </div>
      </div>

      <!-- Historique des matchs -->
      <div>
        <h3 class="text-xl font-light tracking-wider text-white/90 mb-4">DERNIERS MATCHS</h3>
        <div class="space-y-2">
          ${user.matchHistory.map(match => `
            <div class="glass-morphism p-4 rounded flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="text-xl ${match.result === 'win' ? 'text-green-400' : 'text-red-400'}">
                  ${match.result === 'win' ? '✓' : '×'}
                </div>
                <div>
                  <div class="text-white/90">vs ${match.opponent}</div>
                  <div class="text-white/60 text-sm">${match.score}</div>
                </div>
              </div>
              <div class="text-white/40 text-sm">${new Date(match.date).toLocaleDateString()}</div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;

  // Event listeners pour l'édition
  const editBtn = container.querySelector('#edit-profile-btn') as HTMLButtonElement;
  const modal = container.querySelector('#edit-modal') as HTMLDivElement;
  const form = container.querySelector('#edit-profile-form') as HTMLFormElement;
  const cancelBtn = container.querySelector('#cancel-edit') as HTMLButtonElement;
  const avatarImg = container.querySelector('#profile-avatar') as HTMLImageElement;
  const displayNameEl = container.querySelector('#display-name') as HTMLHeadingElement;

  // Ouvrir le modal d'édition
  editBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  });

  // Fermer le modal
  cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  });

  // Fermer en cliquant sur le fond
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  });

  // Sauvegarder les modifications
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameInput = container.querySelector('#edit-username') as HTMLInputElement;
    const avatarInput = container.querySelector('#edit-avatar') as HTMLInputElement;
    
    const newProfile = {
      ...user,
      displayName: usernameInput.value.trim() || user.displayName,
      avatar: avatarInput.value.trim() || user.avatar
    };
    
    // Sauvegarder dans localStorage
    saveUserProfile(newProfile);
    
    // Mettre à jour le pseudo sur le serveur WebSocket
    import('../socket.js').then(({ updateUsernameOnServer }) => {
      updateUsernameOnServer(newProfile.displayName);
    });
    
    // Mettre à jour l'affichage
    displayNameEl.textContent = newProfile.displayName;
    avatarImg.src = newProfile.avatar;
    
    // Fermer le modal
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    console.log('✅ Profil mis à jour:', newProfile);
  });

  // Event listeners existants
  container.querySelector('#dm-button')?.addEventListener('click', () => {
    window.location.hash = '#live-chat';
  });
  
  container.querySelector('#challenge-button')?.addEventListener('click', () => {
    window.location.hash = '#game-modes';
  });
}

type Profile = {
  id: string;
  displayName: string;
  avatar: string | null;
  rank: number;
  wins: number;
  losses: number;
  totalMatches: number;
  matchHistory: MatchHistory[];
  lastActivity: string;
};

type MatchHistory = {
  opponent: string;
  result: 'win' | 'loss';
  score: string;
  date: string;
};

// Point d'entrée pour la page Profil
export async function initProfilePage() {
  const container = document.getElementById('profile-container');
  if (!container) return;
  
  // Récupérer le profil sauvegardé ou créer un profil par défaut
  let userProfile = getUserProfile();
  if (!userProfile) {
    userProfile = getDefaultProfile();
    saveUserProfile(userProfile);
    console.log('🎭 Nouveau profil créé:', userProfile.displayName);
  }

  // Calculer les matchs totaux
  userProfile.totalMatches = userProfile.wins + userProfile.losses;

  // Afficher le profil
  renderProfile(container, userProfile);
}

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
          <img src="${user.avatar}" alt="Avatar" class="w-32 h-32 rounded-full border-4 border-white/10 shadow-lg"/>
          <div>
            <h2 class="text-4xl font-light tracking-wider text-white/90 mb-4">${user.displayName}</h2>
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

  // Event listeners
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
  
  // Profil de démonstration
  const mockProfile: Profile = {
    id: "demo-123",
    displayName: "CyberPong42",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberPong42",
    rank: 42,
    wins: 157,
    losses: 43,
    totalMatches: 200,
    matchHistory: [
      {
        opponent: "PongMaster",
        result: "win",
        score: "11-7",
        date: "2025-09-01"
      },
      {
        opponent: "PixelWarrior",
        result: "win",
        score: "11-5",
        date: "2025-08-31"
      },
      {
        opponent: "NeonSlayer",
        result: "win",
        score: "11-9",
        date: "2025-08-30"
      }
    ],
    lastActivity: "2025-09-01T12:00:00Z"
  };

  // affiche le profil
  renderProfile(container, mockProfile);
}

/* eslint-disable no-undef */
interface User {
  id: number;
  name: string;
  login: string;
  email: string;
  rank?: number;
  avatar?: string | null;
}

async function fetchUserFromDB(): Promise<User | null> {
  const token = sessionStorage.getItem('authToken');
  if (!token) return null;
  try {
    const response = await fetch('http://localhost:3001/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Session expirée');
    const result = await response.json();
    return result.user;
  } catch (error) {
    console.error('Erreur profil:', error);
    return null;
  }
}

function getDefaultAvatar(username: string): string {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
}

function renderProfile(container: HTMLElement, user: User) {
  const avatar = user.avatar || getDefaultAvatar(user.name);
  const rank = user.rank || 1;
  
  container.innerHTML = `
    <div class="glass-morphism p-6 rounded-lg max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-6">
          <img src="${avatar}" alt="Avatar" class="w-20 h-20 rounded-full border-2 border-blue-500/30"/>
          <div>
            <h1 class="text-3xl font-bold text-white mb-1">${user.name}</h1>
            <div class="text-white/60 text-sm">Rang #${rank}</div>
            <div class="text-white/50 text-xs">${user.login} • ${user.email}</div>
          </div>
        </div>
        <button id="logout-btn" class="glass-button px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-sm">
          🚪 Déconnexion
        </button>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <h3 class="text-lg font-semibold text-white/90 mb-3">📊 Stats</h3>
          <div class="grid grid-cols-3 gap-3">
            <div class="glass-morphism p-3 rounded text-center">
              <div class="text-xl font-bold text-yellow-400">#${rank}</div>
              <div class="text-white/60 text-xs">Rang</div>
            </div>
            <div class="glass-morphism p-3 rounded text-center">
              <div class="text-xl font-bold text-green-400">0</div>
              <div class="text-white/60 text-xs">Wins</div>
            </div>
            <div class="glass-morphism p-3 rounded text-center">
              <div class="text-xl font-bold text-red-400">0</div>
              <div class="text-white/60 text-xs">Loss</div>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-white/90 mb-3">⚙️ Actions</h3>
          <div class="space-y-2">
            <button id="edit-btn" class="w-full glass-button p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded">
              ✏️ Modifier Profil
            </button>
            <div class="grid grid-cols-2 gap-2">
              <button id="chat-btn" class="glass-button p-2 bg-green-500/20 hover:bg-green-500/30 text-sm rounded">💬 Chat</button>
              <button id="game-btn" class="glass-button p-2 bg-purple-500/20 hover:bg-purple-500/30 text-sm rounded">⚔️ Jouer</button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 pt-4 border-t border-white/10">
        <h3 class="text-lg font-semibold text-white/90 mb-3">🎮 Derniers Matchs</h3>
        <div class="text-center text-white/60 py-4">
          <p>Aucun match • <a href="#game-modes" class="text-blue-400">Commencer à jouer</a></p>
        </div>
      </div>
    </div>
  `;

  setupEvents(container, user);
}

function setupEvents(container: HTMLElement, user: User) {
  container.querySelector('#logout-btn')?.addEventListener('click', async () => {
    if (confirm('Déconnexion ?')) {
      sessionStorage.removeItem('authToken');
      window.location.hash = '#login';
    }
  });

  container.querySelector('#chat-btn')?.addEventListener('click', () => {
    window.location.hash = '#live-chat';
  });
  
  container.querySelector('#game-btn')?.addEventListener('click', () => {
    window.location.hash = '#game-modes';
  });

  const editBtn = container.querySelector('#edit-btn') as HTMLButtonElement;
  editBtn?.addEventListener('click', () => showEditForm(container, user, editBtn));
}

function showEditForm(container: HTMLElement, user: User, editBtn: HTMLButtonElement) {
  const formHtml = `
    <form id="edit-form" class="glass-morphism p-4 rounded-lg mb-4 space-y-3 border border-blue-500/20">
      <h4 class="text-lg font-semibold text-white mb-3">✏️ Modifier</h4>
      <div class="grid grid-cols-2 gap-3">
        <input type="text" name="name" value="${user.name}" placeholder="Pseudo" class="px-3 py-2 bg-gray-900/60 text-white border border-blue-500/30 rounded" />
        <input type="email" name="email" value="${user.email}" placeholder="Email" class="px-3 py-2 bg-gray-900/60 text-white border border-blue-500/30 rounded" />
        <input type="text" name="login" value="${user.login}" placeholder="Login" class="px-3 py-2 bg-gray-900/60 text-white border border-blue-500/30 rounded" />
        <input type="password" name="password" placeholder="Nouveau mot de passe" class="px-3 py-2 bg-gray-900/60 text-white border border-blue-500/30 rounded" />
      </div>
      <div class="flex gap-3">
        <button type="submit" class="flex-1 glass-button bg-green-500/20 py-2 rounded">✅ OK</button>
        <button type="button" id="cancel" class="flex-1 glass-button bg-gray-500/20 py-2 rounded">❌ Annuler</button>
        <button type="button" id="delete" class="glass-button bg-red-500/20 px-3 py-2 rounded">🗑️</button>
      </div>
    </form>
  `;
  
  container.insertAdjacentHTML('afterbegin', formHtml);
  editBtn.style.display = 'none';

  const form = container.querySelector('#edit-form') as HTMLFormElement;
  
  container.querySelector('#cancel')?.addEventListener('click', () => {
    form.remove();
    editBtn.style.display = '';
  });

  container.querySelector('#delete')?.addEventListener('click', async () => {
    if (!confirm('Supprimer le compte ?')) return;
    const typed = prompt(`Tapez "${user.name}" :`);
    if (typed !== user.name) return;
    
    const token = sessionStorage.getItem('authToken');
    if (!token) return;

    try {
      await fetch('http://localhost:3001/auth/profile', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      sessionStorage.clear();
      window.location.hash = '#home';
    } catch (error) {
      alert('Erreur suppression');
    }
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const updates: any = {};
    
    for (const [key, value] of formData.entries()) {
      if (value && value !== (user as any)[key]) updates[key] = value;
    }
    
    if (Object.keys(updates).length === 0) return;
    
    const token = sessionStorage.getItem('authToken');
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:3001/auth/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        form.remove();
        editBtn.style.display = '';
        initProfilePage();
      }
    } catch (error) {
      alert('Erreur modification');
    }
  };
}

export async function initProfilePage() {
  const container = document.getElementById('profile');
  if (!container) return;
  
  container.innerHTML = '<div class="glass-morphism p-8 rounded-lg text-center max-w-md mx-auto"><div class="text-xl text-white/90">⏳ Chargement...</div></div>';
  
  const user = await fetchUserFromDB();
  
  if (!user) {
    container.innerHTML = '<div class="glass-morphism p-8 rounded-lg text-center max-w-md mx-auto"><div class="text-xl text-white/90 mb-4">🔒 Accès refusé</div><button onclick="window.location.hash=\'#login\'" class="glass-button">Se connecter</button></div>';
    return;
  }

  renderProfile(container, user);
}
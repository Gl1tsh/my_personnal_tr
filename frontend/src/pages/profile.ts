interface User {
  id: number;
  name: string;
  login: string;
  email: string;
  rank?: number;
  avatar?: string | null;
}

// === UTILITAIRES ===
const $ = (selector: string): HTMLElement | null => document.querySelector(selector);
const $$ = (selector: string): NodeListOf<Element> => document.querySelectorAll(selector);

// === DONNÉES ===
let currentUser: User | null = null;

// === API ===
async function fetchUser(): Promise<User | null> {
  const token = sessionStorage.getItem('authToken');
  console.log('🔐 Token found:', token ? `${token.substring(0, 8)}...` : 'none');
  
  if (!token) return null;
  
  try {
    console.log('📡 Calling profile API...');
    const response = await fetch('http://localhost:3001/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('📡 Profile API response:', response.status, response.ok);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Profile data received:', result);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('❌ Profile API error:', error);
    return null;
  }
}

async function updateUser(data: Partial<User>): Promise<boolean> {
  const token = sessionStorage.getItem('authToken');
  if (!token) return false;
  
  try {
    const response = await fetch('http://localhost:3001/auth/profile', {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function deleteUser(): Promise<boolean> {
  const token = sessionStorage.getItem('authToken');
  if (!token) return false;
  
  try {
    const response = await fetch('http://localhost:3001/auth/profile', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  } catch {
    return false;
  }
}

// === ÉTATS DE L'UI ===
function showState(state: 'loading' | 'denied' | 'main' | 'edit'): void {
  $$('[data-state]').forEach(el => {
    el.classList.add('hidden');
  });
  
  const element = $(`[data-state="${state}"]`);
  if (element) {
    element.classList.remove('hidden');
  }
}

function populateFields(user: User): void {
  const avatar = user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`;
  const rank = user.rank || 1;
  
  const fields = {
    avatar: avatar,
    name: user.name,
    rank: `Rang #${rank}`,
    info: `${user.login}  ${user.email}`,
    'stat-rank': `#${rank}`,
    'edit-name': user.name,
    'edit-email': user.email,
    'edit-login': user.login
  };
  
  Object.entries(fields).forEach(([field, value]) => {
    const el = $(`[data-field="${field}"]`);
    if (!el) return;
    
    if (el.tagName === 'IMG') (el as HTMLImageElement).src = value;
    else if (el.tagName === 'INPUT') (el as HTMLInputElement).value = value;
    else el.textContent = value;
  });
}

// === ACTIONS ===
const actions = {
  login: () => {
    window.location.hash = '#login';
  },
  logout: async () => {
    if (confirm('Déconnexion ?')) {
      sessionStorage.removeItem('authToken');
      window.location.hash = '#login';
    }
  },
  chat: () => window.location.hash = '#live-chat',
  game: () => window.location.hash = '#game-modes',
  edit: () => showState('edit'),
  cancel: () => showState('main'),
  delete: async () => {
    if (!currentUser || !confirm('Supprimer le compte ?')) return;
    
    const typed = prompt(`Tapez "${currentUser.name}" :`);
    if (typed !== currentUser.name) return;
    
    if (await deleteUser()) {
      sessionStorage.clear();
      window.location.hash = '#home';
    } else {
      alert('Erreur suppression');
    }
  }
};

// === ÉVÉNEMENTS ===
function setupEvents(): void {
  // Actions sur les boutons
  $$('[data-action]').forEach(el => {
    const action = el.getAttribute('data-action') as keyof typeof actions;
    if (actions[action]) {
      el.addEventListener('click', actions[action]);
    }
  });
  
  // Formulaire d'édition
  const form = $('[data-state="edit"]') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const updates: Record<string, string> = {};
    
    // Collecte uniquement les champs modifiés
    formData.forEach((value, key) => {
      if (value && currentUser && value !== (currentUser as any)[key]) {
        updates[key] = value.toString();
      }
    });
    
    if (Object.keys(updates).length === 0) return;
    
    if (await updateUser(updates)) {
      await initProfilePage(); // Recharger
    } else {
      alert('Erreur modification');
    }
  });
}

// === INITIALISATION ===
export async function initProfilePage(): Promise<void> {
  console.log('👤 Initializing Profile page...');
  showState('loading');
  
  currentUser = await fetchUser();
  console.log('👤 Fetched user:', currentUser);
  
  if (!currentUser) {
    console.log('❌ No user found, showing access denied');
    showState('denied');
    // Attache explicitement le handler du bouton Login si présent
    const loginBtn = document.querySelector('[data-state="denied"] [data-action="login"]');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        window.location.hash = '#login';
      });
    }
    return;
  }
  
  populateFields(currentUser);
  showState('main');
  setupEvents();
  console.log('✅ Profile page initialized successfully');
}
interface User {
  id: number;
  name: string;
  login: string;
  email: string;
  avatar?: string | null;
}

// === UTILITAIRES ===
const $ = (selector: string): HTMLElement | null => document.querySelector(selector);
const $$ = (selector: string): NodeListOf<Element> => document.querySelectorAll(selector);

// === DONNÉES ===
let currentUser: User | null = null;
let isOwnProfile: boolean = true;

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

async function fetchAllUsers(): Promise<User[]> {
  try {
    const response = await fetch('http://localhost:3001/users');
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

async function updateUser(data: Partial<User>): Promise<{ success: boolean; error?: string }> {
  const token = sessionStorage.getItem('authToken');
  if (!token) return { success: false, error: 'Token manquant' };
  
  try {
    const response = await fetch('http://localhost:3001/auth/profile', {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || 'Erreur modification' };
    }
  } catch {
    return { success: false, error: 'Erreur réseau' };
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
  
  const fields = {
    avatar: avatar,
    name: user.name,
    info: `${user.login}  ${user.email}`,
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
    
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Saving...';
    }
    
    const formData = new FormData(form);
    const updates: Record<string, string> = {};
    
    // Collecte uniquement les champs modifiés
    formData.forEach((value, key) => {
      if (value && currentUser && value !== (currentUser as any)[key]) {
        updates[key] = value.toString();
      }
    });
    
    if (Object.keys(updates).length === 0) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '✅ Save';
      }
      return;
    }
    
    const result = await updateUser(updates);
    if (result.success) {
      await initProfilePage(); // Recharger
    } else {
      alert(result.error || 'Erreur modification');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '✅ Save';
      }
    }
  });
}

// === INITIALISATION ===
export async function initProfilePage(): Promise<void> {
  console.log('👤 Initializing Profile page...');
  showState('loading');
  
  const dmTarget = localStorage.getItem('dmTarget');
  const ownUser = await fetchUser();
  
  if (dmTarget) {
    localStorage.removeItem('dmTarget');
    // Fetch all users and find the one with matching name
    const allUsers = await fetchAllUsers();
    const targetUser = allUsers.find(u => u.name === dmTarget);
    if (targetUser) {
      currentUser = targetUser;
      isOwnProfile = ownUser ? targetUser.id === ownUser.id : false;
    } else {
      // Fallback to own profile
      currentUser = ownUser;
      isOwnProfile = true;
    }
  } else {
    currentUser = ownUser;
    isOwnProfile = true;
  }
  
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
  if (!isOwnProfile) {
    // Hide edit and delete buttons and info for other users' profiles
    const editBtn = $('[data-action="edit"]') as HTMLElement;
    const deleteBtn = $('[data-action="delete"]') as HTMLElement;
    const infoEl = $('[data-field="info"]') as HTMLElement;
    const logoutBtn = $('[data-action="logout"]') as HTMLElement;
    if (editBtn) editBtn.style.display = 'none';
    if (deleteBtn) deleteBtn.style.display = 'none';
    if (infoEl) infoEl.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  } else {
    // Ensure they are visible for own profile
    const editBtn = $('[data-action="edit"]') as HTMLElement;
    const deleteBtn = $('[data-action="delete"]') as HTMLElement;
    const infoEl = $('[data-field="info"]') as HTMLElement;
    const logoutBtn = $('[data-action="logout"]') as HTMLElement;
    if (editBtn) editBtn.style.display = 'block';
    if (deleteBtn) deleteBtn.style.display = 'block';
    if (infoEl) infoEl.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'block';
  }
  setupEvents();
  console.log('✅ Profile page initialized successfully');
}
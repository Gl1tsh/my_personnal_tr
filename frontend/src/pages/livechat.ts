/* eslint-disable no-undef */
import { socket, sendMessageToBackend, updateUsernameOnServer } from '../socket.js';
import { setGameMode } from '../game/gameState.js';

type Message = { from: string; text: string; originalFrom?: string };
type History = { [user: string]: Message[] };

// Fonction pour récupérer le profil utilisateur via l'API centralisée
async function getUserProfile() {
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

    if (!response.ok) return null;
    
    const result = await response.json();
    return result.user;
  } catch (error) {
    console.error(' Erreur récupération profil chat:', error);
    return null;
  }
}

const history: History = {};

export async function initChatPage() {
  // Suppression du bouton général : plus de canal général
  const dmList = document.getElementById('dm-list')! as HTMLDivElement;
  const userList = document.getElementById('user-list')! as HTMLDivElement;
  const titleElem = document.getElementById('chat-title')! as HTMLSpanElement;
  const blockBtn = document.getElementById('block-btn')! as HTMLButtonElement;
  const inviteBtn = document.getElementById('invite-btn')! as HTMLButtonElement;
  const chatbox = document.getElementById('chat_messages')! as HTMLDivElement;
  const form = document.getElementById('chat_form')! as HTMLFormElement;
  const input = document.getElementById('chat_input')! as HTMLInputElement;

  let current = null as string | null;

  // Récupérer le nom d'utilisateur depuis l'API centralisée
  const userProfile = await getUserProfile();
  let username: string = userProfile ? userProfile.name : `User_${socket.id?.substring(0, 6) || 'Unknown'}`;
  
  console.log(' Utilisateur chat:', username);

  //  Forcer la mise à jour du pseudo sur le socket si on est connecté
  if (userProfile && userProfile.name) {
    updateUsernameOnServer(userProfile.name);
    console.log(' Mise à jour forcée du pseudo sur le socket:', userProfile.name);
  }

  const blockedUsers = new Set<string>(JSON.parse(localStorage.getItem('blockedUsers') || '[]'));
  const saveBlocked = () => {
    localStorage.setItem('blockedUsers', JSON.stringify([...blockedUsers]));
  };

  window.addEventListener('user_list', (event: any) => {
    // Debug: print our socket id and all user ids
    console.log('[DEBUG] My socket.id:', socket.id);
    console.log('[DEBUG] User list:', event.detail.map((u: any) => u.id));

    // Trouver notre pseudo réel dans la liste
    const ourUserInfo = event.detail.find((user: any) => user.id === socket.id);
    if (ourUserInfo && ourUserInfo.username) {
      username = ourUserInfo.username;
      console.log(' Pseudo mis à jour depuis le serveur:', username);
    }

    // Mettre à jour la liste des utilisateurs dans l'interface
    userList.innerHTML = '';
    for (const userInfo of event.detail) {
      // userInfo contient maintenant {id: string, username: string}
      // Ne pas afficher notre propre socket ID dans la liste
      if (
        userInfo.id === socket.id ||
        userInfo.username === username ||
        (typeof userInfo.username === 'string' && userInfo.username.startsWith('BonjourPage'))
      ) continue;

      const ul = document.createElement('div');
      ul.className = 'p-2 hover:bg-gray-700 cursor-pointer rounded';
      ul.textContent = userInfo.username;

      const chatButton = document.createElement('span');
      chatButton.textContent = " 💬";
      chatButton.className = 'ml-2 text-blue-400 hover:text-blue-300 cursor-pointer';
      ul.appendChild(chatButton);

      chatButton.onclick = (e) => {
        e.stopPropagation();
        createDmTab(userInfo.id, userInfo.username);
        switchTo(userInfo.id);
      };

      ul.onclick = () => {
        localStorage.setItem('dmTarget', userInfo.username);
        window.location.hash = '#profile';
      };
      userList.appendChild(ul);
    }
  });

  blockBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (typeof current === 'string') {
      if (blockedUsers.has(current)) {
        blockedUsers.delete(current);
        console.log(`✅ Débloqué : ${current}`);
      } else {
        blockedUsers.add(current);
        console.log(`🚫 Bloqué : ${current}`);
      }
      saveBlocked();
      render();
    }
  });

  inviteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log(`[DEBUG] inviteBtn click — invite -> ${current}`);
    // Send a special invite message
    const inviteText = `🎮 Wants to play Pong! Click here to join: [JOIN_GAME:${socket.id}]`;
    sendMessageToBackend(current, inviteText);
  });

  form.onsubmit = (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text)
      return;
    sendMessageToBackend(current, text);
    
    // Ne pas ajouter notre message ici - laisser le serveur nous le renvoyer
    // avec le bon pseudo pour éviter les problèmes de synchronisation
    input.value = '';
  };

  window.addEventListener('message_backend_to_frontend', (event: any) => {
    const from = event.detail.from;
    const to = event.detail.to;
    const text = event.detail.text;
    const originalFrom = event.detail.originalFrom;
    let target;

    if (to == '') {
      // Message général
      target = '';
    }
    else {
      // Message privé - déterminer avec qui on parle
      if (originalFrom === socket.id) {
        // C'est notre message, l'onglet DM doit être avec le destinataire
        createDmTab(to);
        target = to;
      } else {
        // C'est le message de quelqu'un d'autre, l'onglet DM est avec l'expéditeur
        createDmTab(originalFrom, from);
        target = originalFrom;
      }
    }

    if (!history[target]) {
      history[target] = [];
    }

    history[target].push({ from, text, originalFrom });
    if (target === current)
      render();
  });



  // ATTENTION : A REVOIR
  const target = localStorage.getItem('dmTarget');
  if (target) {
    localStorage.removeItem('dmTarget');
    if (![...dmList.children].some((c) => c.textContent === target)) {
      const tab = document.createElement('div');
      tab.className = 'p-2 hover:bg-gray-700 cursor-pointer rounded';
      tab.textContent = target;
      tab.onclick = () => switchTo(target);
      dmList.appendChild(tab);
    }
    switchTo(target);
  } else {
    // Si aucun DM, on ne sélectionne rien
    render();
  }

  // Stocke la dernière liste d'utilisateurs reçue
  let lastUserList: Array<{id: string, username: string}> = [];

  window.addEventListener('user_list', (event: any) => {
    lastUserList = event.detail;
    // ...existing code...
  });

  function getUsernameById(id: string): string {
    const user = lastUserList.find(u => u.id === id);
    return user ? user.username : id;
  }

  function createDmTab(id: string, displayName?: string) {
    if (dmList.querySelector(`#dm-tab-${id}`)) return;
    const tab = document.createElement('div');
    tab.className = 'p-2 hover:bg-gray-700 cursor-pointer rounded';
    tab.id = `dm-tab-${id}`;
    tab.textContent = displayName || getUsernameById(id);
    tab.onclick = () => switchTo(id);
    dmList.appendChild(tab);
    history[id] = [];
  }

  function switchTo(name: string) {
    current = name;
    render();
  }

  function render() {
    // Affiche le nom du DM ou rien
    titleElem.textContent = current ? `@ ${getUsernameById(current)}` : '';

    if (!current) {
      blockBtn.style.display = 'none';
      inviteBtn.style.display = 'none';
      chatbox.innerHTML = '<div class="text-gray-400 text-center">Sélectionnez un utilisateur pour démarrer une conversation.</div>';
      return;
    }

    blockBtn.style.display = 'inline-block';
    blockBtn.textContent = blockedUsers.has(current) ? 'Unblock user' : 'Block user';
  inviteBtn.style.display = (typeof current === 'string' && blockedUsers.has(current)) ? 'none' : 'inline-block';

    chatbox.innerHTML = '';
    for (const message of (history[current] || [])) {
      const originalFrom = (message as any).originalFrom || message.from;
      if (blockedUsers.has(originalFrom))
        continue;
      const element = document.createElement('div');
      element.className =
        message.from === username
          ? 'self-end bg-blue-500 text-white p-2 rounded'
          : 'self-start bg-gray-800 text-gray-100 p-2 rounded';
      // Check for invite
      if (message.text.includes('[JOIN_GAME:')) {
        const joinMatch = message.text.match(/\[JOIN_GAME:([^\]]+)\]/);
        if (joinMatch) {
          const hostId = joinMatch[1];
          const textBefore = message.text.replace(/\[JOIN_GAME:[^\]]+\]/, '');
          element.innerHTML = `<strong>${message.from}:</strong> ${textBefore}<button class=\"join-game-btn bg-green-500 text-white px-2 py-1 rounded ml-2\" data-host=\"${hostId}\">Join Game</button>`;
        } else {
          element.innerHTML = `<strong>${message.from}:</strong> ${message.text}`;
        }
      } else {
        element.innerHTML = `<strong>${message.from}:</strong> ${message.text}`;
      }
      chatbox.appendChild(element);
    }
    // Add event listeners for join buttons
    (chatbox.querySelectorAll('.join-game-btn') as NodeListOf<HTMLButtonElement>).forEach((btn) => {
      btn.addEventListener('click', (e: Event) => {
        const hostId = (e.target as HTMLElement).getAttribute('data-host');
        if (hostId) {
          setGameMode('1v1-remote');
          localStorage.setItem('gameHost', hostId);
          window.location.hash = '#game';
        }
      });
    });
    chatbox.scrollTop = chatbox.scrollHeight;

    // Plus de bouton général à colorer
    for (const child of dmList.children) {
      child.classList.toggle('bg-gray-700', child.textContent === current);
    }
  }
}

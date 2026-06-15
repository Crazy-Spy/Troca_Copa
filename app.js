import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDkItwRQ3oAT2MRtsXnOZcaAE6R2N9hzeM",
    authDomain: "trocacopa-e1071.firebaseapp.com",
    projectId: "trocacopa-e1071",
    storageBucket: "trocacopa-e1071.firebasestorage.app",
    messagingSenderId: "307184290619",
    appId: "1:307184290619:web:309242c152b127cae6c51e",
    measurementId: "G-8WN219YCZ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elements
const inputSection = document.getElementById('input-section');
const matchesSection = document.getElementById('matches-section');
const adminSection = document.getElementById('admin-section');
const btnSave = document.getElementById('btn-save');
const btnBack = document.getElementById('btn-back');
const btnAdminNav = document.getElementById('btn-admin-nav');
const btnAdminBack = document.getElementById('btn-admin-back');
const usernameInput = document.getElementById('username');
const predioInput = document.getElementById('predio');
const andarInput = document.getElementById('andar');
const stickersFaltantes = document.getElementById('stickers-faltantes');
const stickersRepetidas = document.getElementById('stickers-repetidas');
const statusMessage = document.getElementById('status-message');
const matchesContainer = document.getElementById('matches-container');
const adminUsersContainer = document.getElementById('admin-users-container');

// Event Listeners
btnSave.addEventListener('click', handleSaveAndMatch);
btnBack.addEventListener('click', showInputSection);
btnAdminNav.addEventListener('click', showAdminSection);
btnAdminBack.addEventListener('click', showInputSection);

// Initialization
document.addEventListener('DOMContentLoaded', initializeAppOnLoad);

async function initializeAppOnLoad() {
    const savedUser = localStorage.getItem('tinderStickersUser');
    if (savedUser) {
        usernameInput.value = savedUser;

        btnSave.disabled = true;
        btnSave.textContent = "Carregando seus dados...";

        try {
            const docId = savedUser.replace(/\//g, '_');
            const docRef = doc(db, "users", docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.predio) {
                    predioInput.value = data.predio;
                }
                if (data.andar) {
                    andarInput.value = data.andar;
                }
                if (data.rawFaltantes) {
                    stickersFaltantes.value = data.rawFaltantes;
                }
                if (data.rawRepetidas) {
                    stickersRepetidas.value = data.rawRepetidas;
                }
                // Try to load old data format if it exists
                if (data.rawText && !data.rawFaltantes && !data.rawRepetidas) {
                     stickersRepetidas.value = data.rawText;
                }
                showSuccess("Bem-vindo de volta! Buscando matches...");
                await calculateAndShowMatches(data);
            }
        } catch (error) {
            console.error("Error fetching user data on load: ", error);
        } finally {
            btnSave.disabled = false;
            btnSave.textContent = "Salvar e Buscar Matches";
        }
    }
}

async function handleSaveAndMatch() {
    const username = usernameInput.value.trim();
    const predio = predioInput.value;
    const andar = andarInput.value.trim();
    const textFaltantes = stickersFaltantes.value.trim();
    const textRepetidas = stickersRepetidas.value.trim();

    if (!username) {
        showError("Por favor, insira seu nome.");
        return;
    }
    if (!andar) {
        showError("Por favor, informe o seu andar.");
        return;
    }
    if (!textFaltantes && !textRepetidas) {
        showError("Por favor, preencha pelo menos uma das listas de figurinhas.");
        return;
    }

    btnSave.disabled = true;
    btnSave.textContent = "Processando...";
    statusMessage.className = "hidden";

    try {
        // 1. Parse text
        const parsedData = window.parseStickersText(textRepetidas, textFaltantes);

        if (parsedData.repetidas.length === 0 && parsedData.faltantes.length === 0) {
            showError("Não conseguimos encontrar figurinhas válidas no texto.");
            btnSave.disabled = false;
            btnSave.textContent = "Salvar e Buscar Matches";
            return;
        }

        const userData = {
            name: username,
            predio: predio,
            andar: andar,
            repetidas: parsedData.repetidas,
            faltantes: parsedData.faltantes,
            rawFaltantes: textFaltantes,
            rawRepetidas: textRepetidas,
            lastUpdated: new Date().toISOString()
        };

        // Save username to localStorage
        localStorage.setItem('tinderStickersUser', username);

        // 2. Save to Firestore
        // Use the sanitized username as the document ID so it overwrites on update, avoiding slashes
        const docId = username.replace(/\//g, '_');
        const userDocRef = doc(db, "users", docId);
        await setDoc(userDocRef, userData);

        showSuccess("Listas salvas com sucesso!");

        // 3. Fetch all users and calculate matches
        await calculateAndShowMatches(userData);

    } catch (error) {
        console.error("Error saving or fetching data: ", error);
        showError("Erro ao processar dados. Verifique a conexão.");
    } finally {
        btnSave.disabled = false;
        btnSave.textContent = "Salvar e Buscar Matches";
    }
}

async function calculateAndShowMatches(currentUserData) {
    matchesContainer.innerHTML = "<p>Buscando matches...</p>";
    showMatchesSection();

    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const allUsers = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.name !== currentUserData.name) {
                allUsers.push(data);
            }
        });

        const matches = [];

        for (const otherUser of allUsers) {
            // Find what I need that they have
            const iNeedTheyHave = currentUserData.faltantes.filter(sticker => otherUser.repetidas.includes(sticker));

            // Find what they need that I have
            const theyNeedIHave = currentUserData.repetidas.filter(sticker => otherUser.faltantes.includes(sticker));

            if (iNeedTheyHave.length > 0 || theyNeedIHave.length > 0) {
                matches.push({
                    otherUserName: otherUser.name,
                    predio: otherUser.predio || 'N/A',
                    andar: otherUser.andar || 'N/A',
                    iNeedTheyHave: iNeedTheyHave,
                    theyNeedIHave: theyNeedIHave
                });
            }
        }

        renderMatches(currentUserData.name, matches);

    } catch (error) {
        console.error("Error calculating matches: ", error);
        matchesContainer.innerHTML = "<p class='error'>Erro ao buscar matches.</p>";
    }
}

function renderMatches(currentUserName, matches) {
    matchesContainer.innerHTML = "";

    if (matches.length === 0) {
        matchesContainer.innerHTML = "<p>Nenhum match encontrado no momento. Tente novamente mais tarde!</p>";
        return;
    }

    // Sort matches: best matches first (sum of both arrays length)
    matches.sort((a, b) => {
        const scoreA = a.iNeedTheyHave.length + a.theyNeedIHave.length;
        const scoreB = b.iNeedTheyHave.length + b.theyNeedIHave.length;
        return scoreB - scoreA;
    });

    matches.forEach(match => {
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';

        const iHaveCount = match.theyNeedIHave.length;
        const theyHaveCount = match.iNeedTheyHave.length;

        const safeCurrentUserName = escapeHTML(currentUserName);
        const safeOtherUserName = escapeHTML(match.otherUserName);
        const safeLocation = escapeHTML(`${match.predio} - Andar ${match.andar}`);

        matchCard.innerHTML = `
            <div class="match-header">
                <span>${safeCurrentUserName} 🤝 ${safeOtherUserName} <small style="font-weight: normal; color: #666; font-size: 0.85rem;">(${safeLocation})</small></span>
            </div>
            <div class="match-details">
                <div class="match-side give">
                    <p><strong>Você tem ${iHaveCount} que ${safeOtherUserName} quer:</strong></p>
                    <p class="stickers-list">${escapeHTML(match.theyNeedIHave.join(', ')) || 'Nenhuma'}</p>
                </div>
                <div class="match-side receive">
                    <p><strong>${safeOtherUserName} tem ${theyHaveCount} que você quer:</strong></p>
                    <p class="stickers-list">${escapeHTML(match.iNeedTheyHave.join(', ')) || 'Nenhuma'}</p>
                </div>
            </div>
        `;
        matchesContainer.appendChild(matchCard);
    });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Admin Logic
async function loadAdminUsers() {
    adminUsersContainer.innerHTML = "<p>Carregando usuários...</p>";
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        adminUsersContainer.innerHTML = "";

        if (querySnapshot.empty) {
            adminUsersContainer.innerHTML = "<p>Nenhum usuário cadastrado.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const docId = doc.id;

            const row = document.createElement('div');
            row.className = 'admin-user-row';

            let dateStr = "Desconhecida";
            if (data.lastUpdated) {
                const d = new Date(data.lastUpdated);
                dateStr = d.toLocaleDateString() + " " + d.toLocaleTimeString();
            }

            const safePredio = escapeHTML(data.predio || 'N/A');
            const safeAndar = escapeHTML(data.andar || 'N/A');

            row.innerHTML = `
                <div class="admin-user-info">
                    <span class="admin-user-name">${escapeHTML(data.name || 'Sem nome')} <small style="font-weight: normal; color: #666; font-size: 0.85rem;">(${safePredio} - Andar ${safeAndar})</small></span>
                    <span class="admin-user-date">Atualizado em: ${dateStr}</span>
                </div>
                <button class="btn-delete" data-id="${escapeHTML(docId)}">Deletar</button>
            `;
            adminUsersContainer.appendChild(row);
        });

        // Attach delete events
        const deleteButtons = adminUsersContainer.querySelectorAll('.btn-delete');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const idToDelete = e.target.getAttribute('data-id');
                if (confirm(`Tem certeza que deseja deletar o usuário ${idToDelete}?`)) {
                    e.target.disabled = true;
                    e.target.textContent = "Deletando...";
                    try {
                        await deleteDoc(doc(db, "users", idToDelete));
                        loadAdminUsers(); // Refresh
                    } catch (err) {
                        console.error("Error deleting doc: ", err);
                        alert("Erro ao deletar.");
                        e.target.disabled = false;
                        e.target.textContent = "Deletar";
                    }
                }
            });
        });

    } catch (error) {
        console.error("Error loading admin users: ", error);
        adminUsersContainer.innerHTML = "<p class='error'>Erro ao carregar usuários.</p>";
    }
}

function showInputSection() {
    inputSection.classList.remove('hidden');
    matchesSection.classList.add('hidden');
    adminSection.classList.add('hidden');
}

function showMatchesSection() {
    inputSection.classList.add('hidden');
    matchesSection.classList.remove('hidden');
    adminSection.classList.add('hidden');
}

function showAdminSection() {
    inputSection.classList.add('hidden');
    matchesSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
    loadAdminUsers();
}

function showError(msg) {
    statusMessage.textContent = msg;
    statusMessage.className = 'error';
}

function showSuccess(msg) {
    statusMessage.textContent = msg;
    statusMessage.className = 'success';
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

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
const btnSave = document.getElementById('btn-save');
const btnBack = document.getElementById('btn-back');
const usernameInput = document.getElementById('username');
const stickersText = document.getElementById('stickers-text');
const statusMessage = document.getElementById('status-message');
const matchesContainer = document.getElementById('matches-container');

// Event Listeners
btnSave.addEventListener('click', handleSaveAndMatch);
btnBack.addEventListener('click', showInputSection);

async function handleSaveAndMatch() {
    const username = usernameInput.value.trim();
    const text = stickersText.value.trim();

    if (!username) {
        showError("Por favor, insira seu nome.");
        return;
    }
    if (!text) {
        showError("Por favor, cole as listas de figurinhas.");
        return;
    }

    btnSave.disabled = true;
    btnSave.textContent = "Processando...";
    statusMessage.className = "hidden";

    try {
        // 1. Parse text
        const parsedData = window.parseStickersText(text);

        if (parsedData.repetidas.length === 0 && parsedData.faltantes.length === 0) {
            showError("Não conseguimos encontrar figurinhas no texto. Verifique o formato.");
            btnSave.disabled = false;
            btnSave.textContent = "Salvar e Buscar Matches";
            return;
        }

        const userData = {
            name: username,
            repetidas: parsedData.repetidas,
            faltantes: parsedData.faltantes,
            lastUpdated: new Date().toISOString()
        };

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

        matchCard.innerHTML = `
            <div class="match-header">
                <span>${safeCurrentUserName} 🤝 ${safeOtherUserName}</span>
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

function showInputSection() {
    inputSection.classList.remove('hidden');
    matchesSection.classList.add('hidden');
}

function showMatchesSection() {
    inputSection.classList.add('hidden');
    matchesSection.classList.remove('hidden');
}

function showError(msg) {
    statusMessage.textContent = msg;
    statusMessage.className = 'error';
}

function showSuccess(msg) {
    statusMessage.textContent = msg;
    statusMessage.className = 'success';
}

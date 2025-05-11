// Data Pengguna
let user = {
    name: "Pengguna Baru",
    email: "",
    balance: 0,
    totalEarned: 0,
    gamesPlayed: 0,
    friendsInvited: 0,
    referralCode: generateReferralCode(),
    lastFreePlay: null,
    completedMissions: {
        freePlay: false,
        inviteFriends: 0,
        play3Games: 0
    },
    gameStats: {},
    withdrawHistory: []
};

// Data Leaderboard (simulasi)
let leaderboard = [
    { name: "Player1", balance: 125000 },
    { name: "Player2", balance: 98000 },
    { name: "Player3", balance: 87500 },
    { name: "Player4", balance: 76500 },
    { name: "Player5", balance: 65400 },
    { name: "Player6", balance: 54300 },
    { name: "Player7", balance: 43200 },
    { name: "Player8", balance: 32100 },
    { name: "Player9", balance: 21000 },
    { name: "Player10", balance: 10500 }
];

// Data Games
const games = {
    "number-guess": {
        name: "Tebak Angka",
        reward: 500,
        description: "Tebak angka antara 1-100 untuk menang Rp500",
        play: playNumberGuess
    },
    "math-quiz": {
        name: "Kuis Matematika",
        reward: 1000,
        description: "Jawab 5 soal matematika dalam 30 detik untuk Rp1000",
        play: playMathQuiz
    },
    "memory-game": {
        name: "Game Memori",
        reward: 800,
        description: "Temukan pasangan kartu untuk menang Rp800",
        play: playMemoryGame
    }
};

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    updateUI();
    setupEventListeners();
    checkFreePlayAvailability();
});

// Fungsi untuk memuat data pengguna dari localStorage
function loadUserData() {
    const savedUser = localStorage.getItem('moneyEarnUser');
    if (savedUser) {
        user = JSON.parse(savedUser);
    }
}

// Fungsi untuk menyimpan data pengguna ke localStorage
function saveUserData() {
    localStorage.setItem('moneyEarnUser', JSON.stringify(user));
}

// Fungsi untuk memperbarui UI
function updateUI() {
    // Update saldo
    document.getElementById('user-balance').textContent = formatCurrency(user.balance);
    document.getElementById('withdraw-balance').textContent = formatCurrency(user.balance);
    
    // Update total penghasilan
    document.getElementById('total-earned').textContent = formatCurrency(user.totalEarned);
    document.getElementById('games-played').textContent = user.gamesPlayed;
    document.getElementById('friends-invited').textContent = user.friendsInvited;
    
    // Update profil
    document.getElementById('profile-name').value = user.name;
    document.getElementById('profile-email').value = user.email;
    document.getElementById('referral-code').value = user.referralCode;
    
    // Update leaderboard
    updateLeaderboard();
    
    // Update riwayat penarikan
    updateWithdrawHistory();
    
    // Update progress misi
    updateMissionProgress();
}

// Format mata uang
function formatCurrency(amount) {
    return 'Rp' + amount.toLocaleString('id-ID');
}

// Generate kode referral acak
function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Setup event listeners
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const tabId = this.getAttribute('data-tab') + '-tab';
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Tombol main game
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const gameId = this.getAttribute('data-game');
            openGameModal(gameId);
        });
    });
    
    // Tombol profil
    document.getElementById('profile-btn').addEventListener('click', openProfileModal);
    
    // Tombol simpan profil
    document.getElementById('save-profile').addEventListener('click', saveProfile);
    
    // Tombol salin referral
    document.getElementById('copy-referral').addEventListener('click', copyReferralCode);
    
    // Tombol bagikan referral
    document.getElementById('share-btn').addEventListener('click', shareReferral);
    
    // Tombol social share
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const platform = this.classList.contains('whatsapp') ? 'whatsapp' : 
                            this.classList.contains('facebook') ? 'facebook' : 'twitter';
            shareOnSocialMedia(platform);
        });
    });
    
    // Tombol tutup modal
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Tombol ajukan penarikan
    document.getElementById('withdraw-btn').addEventListener('click', submitWithdrawal);
    
    // Tombol klaim misi
    document.querySelectorAll('.claim-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const missionId = this.getAttribute('data-mission');
            claimMissionReward(missionId);
        });
    });
    
    // Tombol undang teman
    document.querySelector('.invite-btn').addEventListener('click', openReferralModal);
}

// Buka modal game
function openGameModal(gameId) {
    const game = games[gameId];
    if (!game) return;
    
    const modal = document.getElementById('game-modal');
    const gameContainer = document.getElementById('game-container');
    
    // Cek apakah game gratis tersedia
    const isFreePlayAvailable = isFreePlayAvailableForGame(gameId);
    
    // Jika bukan free play, tampilkan konfirmasi
    if (!isFreePlayAvailable) {
        if (!confirm(`Mainkan ${game.name} untuk mendapatkan ${formatCurrency(game.reward)}?`)) {
            return;
        }
    }
    
    // Kosongkan container game
    gameContainer.innerHTML = '';
    
    // Buat elemen game
    gameContainer.appendChild(game.play());
    
    // Tampilkan modal
    modal.style.display = 'block';
    
    // Jika free play, tandai sebagai sudah dimainkan
    if (isFreePlayAvailable) {
        user.lastFreePlay = new Date().toISOString().split('T')[0];
        saveUserData();
        checkFreePlayAvailability();
    }
}

// Tutup modal
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Buka modal profil
function openProfileModal() {
    document.getElementById('profile-modal').style.display = 'block';
}

// Buka modal referral
function openReferralModal() {
    document.getElementById('referral-modal').style.display = 'block';
}

// Simpan profil
function saveProfile() {
    user.name = document.getElementById('profile-name').value;
    user.email = document.getElementById('profile-email').value;
    saveUserData();
    updateUI();
    alert('Profil berhasil disimpan!');
    closeModal();
}

// Salin kode referral
function copyReferralCode() {
    const referralInput = document.getElementById('referral-code');
    referralInput.select();
    document.execCommand('copy');
    alert('Kode referral berhasil disalin!');
}

// Bagikan referral
function shareReferral() {
    const referralInput = document.getElementById('share-referral');
    referralInput.select();
    document.execCommand('copy');
    alert('Link referral berhasil disalin!');
}

// Bagikan ke media sosial
function shareOnSocialMedia(platform) {
    const message = `Ayo main game dan dapatkan uang di MoneyEarn! Gunakan kode referral saya ${user.referralCode} untuk dapat bonus Rp320000. Daftar di https://moneyearn.game/ref=${user.referralCode}`;
    
    let url = '';
    switch (platform) {
        case 'whatsapp':
            url = `https://wa.me/?text=${encodeURIComponent(message)}`;
            break;
        case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://moneyearn.game')}&quote=${encodeURIComponent(message)}`;
            break;
        case 'twitter':
            url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
            break;
    }
    
    window.open(url, '_blank');
}

// Update leaderboard
function updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';
    
    // Tambahkan pengguna saat ini jika tidak ada di leaderboard
    const userInLeaderboard = leaderboard.some(player => player.name === user.name);
    if (!userInLeaderboard && user.balance > 0) {
        leaderboard.push({ name: user.name, balance: user.balance });
        leaderboard.sort((a, b) => b.balance - a.balance);
        leaderboard = leaderboard.slice(0, 10); // Batasi hanya 10 teratas
    }
    
    leaderboard.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        const rank = document.createElement('span');
        rank.className = 'leaderboard-rank';
        rank.textContent = `#${index + 1}`;
        
        const name = document.createElement('span');
        name.className = 'leaderboard-name';
        name.textContent = player.name;
        
        const balance = document.createElement('span');
        balance.className = 'leaderboard-balance';
        balance.textContent = formatCurrency(player.balance);
        
        item.appendChild(rank);
        item.appendChild(name);
        item.appendChild(balance);
        
        leaderboardList.appendChild(item);
    });
}

// Update riwayat penarikan
function updateWithdrawHistory() {
    const historyList = document.getElementById('withdraw-history');
    historyList.innerHTML = '';
    
    if (user.withdrawHistory.length === 0) {
        historyList.innerHTML = '<p>Belum ada riwayat penarikan</p>';
        return;
    }
    
    user.withdrawHistory.forEach(withdrawal => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        const leftDiv = document.createElement('div');
        leftDiv.innerHTML = `
            <div>${withdrawal.method}</div>
            <div class="history-amount">${formatCurrency(withdrawal.amount)}</div>
            <div>${withdrawal.date}</div>
        `;
        
        const rightDiv = document.createElement('div');
        rightDiv.className = `history-status ${withdrawal.status}`;
        rightDiv.textContent = withdrawal.status === 'pending' ? 'Diproses' : 'Berhasil';
        
        item.appendChild(leftDiv);
        item.appendChild(rightDiv);
        
        historyList.appendChild(item);
    });
}

// Update progress misi
function updateMissionProgress() {
    // Misi main gratis
    const freePlayMission = document.querySelector('[data-mission="free-play"]');
    const freePlayProgress = document.querySelector('[data-mission="free-play"]').previousElementSibling;
    
    if (user.completedMissions.freePlay) {
        freePlayMission.disabled = true;
        freePlayMission.textContent = 'Sudah Diklaim';
        freePlayProgress.value = 1;
    } else {
        freePlayMission.disabled = !isFreePlayAvailableForAnyGame();
        freePlayProgress.value = isFreePlayAvailableForAnyGame() ? 1 : 0;
    }
    
    // Misi undang teman
    const inviteFriendsProgress = document.querySelector('.mission-progress span');
    inviteFriendsProgress.textContent = `${user.friendsInvited}/5 teman`;
    
    // Misi main 3 game
    const play3GamesMission = document.querySelector('[data-mission="play-3-games"]');
    const play3GamesProgress = document.querySelector('[data-mission="play-3-games"]').previousElementSibling;
    
    play3GamesProgress.value = user.completedMissions.play3Games;
    play3GamesMission.disabled = user.completedMissions.play3Games < 3;
}

// Cek ketersediaan free play
function checkFreePlayAvailability() {
    const today = new Date().toISOString().split('T')[0];
    const lastPlayDate = user.lastFreePlay;
    
    document.querySelectorAll('.free-play-badge').forEach(badge => {
        const gameId = badge.getAttribute('data-game');
        badge.style.display = isFreePlayAvailableForGame(gameId) ? 'block' : 'none';
    });
}

// Cek apakah free play tersedia untuk game tertentu
function isFreePlayAvailableForGame(gameId) {
    const today = new Date().toISOString().split('T')[0];
    return user.lastFreePlay !== today;
}

// Cek apakah free play tersedia untuk game apapun
function isFreePlayAvailableForAnyGame() {
    return isFreePlayAvailableForGame('number-guess') || 
           isFreePlayAvailableForGame('math-quiz') || 
           isFreePlayAvailableForGame('memory-game');
}

// Tambahkan penghasilan
function addEarnings(amount, gameId) {
    user.balance += amount;
    user.totalEarned += amount;
    user.gamesPlayed++;
    
    // Update statistik game
    if (!user.gameStats[gameId]) {
        user.gameStats[gameId] = { plays: 0, earnings: 0 };
    }
    user.gameStats[gameId].plays++;
    user.gameStats[gameId].earnings += amount;
    
    // Update misi main 3 game
    user.completedMissions.play3Games = Math.min(user.completedMissions.play3Games + 1, 3);
    
    saveUserData();
    updateUI();
}

// Klaim hadiah misi
function claimMissionReward(missionId) {
    let reward = 0;
    
    switch (missionId) {
        case 'free-play':
            if (user.completedMissions.freePlay) return;
            reward = 1000;
            user.completedMissions.freePlay = true;
            break;
        case 'play-3-games':
            if (user.completedMissions.play3Games < 3) return;
            reward = 2000;
            user.completedMissions.play3Games = 0; // Reset untuk hari berikutnya
            break;
    }
    
    if (reward > 0) {
        user.balance += reward;
        user.totalEarned += reward;
        saveUserData();
        updateUI();
        alert(`Selamat! Anda mendapatkan bonus ${formatCurrency(reward)}`);
    }
}

// Ajukan penarikan
function submitWithdrawal() {
    const amount = parseInt(document.getElementById('withdraw-amount').value);
    const method = document.getElementById('withdraw-method').value;
    const account = document.getElementById('withdraw-account').value.trim();
    
    // Validasi
    if (isNaN(amount) || amount <= 0) {
        alert('Masukkan jumlah penarikan yang valid');
        return;
    }
    
    if (amount < 25000) {
        alert('Minimal penarikan adalah Rp25.000');
        return;
    }
    
    if (amount > user.balance) {
        alert('Saldo Anda tidak mencukupi');
        return;
    }
    
    if (!account) {
        alert('Masukkan nomor rekening/dompet digital');
        return;
    }
    
    // Proses penarikan
    user.balance -= amount;
    
    const withdrawal = {
        amount: amount,
        method: method.toUpperCase(),
        account: account,
        date: new Date().toLocaleDateString('id-ID'),
        status: 'pending'
    };
    
    user.withdrawHistory.unshift(withdrawal);
    saveUserData();
    updateUI();
    
    // Reset form
    document.getElementById('withdraw-amount').value = '';
    document.getElementById('withdraw-account').value = '';
    
    alert('Penarikan berhasil diajukan! Dana akan diproses dalam 1-3 hari kerja.');
}

// Implementasi Game

// Game 1: Tebak Angka
function playNumberGuess() {
    const gameDiv = document.createElement('div');
    gameDiv.className = 'number-guess-game';
    gameDiv.innerHTML = `
        <h3>Tebak Angka</h3>
        <p>Tebak angka antara 1-100 untuk menang ${formatCurrency(games['number-guess'].reward)}</p>
        <p>Anda memiliki 5 kesempatan</p>
        <input type="number" id="guess-input" min="1" max="100" placeholder="Masukkan tebakan">
        <button id="guess-btn">Tebak</button>
        <div id="guess-result"></div>
        <div id="guess-attempts">Kesempatan: 5</div>
    `;
    
    const targetNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 5;
    const gameId = 'number-guess';
    
    gameDiv.querySelector('#guess-btn').addEventListener('click', function() {
        if (attempts <= 0) return;
        
        const guessInput = gameDiv.querySelector('#guess-input');
        const guess = parseInt(guessInput.value);
        const resultDiv = gameDiv.querySelector('#guess-result');
        const attemptsDiv = gameDiv.querySelector('#guess-attempts');
        
        if (isNaN(guess) || guess < 1 || guess > 100) {
            resultDiv.textContent = 'Masukkan angka antara 1-100';
            return;
        }
        
        attempts--;
        attemptsDiv.textContent = `Kesempatan: ${attempts}`;
        
        if (guess === targetNumber) {
            resultDiv.textContent = `Selamat! Angka yang benar adalah ${targetNumber}. Anda memenangkan ${formatCurrency(games[gameId].reward)}!`;
            addEarnings(games[gameId].reward, gameId);
            this.disabled = true;
            guessInput.disabled = true;
            setTimeout(closeModal, 3000);
            return;
        }
        
        if (attempts <= 0) {
            resultDiv.textContent = `Game over! Angka yang benar adalah ${targetNumber}. Coba lagi besok!`;
            this.disabled = true;
            guessInput.disabled = true;
            setTimeout(closeModal, 3000);
            return;
        }
        
        resultDiv.textContent = `Angka terlalu ${guess < targetNumber ? 'kecil' : 'besar'}. Coba lagi!`;
        guessInput.value = '';
        guessInput.focus();
    });
    
    return gameDiv;
}

// Game 2: Kuis Matematika
function playMathQuiz() {
    const gameDiv = document.createElement('div');
    gameDiv.className = 'math-quiz-game';
    gameDiv.innerHTML = `
        <h3>Kuis Matematika</h3>
        <p>Jawab 5 soal matematika dalam 30 detik untuk menang ${formatCurrency(games['math-quiz'].reward)}</p>
        <div id="quiz-timer">Waktu: 30 detik</div>
        <div id="quiz-question"></div>
        <input type="number" id="quiz-answer" placeholder="Jawaban">
        <button id="quiz-submit">Submit</button>
        <div id="quiz-result"></div>
        <div id="quiz-score">Skor: 0/5</div>
    `;
    
    const questions = generateMathQuestions(5);
    let currentQuestion = 0;
    let score = 0;
    let timeLeft = 30;
    const gameId = 'math-quiz';
    
    const timerDiv = gameDiv.querySelector('#quiz-timer');
    const questionDiv = gameDiv.querySelector('#quiz-question');
    const resultDiv = gameDiv.querySelector('#quiz-result');
    const scoreDiv = gameDiv.querySelector('#quiz-score');
    
    displayQuestion();
    
    const timer = setInterval(function() {
        timeLeft--;
        timerDiv.textContent = `Waktu: ${timeLeft} detik`;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            endQuiz();
        }
    }, 1000);
    
    gameDiv.querySelector('#quiz-submit').addEventListener('click', function() {
        const answerInput = gameDiv.querySelector('#quiz-answer');
        const userAnswer = parseInt(answerInput.value);
        
        if (isNaN(userAnswer)) {
            resultDiv.textContent = 'Masukkan jawaban yang valid';
            return;
        }
        
        if (userAnswer === questions[currentQuestion].answer) {
            score++;
            resultDiv.textContent = 'Benar!';
        } else {
            resultDiv.textContent = `Salah! Jawaban yang benar adalah ${questions[currentQuestion].answer}`;
        }
        
        scoreDiv.textContent = `Skor: ${score}/5`;
        answerInput.value = '';
        
        currentQuestion++;
        if (currentQuestion >= questions.length || timeLeft <= 0) {
            endQuiz();
        } else {
            displayQuestion();
        }
    });
    
    function displayQuestion() {
        questionDiv.textContent = questions[currentQuestion].question;
    }
    
    function endQuiz() {
        clearInterval(timer);
        gameDiv.querySelector('#quiz-submit').disabled = true;
        gameDiv.querySelector('#quiz-answer').disabled = true;
        
        if (timeLeft <= 0) {
            resultDiv.textContent = 'Waktu habis!';
        }
        
        if (score >= 3) {
            resultDiv.textContent += ` Selamat! Anda memenangkan ${formatCurrency(games[gameId].reward)}!`;
            addEarnings(games[gameId].reward, gameId);
        } else {
            resultDiv.textContent += ' Skor Anda kurang dari 3. Coba lagi besok!';
        }
        
        setTimeout(closeModal, 3000);
    }
    
    return gameDiv;
}

function generateMathQuestions(count) {
    const questions = [];
    const operations = ['+', '-', '*'];
    
    for (let i = 0; i < count; i++) {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const op = operations[Math.floor(Math.random() * operations.length)];
        
        let question, answer;
        switch (op) {
            case '+':
                question = `${num1} + ${num2} = ?`;
                answer = num1 + num2;
                break;
            case '-':
                question = `${num1} - ${num2} = ?`;
                answer = num1 - num2;
                break;
            case '*':
                question = `${num1} × ${num2} = ?`;
                answer = num1 * num2;
                break;
        }
        
        questions.push({ question, answer });
    }
    
    return questions;
}

// Game 3: Game Memori
function playMemoryGame() {
    const gameDiv = document.createElement('div');
    gameDiv.className = 'memory-game';
    gameDiv.innerHTML = `
        <h3>Game Memori</h3>
        <p>Temukan semua pasangan kartu untuk menang ${formatCurrency(games['memory-game'].reward)}</p>
        <div id="memory-board" class="memory-board"></div>
        <div id="memory-moves">Langkah: 0</div>
        <div id="memory-result"></div>
    `;
    
    const cards = ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E', 'E', 'F', 'F'];
    let shuffledCards = shuffleArray([...cards]);
    let openedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    const gameId = 'memory-game';
    
    const board = gameDiv.querySelector('#memory-board');
    const movesDiv = gameDiv.querySelector('#memory-moves');
    const resultDiv = gameDiv.querySelector('#memory-result');
    
    // Buat kartu
    shuffledCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card';
        cardElement.dataset.index = index;
        cardElement.dataset.value = card;
        cardElement.textContent = '?';
        
        cardElement.addEventListener('click', function() {
            if (openedCards.length >= 2 || this.classList.contains('opened') || this.classList.contains('matched')) {
                return;
            }
            
            this.classList.add('opened');
            this.textContent = this.dataset.value;
            openedCards.push(this);
            
            if (openedCards.length === 2) {
                moves++;
                movesDiv.textContent = `Langkah: ${moves}`;
                
                if (openedCards[0].dataset.value === openedCards[1].dataset.value) {
                    // Match
                    openedCards.forEach(card => card.classList.add('matched'));
                    matchedPairs++;
                    openedCards = [];
                    
                    if (matchedPairs === cards.length / 2) {
                        // Game selesai
                        resultDiv.textContent = `Selamat! Anda memenangkan ${formatCurrency(games[gameId].reward)} dalam ${moves} langkah!`;
                        addEarnings(games[gameId].reward, gameId);
                        setTimeout(closeModal, 3000);
                    }
                } else {
                    // Tidak match
                    setTimeout(function() {
                        openedCards.forEach(card => {
                            card.classList.remove('opened');
                            card.textContent = '?';
                        });
                        openedCards = [];
                    }, 1000);
                }
            }
        });
        
        board.appendChild(cardElement);
    });
    
    // CSS untuk memory game
    const style = document.createElement('style');
    style.textContent = `
        .memory-board {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin: 20px 0;
        }
        .memory-card {
            background-color: #4CAF50;
            color: white;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .memory-card.opened {
            background-color: #FF9800;
        }
        .memory-card.matched {
            background-color: #2196F3;
            cursor: default;
        }
    `;
    gameDiv.appendChild(style);
    
    return gameDiv;
}

// Fungsi utilitas: acak array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

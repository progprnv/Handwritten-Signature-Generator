// Game State
const gameState = {
    player: {
        level: 1,
        maxHp: 100,
        hp: 100,
        xp: 0,
        xpToNextLevel: 100,
        baseAttack: 10,
        specialAttack: 25,
        specialAttackCooldown: 0,
        inventory: {
            healthPotions: 3,
            attackBoosts: 1
        }
    },
    currentFloor: 1,
    enemy: null,
    achievements: [
        { name: "Floor 5 Reached", unlocked: false, floorRequired: 5 },
        { name: "Floor 10 Reached", unlocked: false, floorRequired: 10 },
        { name: "Floor 20 Reached", unlocked: false, floorRequired: 20 },
        { name: "Level 5 Reached", unlocked: false, levelRequired: 5 },
        { name: "Level 10 Reached", unlocked: false, levelRequired: 10 }
    ]
};

// DOM Elements
const playerLevelEl = document.getElementById('player-level');
const playerHpEl = document.getElementById('player-hp');
const playerXpEl = document.getElementById('player-xp');
const dungeonFloorEl = document.getElementById('dungeon-floor');
const enemySpriteEl = document.getElementById('enemy-sprite');
const enemyNameEl = document.getElementById('enemy-name');
const enemyHpEl = document.getElementById('enemy-hp');
const battleLogEl = document.getElementById('battle-log');
const healthPotionsEl = document.getElementById('health-potions');
const attackBoostsEl = document.getElementById('attack-boosts');
const attackBtn = document.getElementById('attack-btn');
const specialBtn = document.getElementById('special-btn');
const healBtn = document.getElementById('heal-btn');
const fleeBtn = document.getElementById('flee-btn');
const levelUpModal = document.getElementById('level-up-modal');
const closeModalBtn = document.getElementById('close-modal');
const newLevelEl = document.getElementById('new-level');
const achievementListEl = document.getElementById('achievement-list');

// Enemy Types
const enemyTypes = [
    { name: "Goblin", emoji: "👺", hp: 30, attack: 5, xp: 20 },
    { name: "Skeleton", emoji: "💀", hp: 40, attack: 7, xp: 30 },
    { name: "Orc", emoji: "👹", hp: 50, attack: 10, xp: 40 },
    { name: "Slime", emoji: "👾", hp: 25, attack: 3, xp: 15 },
    { name: "Ghost", emoji: "👻", hp: 35, attack: 8, xp: 35 },
    { name: "Wolf", emoji: "🐺", hp: 45, attack: 12, xp: 45 },
    { name: "Troll", emoji: "🧌", hp: 70, attack: 15, xp: 60 },
    { name: "Dragon", emoji: "🐉", hp: 100, attack: 20, xp: 100 }
];

// Sound Effects
const battleSound = document.getElementById('battle-sound');
const healSound = document.getElementById('heal-sound');
const levelSound = document.getElementById('level-sound');

// Initialize Game
function initGame() {
    updatePlayerStats();
    spawnEnemy();
    updateInventory();
    renderAchievements();
    
    // Event Listeners
    attackBtn.addEventListener('click', playerAttack);
    specialBtn.addEventListener('click', playerSpecialAttack);
    healBtn.addEventListener('click', useHealthPotion);
    fleeBtn.addEventListener('click', attemptFlee);
    closeModalBtn.addEventListener('click', closeLevelUpModal);
}

// Update Player Stats Display
function updatePlayerStats() {
    playerLevelEl.textContent = gameState.player.level;
    playerHpEl.textContent = `${gameState.player.hp}/${gameState.player.maxHp}`;
    playerXpEl.textContent = `${gameState.player.xp}/${gameState.player.xpToNextLevel}`;
    dungeonFloorEl.textContent = gameState.currentFloor;
    
    // Update special attack button state
    if (gameState.player.specialAttackCooldown > 0) {
        specialBtn.disabled = true;
        specialBtn.textContent = `SPECIAL (${gameState.player.specialAttackCooldown})`;
    } else {
        specialBtn.disabled = false;
        specialBtn.textContent = 'SPECIAL';
    }
}

// Spawn a Random Enemy
function spawnEnemy() {
    // Stronger enemies appear on higher floors
    const floorModifier = Math.min(Math.floor(gameState.currentFloor / 5), enemyTypes.length - 1);
    const enemyPool = enemyTypes.slice(0, 3 + floorModifier);
    const randomEnemy = enemyPool[Math.floor(Math.random() * enemyPool.length)];
    
    // Scale enemy stats with floor
    const hpMultiplier = 1 + (gameState.currentFloor * 0.1);
    const attackMultiplier = 1 + (gameState.currentFloor * 0.05);
    
    gameState.enemy = {
        name: randomEnemy.name,
        emoji: randomEnemy.emoji,
        maxHp: Math.floor(randomEnemy.hp * hpMultiplier),
        hp: Math.floor(randomEnemy.hp * hpMultiplier),
        attack: Math.floor(randomEnemy.attack * attackMultiplier),
        xp: Math.floor(randomEnemy.xp * (1 + (gameState.currentFloor * 0.1)))
    };
    
    updateEnemyDisplay();
    addToBattleLog(`A wild ${gameState.enemy.name} appears!`);
}

// Update Enemy Display
function updateEnemyDisplay() {
    enemySpriteEl.textContent = gameState.enemy.emoji;
    enemyNameEl.textContent = gameState.enemy.name;
    enemyHpEl.textContent = `HP: ${gameState.enemy.hp}/${gameState.enemy.maxHp}`;
    
    // Shake animation when enemy is hit
    if (gameState.enemy.hp < gameState.enemy.maxHp) {
        enemySpriteEl.classList.add('shake');
        setTimeout(() => {
            enemySpriteEl.classList.remove('shake');
        }, 500);
    }
}

// Add Message to Battle Log
function addToBattleLog(message) {
    const p = document.createElement('p');
    p.textContent = message;
    battleLogEl.appendChild(p);
    battleLogEl.scrollTop = battleLogEl.scrollHeight;
}

// Player Attack
function playerAttack() {
    if (!gameState.enemy) return;
    
    const damage = gameState.player.baseAttack;
    gameState.enemy.hp -= damage;
    
    playSound(battleSound);
    addToBattleLog(`You attack the ${gameState.enemy.name} for ${damage} damage!`);
    
    if (gameState.enemy.hp <= 0) {
        enemyDefeated();
    } else {
        updateEnemyDisplay();
        enemyTurn();
    }
}

// Player Special Attack
function playerSpecialAttack() {
    if (!gameState.enemy || gameState.player.specialAttackCooldown > 0) return;
    
    const damage = gameState.player.specialAttack;
    gameState.enemy.hp -= damage;
    gameState.player.specialAttackCooldown = 3;
    
    playSound(battleSound);
    addToBattleLog(`You use a SPECIAL ATTACK on the ${gameState.enemy.name} for ${damage} damage!`);
    
    if (gameState.enemy.hp <= 0) {
        enemyDefeated();
    } else {
        updateEnemyDisplay();
        enemyTurn();
    }
    
    updatePlayerStats();
}

// Enemy Turn
function enemyTurn() {
    if (!gameState.enemy) return;
    
    const damage = gameState.enemy.attack;
    gameState.player.hp -= damage;
    
    playSound(battleSound);
    addToBattleLog(`The ${gameState.enemy.name} attacks you for ${damage} damage!`);
    
    if (gameState.player.hp <= 0) {
        gameOver();
    } else {
        updatePlayerStats();
    }
}

// Enemy Defeated
function enemyDefeated() {
    const xpGained = gameState.enemy.xp;
    gameState.player.xp += xpGained;
    
    addToBattleLog(`You defeated the ${gameState.enemy.name} and gained ${xpGained} XP!`);
    gameState.enemy = null;
    
    // Check for level up
    if (gameState.player.xp >= gameState.player.xpToNextLevel) {
        levelUp();
    } else {
        // Proceed to next floor after a delay
        setTimeout(() => {
            gameState.currentFloor++;
            checkAchievements();
            updatePlayerStats();
            spawnEnemy();
        }, 1500);
    }
}

// Level Up
function levelUp() {
    gameState.player.level++;
    gameState.player.xp -= gameState.player.xpToNextLevel;
    gameState.player.xpToNextLevel = Math.floor(gameState.player.xpToNextLevel * 1.5);
    gameState.player.maxHp += 10;
    gameState.player.hp = gameState.player.maxHp;
    gameState.player.baseAttack += 5;
    gameState.player.specialAttack += 10;
    
    playSound(levelSound);
    
    // Show level up modal
    newLevelEl.textContent = gameState.player.level;
    levelUpModal.style.display = 'flex';
    
    updatePlayerStats();
    checkAchievements();
}

// Close Level Up Modal
function closeLevelUpModal() {
    levelUpModal.style.display = 'none';
    
    // Proceed to next floor
    gameState.currentFloor++;
    updatePlayerStats();
    spawnEnemy();
}

// Use Health Potion
function useHealthPotion() {
    if (gameState.player.inventory.healthPotions > 0) {
        const healAmount = Math.floor(gameState.player.maxHp * 0.5);
        gameState.player.hp = Math.min(gameState.player.hp + healAmount, gameState.player.maxHp);
        gameState.player.inventory.healthPotions--;
        
        playSound(healSound);
        addToBattleLog(`You use a Health Potion and heal ${healAmount} HP!`);
        
        updatePlayerStats();
        updateInventory();
        enemyTurn(); // Enemy still gets a turn
    } else {
        addToBattleLog("You don't have any Health Potions left!");
    }
}

// Attempt to Flee
function attemptFlee() {
    const success = Math.random() < 0.5; // 50% chance
    
    if (success) {
        addToBattleLog("You successfully fled from battle!");
        gameState.currentFloor = Math.max(1, gameState.currentFloor - 1); // Go back one floor
        updatePlayerStats();
        spawnEnemy();
    } else {
        addToBattleLog("You failed to flee!");
        enemyTurn();
    }
}

// Game Over
function gameOver() {
    addToBattleLog("GAME OVER! You were defeated...");
    addToBattleLog(`You reached floor ${gameState.currentFloor} and achieved level ${gameState.player.level}.`);
    
    // Disable buttons
    attackBtn.disabled = true;
    specialBtn.disabled = true;
    healBtn.disabled = true;
    fleeBtn.disabled = true;
    
    // Reset game after delay
    setTimeout(() => {
        if (confirm("Game Over! Would you like to play again?")) {
            resetGame();
        }
    }, 1000);
}

// Reset Game
function resetGame() {
    // Reset player stats
    gameState.player = {
        level: 1,
        maxHp: 100,
        hp: 100,
        xp: 0,
        xpToNextLevel: 100,
        baseAttack: 10,
        specialAttack: 25,
        specialAttackCooldown: 0,
        inventory: {
            healthPotions: 3,
            attackBoosts: 1
        }
    };
    
    gameState.currentFloor = 1;
    
    // Clear battle log
    battleLogEl.innerHTML = '';
    
    // Enable buttons
    attackBtn.disabled = false;
    specialBtn.disabled = false;
    healBtn.disabled = false;
    fleeBtn.disabled = false;
    
    // Start new game
    updatePlayerStats();
    updateInventory();
    spawnEnemy();
}

// Update Inventory Display
function updateInventory() {
    healthPotionsEl.textContent = gameState.player.inventory.healthPotions;
    attackBoostsEl.textContent = gameState.player.inventory.attackBoosts;
}

// Check for Achievements
function checkAchievements() {
    let achievementsUpdated = false;
    
    gameState.achievements.forEach(achievement => {
        if (!achievement.unlocked) {
            if ((achievement.floorRequired && gameState.currentFloor >= achievement.floorRequired) ||
                (achievement.levelRequired && gameState.player.level >= achievement.levelRequired)) {
                achievement.unlocked = true;
                achievementsUpdated = true;
                addToBattleLog(`Achievement Unlocked: ${achievement.name}!`);
            }
        }
    });
    
    if (achievementsUpdated) {
        renderAchievements();
    }
}

// Render Achievements
function renderAchievements() {
    achievementListEl.innerHTML = '';
    
    gameState.achievements.forEach(achievement => {
        const div = document.createElement('div');
        div.className = `achievement ${achievement.unlocked ? '' : 'locked'}`;
        div.textContent = achievement.name;
        achievementListEl.appendChild(div);
    });
}

// Play Sound
function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Sound playback prevented:", e));
}

// Cooldown Tick
setInterval(() => {
    if (gameState.player.specialAttackCooldown > 0) {
        gameState.player.specialAttackCooldown--;
        updatePlayerStats();
    }
}, 1000);

// Start the game
initGame();

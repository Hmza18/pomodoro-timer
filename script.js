// DOM Elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const customTimeInput = document.getElementById('customTime');
const breakTimeInput = document.getElementById('breakTime');
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const lofiMusic = document.getElementById('lofiMusic');
const toggleMusicBtn = document.getElementById('toggleMusic');
const sessionCountDisplay = document.getElementById('sessionCount');
const sessionStatus = document.getElementById('sessionStatus');
const completionMessage = document.getElementById('completionMessage');
const restartBtn = document.getElementById('restartBtn');
const workDurationInput = document.getElementById('work-duration');
const breakDurationInput = document.getElementById('break-duration');
const backgroundToggle = document.getElementById('backgroundToggle');
const liveBackground = document.getElementById('liveBackground');
const backgroundContainer = document.querySelector('.background-container');
const themeWrapper = document.querySelector('.theme-transition-wrapper');

// Debug logging for DOM elements
console.log('DOM Elements Check:', {
    startBtn: !!startBtn,
    pauseBtn: !!pauseBtn,
    resetBtn: !!resetBtn,
    themeToggle: !!themeToggle,
    toggleMusicBtn: !!toggleMusicBtn,
    backgroundToggle: !!backgroundToggle,
    lofiMusic: !!lofiMusic,
    liveBackground: !!liveBackground
});

// Constants
const THEME_KEY = 'pomodoroTheme';
const SESSIONS_KEY = 'pomodoroSessions';
const BACKGROUND_KEY = 'pomodoroBackground';
const PREVIOUS_THEME_KEY = 'previousTheme';

// Timer variables
let timeLeft = 25 * 60; // Default 25 minutes in seconds
let timerId = null;
let isTimerRunning = false;
let isWorkSession = true;
let sessionsCompleted = 0;
let lastSessionDate = null;

// Music control variables
let isMusicPlaying = false;
let musicVolume = 0.5; // Default volume at 50%

// Background state
let isBackgroundActive = false;

// Animation helper functions
function animateDigitChange(element) {
    element.classList.add('changed');
    element.addEventListener('animationend', () => {
        element.classList.remove('changed');
    }, { once: true });
}

function animateSessionStatus() {
    sessionStatus.classList.add('changing');
    sessionStatus.addEventListener('animationend', () => {
        sessionStatus.classList.remove('changing');
    }, { once: true });
}

// Theme Functions
function toggleTheme() {
    if (isBackgroundActive) {
        console.log('Theme toggle disabled in live mode');
        return;
    }
    
    console.log('Theme toggle clicked');
    const isDark = body.classList.contains('dark-mode');
    
    // Add transition wrapper
    themeWrapper.classList.add('active');
    
    // Toggle theme
    if (isDark) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        localStorage.setItem(THEME_KEY, 'light');
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        localStorage.setItem(THEME_KEY, 'dark');
    }
    
    // Remove transition wrapper after animation
    setTimeout(() => {
        themeWrapper.classList.remove('active');
    }, 400);
}

// Music Functions
async function toggleMusic() {
    console.log('Music toggle clicked');
    try {
        if (!isMusicPlaying) {
            await lofiMusic.play();
            isMusicPlaying = true;
            toggleMusicBtn.querySelector('.music-text').textContent = 'Pause Lofi';
        } else {
            lofiMusic.pause();
            isMusicPlaying = false;
            toggleMusicBtn.querySelector('.music-text').textContent = 'Play Lofi';
        }
    } catch (error) {
        console.error('Music playback error:', error);
        isMusicPlaying = false;
        toggleMusicBtn.querySelector('.music-text').textContent = 'Play Lofi';
    }
}

// Background Functions
function toggleBackground() {
    console.log('Background toggle clicked');
    if (isBackgroundActive) {
        deactivateBackground();
    } else {
        activateBackground();
    }
}

function activateBackground() {
    console.log('Activating live background');
    // Store current theme before switching to live mode
    const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem(PREVIOUS_THEME_KEY, currentTheme);
    
    // Remove theme classes and add live mode class
    body.classList.remove('dark-mode', 'light-mode');
    body.classList.add('live-mode');
    
    isBackgroundActive = true;
    backgroundContainer.classList.add('active');
    backgroundToggle.classList.add('active');
    liveBackground.play().catch(err => console.warn('Background video autoplay prevented:', err));
    localStorage.setItem(BACKGROUND_KEY, 'active');
    backgroundToggle.querySelector('.background-text').textContent = 'Hide Background';
    
    // Disable theme toggle while in live mode
    if (themeToggle) {
        themeToggle.style.display = 'none';
    }
}

function deactivateBackground() {
    console.log('Deactivating live background');
    // Remove live mode class
    body.classList.remove('live-mode');
    
    // Restore previous theme
    const previousTheme = localStorage.getItem(PREVIOUS_THEME_KEY) || 'light';
    body.classList.add(previousTheme + '-mode');
    
    isBackgroundActive = false;
    backgroundContainer.classList.remove('active');
    backgroundToggle.classList.remove('active');
    liveBackground.pause();
    localStorage.setItem(BACKGROUND_KEY, 'inactive');
    backgroundToggle.querySelector('.background-text').textContent = 'Live Background';
    
    // Re-enable theme toggle
    if (themeToggle) {
        themeToggle.style.display = 'inline-block';
    }
}

// UI Update Functions
function updateButtonStates() {
    console.log('Updating button states:', { isTimerRunning });
    if (startBtn && pauseBtn) {
        startBtn.style.display = isTimerRunning ? 'none' : 'inline-block';
        pauseBtn.style.display = isTimerRunning ? 'inline-block' : 'none';
    }
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

function updateSessionStatus() {
    const statusText = sessionStatus.querySelector('.status-text');
    const statusDot = sessionStatus.querySelector('.status-dot');
    
    if (isWorkSession) {
        statusText.textContent = 'Work Session';
        statusDot.style.backgroundColor = 'var(--work-color)';
        sessionStatus.classList.remove('break');
    } else {
        statusText.textContent = 'Break Session';
        statusDot.style.backgroundColor = 'var(--break-color)';
        sessionStatus.classList.add('break');
    }
    
    animateSessionStatus();
}

function updateMusicButtonText() {
    const musicText = toggleMusicBtn.querySelector('.music-text');
    musicText.textContent = isMusicPlaying ? 'Pause Lofi' : 'Play Lofi';
}

function updateBackgroundButton() {
    const backgroundText = backgroundToggle.querySelector('.background-text');
    const backgroundIcon = backgroundToggle.querySelector('.background-icon');
    
    if (isBackgroundActive) {
        backgroundText.textContent = 'Hide Background';
        backgroundIcon.textContent = '✨';
    } else {
        backgroundText.textContent = 'Live Background';
        backgroundIcon.textContent = '🎥';
    }
}

// Session Management
function incrementSessionCount() {
    const today = new Date().toDateString();
    const lastSessionDate = localStorage.getItem('lastSessionDate');
    
    // Reset counter if it's a new day
    if (lastSessionDate !== today) {
        sessionsCompleted = 0;
        localStorage.setItem('lastSessionDate', today);
    }
    
    // Increment and save
    sessionsCompleted++;
    localStorage.setItem('sessionsCompleted', sessionsCompleted);
    
    // Update display with animation
    sessionCountDisplay.classList.add('changed');
    setTimeout(() => sessionCountDisplay.classList.remove('changed'), 400);
    
    // Update the display
    sessionCountDisplay.textContent = sessionsCompleted;
}

function updateSessionDisplay() {
    sessionCountDisplay.textContent = sessionsCompleted;
}

function initializeSessionCount() {
    const today = new Date().toDateString();
    const savedData = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}');
    
    if (savedData.date === today) {
        sessionsCompleted = savedData.count;
        lastSessionDate = today;
    } else {
        sessionsCompleted = 0;
        lastSessionDate = today;
    }
    updateSessionDisplay();
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing...');
    
    try {
        // Verify DOM elements
        console.log('DOM Elements Check:', {
            startBtn: !!startBtn,
            pauseBtn: !!pauseBtn,
            resetBtn: !!resetBtn,
            themeToggle: !!themeToggle,
            toggleMusicBtn: !!toggleMusicBtn,
            backgroundToggle: !!backgroundToggle,
            workDurationInput: !!workDurationInput,
            breakDurationInput: !!breakDurationInput
        });
        
        // Initialize state
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
        }
        
        const savedBackground = localStorage.getItem(BACKGROUND_KEY);
        if (savedBackground === 'active') {
            activateBackground();
        } else {
            // Only initialize theme if not in live mode
            const savedTheme = localStorage.getItem(THEME_KEY);
            if (savedTheme === 'dark') {
                body.classList.add('dark-mode');
                body.classList.remove('light-mode');
            } else {
                body.classList.add('light-mode');
            }
        }
        
        const today = new Date().toDateString();
        const lastSessionDate = localStorage.getItem('lastSessionDate');
        if (lastSessionDate !== today) {
            sessionsCompleted = 0;
            localStorage.setItem('lastSessionDate', today);
        } else {
            sessionsCompleted = parseInt(localStorage.getItem('sessionsCompleted') || '0');
        }
        
        // Setup UI
        setupEventListeners();
        updateDisplay();
        updateSessionStatus();
        sessionCountDisplay.textContent = sessionsCompleted;
        
        console.log('Initialization complete');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Show completion message
function showCompletionMessage(title, message, buttonText) {
    completionMessage.innerHTML = `
        <h2>${title}</h2>
        <p>${message}</p>
        <button id="restartBtn" class="btn primary-btn">${buttonText}</button>
    `;
    completionMessage.classList.add('visible');
    
    const restartBtn = completionMessage.querySelector('#restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            hideCompletionMessage();
            resetTimer();
            startTimer();
        });
    }
}

// Hide completion message
function hideCompletionMessage() {
    completionMessage.classList.remove('visible');
}

// Handle music during session changes
function handleSessionMusicChange() {
    if (!isWorkSession) {
        // Pause music during breaks
        lofiMusic.pause();
        isMusicPlaying = false;
        updateMusicButtonText();
    }
}

// Timer Functions
function startTimer() {
    console.log('Start timer clicked');
    if (isTimerRunning) {
        console.log('Timer already running');
        return;
    }
    
    isTimerRunning = true;
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    
    timerId = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerId);
            timerId = null;
            handleTimerComplete();
        } else {
            timeLeft--;
            updateDisplay();
        }
    }, 1000);
}

function pauseTimer() {
    console.log('Pause timer clicked');
    if (!isTimerRunning) {
        console.log('Timer not running');
        return;
    }
    
    clearInterval(timerId);
    timerId = null;
    isTimerRunning = false;
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
}

function resetTimer() {
    console.log('Reset timer clicked');
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
    
    isTimerRunning = false;
    isWorkSession = true;
    timeLeft = parseInt(workDurationInput.value) * 60;
    
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
    
    updateDisplay();
    updateSessionStatus();
    hideCompletionMessage();
}

function handleTimerComplete() {
    console.log('Timer completed');
    isTimerRunning = false;
    updateButtonStates();
    
    if (isWorkSession) {
        incrementSessionCount();
        isWorkSession = false;
        timeLeft = parseInt(breakDurationInput.value) * 60;
        showCompletionMessage('Work Session Complete! 🎯', 'Time for a break!', 'Start Break');
    } else {
        isWorkSession = true;
        timeLeft = parseInt(workDurationInput.value) * 60;
        showCompletionMessage('Break Complete! 🎯', 'Ready for your next work session?', 'Start Work Session');
    }
    
    updateSessionStatus();
    updateDisplay();
}

// Add CSS animation for timer pulse
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
    
    .theme-transitioning * {
        transition: background-color 0.3s var(--animation-timing),
                    color 0.3s var(--animation-timing),
                    border-color 0.3s var(--animation-timing),
                    box-shadow 0.3s var(--animation-timing) !important;
    }
`;
document.head.appendChild(style);

// Event Listeners
function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Timer controls
    if (startBtn) {
        console.log('Adding start button listener');
        startBtn.addEventListener('click', startTimer);
    }
    
    if (pauseBtn) {
        console.log('Adding pause button listener');
        pauseBtn.addEventListener('click', pauseTimer);
    }
    
    if (resetBtn) {
        console.log('Adding reset button listener');
        resetBtn.addEventListener('click', resetTimer);
    }
    
    // Theme toggle
    if (themeToggle) {
        console.log('Adding theme toggle listener');
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Background toggle
    if (backgroundToggle) {
        console.log('Adding background toggle listener');
        backgroundToggle.addEventListener('click', toggleBackground);
    }
    
    // Music control
    if (toggleMusicBtn) {
        console.log('Adding music toggle listener');
        toggleMusicBtn.addEventListener('click', toggleMusic);
    }
    
    // Duration inputs
    if (workDurationInput) {
        workDurationInput.addEventListener('change', () => {
            const value = parseInt(workDurationInput.value);
            if (value < 1) workDurationInput.value = 1;
            if (value > 60) workDurationInput.value = 60;
            if (!isTimerRunning) {
                timeLeft = value * 60;
                updateDisplay();
            }
        });
    }
    
    if (breakDurationInput) {
        breakDurationInput.addEventListener('change', () => {
            const value = parseInt(breakDurationInput.value);
            if (value < 1) breakDurationInput.value = 1;
            if (value > 30) breakDurationInput.value = 30;
        });
    }
    
    // System theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        console.log('System theme changed');
        initializeTheme();
    });
    
    console.log('Event listeners setup complete');
}

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        body.classList.add(savedTheme);
        body.classList.remove(savedTheme === 'dark' ? 'light-mode' : 'dark-mode');
    } else {
        body.classList.add('light-mode');
    }
}

// Initialize music
function initializeMusic() {
    const savedMusic = localStorage.getItem('pomodoroMusic');
    if (savedMusic) {
        musicVolume = parseFloat(savedMusic);
        lofiMusic.volume = musicVolume;
    } else {
        musicVolume = 0.5;
        lofiMusic.volume = musicVolume;
    }
}

// Initialize background
function initializeBackground() {
    const savedBackground = localStorage.getItem(BACKGROUND_KEY);
    if (savedBackground) {
        if (savedBackground === 'active') {
            activateBackground();
        } else {
            deactivateBackground();
        }
    } else {
        deactivateBackground();
    }
} 
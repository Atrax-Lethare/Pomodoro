 // --- Configuration ---
        const MODES = {
            pomodoro: { time: 25 * 60, color: '#ff6b6b', label: 'Time to Focus' },
            short: { time: 5 * 60, color: '#4ecdc4', label: 'Short Break' },
            long: { time: 15 * 60, color: '#45b7d1', label: 'Long Break' }
        };

        // --- State ---
        let currentMode = 'pomodoro';
        let timeLeft = MODES[currentMode].time;
        let isRunning = false;
        let timerId = null;
        let audioContext = null;

        // --- DOM Elements ---
        const timeDisplay = document.getElementById('time');
        const statusDisplay = document.getElementById('status');
        const toggleBtn = document.getElementById('toggleBtn');
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');
        const circle = document.querySelector('.progress-ring__circle');
        
        // --- SVG Calculation ---
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;

        // --- Initialization ---
        function setProgress(percent) {
            const offset = circumference - (percent / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }

        function formatTime(seconds) {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }

        function updateDisplay() {
            timeDisplay.textContent = formatTime(timeLeft);
            document.title = `${formatTime(timeLeft)} - Focus Flow`;
            
            const totalTime = MODES[currentMode].time;
            const percent = ((totalTime - timeLeft) / totalTime) * 100;
            
            // Invert logic for visual: Full circle = full time left
            const offset = (percent / 100) * circumference; 
            circle.style.strokeDashoffset = offset;
        }

        // --- Audio Context (For Notification) ---
        function playNotification() {
            // Create context only on user interaction (handled in toggleTimer)
            if(!audioContext) return;

            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, audioContext.currentTime); // A5
            osc.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.5); // Drop to A4
            
            gain.gain.setValueAtTime(0.5, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            osc.start();
            osc.stop(audioContext.currentTime + 0.5);
        }

        // --- Timer Logic ---
        function setMode(mode) {
            if (isRunning) toggleTimer(); // Stop if running
            
            currentMode = mode;
            timeLeft = MODES[mode].time;
            
            // Update UI Theme
            document.documentElement.style.setProperty('--current-color', MODES[mode].color);
            statusDisplay.textContent = MODES[mode].label;
            
            // Update Buttons
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
                if(btn.dataset.mode === mode) btn.classList.add('active');
            });

            updateDisplay();
        }

        function toggleTimer() {
            // Initialize Audio Context on first user interaction
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            isRunning = !isRunning;
            
            if (isRunning) {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
                timerId = setInterval(() => {
                    if (timeLeft > 0) {
                        timeLeft--;
                        updateDisplay();
                    } else {
                        // Timer Finished
                        clearInterval(timerId);
                        isRunning = false;
                        playNotification();
                        playIcon.style.display = 'block';
                        pauseIcon.style.display = 'none';
                        // Optional: Auto switch logic could go here
                    }
                }, 1000);
            } else {
                clearInterval(timerId);
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            }
        }

        function resetTimer() {
            if (isRunning) toggleTimer();
            timeLeft = MODES[currentMode].time;
            updateDisplay();
        }

        // --- Task List Logic ---
        const taskInput = document.getElementById('taskInput');
        const taskList = document.getElementById('taskList');

        taskInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') addTask();
        });

        function addTask() {
            const text = taskInput.value.trim();
            if (!text) return;

            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" onclick="this.parentElement.classList.toggle('completed')">
                <span class="task-text">${text}</span>
                <button class="delete-task" onclick="this.parentElement.remove()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;
            
            taskList.prepend(li);
            taskInput.value = '';
}
        
let isDark = false;
        const body = document.body;
        const btnText = document.getElementById('btnText');
        const sunIcon = document.getElementById('sunIcon');
        const moonIcon = document.getElementById('moonIcon');

        function toggleTheme() {
            isDark = !isDark;
            
            // We only need to toggle the class. CSS Variables handle the rest!
            body.classList.toggle('dark-mode');

            if (isDark) {
                moonIcon.classList.replace('show', 'hide'); // Handle initial state fallback
                if(!moonIcon.classList.contains('hide')) moonIcon.style.display = 'none'; // Safety for inline styles
                
                moonIcon.classList.add('hide');
                sunIcon.classList.remove('hide');
                sunIcon.classList.add('show');
            } else {
                sunIcon.classList.replace('show', 'hide');
                
                sunIcon.classList.add('hide');
                moonIcon.classList.remove('hide');
                moonIcon.classList.add('show');
            }
        }

        // Initial setup
        updateDisplay();

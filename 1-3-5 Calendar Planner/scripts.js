      // --- ICONS (Inline SVGs) ---
        const Icons = {
            chevronLeft: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
            chevronRight: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
            info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
            calendar: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
            trophy: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
            target: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
            listTodo: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>`,
            sparkles: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
            circle: `<svg style="width: 24px; height: 24px;" class="task-checkbox-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`,
            checkCircle: `<svg style="width: 24px; height: 24px;" class="__COLOR_CLASS__ fill-current text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        };

        // Render static icons
        document.getElementById('icon-info-header').innerHTML = Icons.info;
        document.getElementById('icon-chevron-left').innerHTML = Icons.chevronLeft;
        document.getElementById('icon-chevron-right').innerHTML = Icons.chevronRight;
        document.getElementById('icon-trophy').innerHTML = Icons.trophy;
        document.getElementById('icon-sparkles-modal').innerHTML = Icons.sparkles.replace('width="16"', 'width="24"').replace('height="16"', 'height="24"');
        document.getElementById('icon-calendar-header').innerHTML = Icons.calendar;
        document.getElementById('icon-target').innerHTML = Icons.target;
        document.getElementById('icon-list-todo').innerHTML = Icons.listTodo;
        document.getElementById('icon-sparkles').innerHTML = Icons.sparkles;

        // --- STATE ---
        let state = {
            selectedDate: new Date(),
            calendarMonth: new Date(),
            planData: null // Loaded on init
        };

        // --- UTILS ---
        const generateDateId = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        const isSameDay = (d1, d2) => 
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
        
        const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
        const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

        const EMPTY_PLAN = {
            big: { text: '', completed: false },
            medium: Array(3).fill().map((_, i) => ({ id: i+1, text: '', completed: false })),
            small: Array(5).fill().map((_, i) => ({ id: i+1, text: '', completed: false }))
        };

        // --- LOCAL STORAGE LOGIC ---
        function getStorageKey(date) {
            return `135_plan_${generateDateId(date)}`;
        }

        function loadPlanFromStorage(date) {
            const key = getStorageKey(date);
            const stored = localStorage.getItem(key);
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    console.error("Parse error", e);
                    return JSON.parse(JSON.stringify(EMPTY_PLAN));
                }
            }
            return JSON.parse(JSON.stringify(EMPTY_PLAN));
        }

        function savePlanToStorage(date, data) {
            const key = getStorageKey(date);
            localStorage.setItem(key, JSON.stringify(data));
            
            // Fake "Network" indicator for UX
            const indicator = document.getElementById('save-indicator');
            indicator.classList.add('visible');
            setTimeout(() => indicator.classList.remove('visible'), 600);
        }

        // --- APP LOGIC ---

        function init() {
            // Load initial data
            loadPlanForDate(state.selectedDate);
            
            // Remove loader
            setTimeout(() => {
                document.getElementById('app-loader').classList.add('opacity-0');
                // Remove from DOM after fade for cleanup
                setTimeout(() => document.getElementById('app-loader').style.display = 'none', 500);
            }, 500);
        }

        function loadPlanForDate(date) {
            state.planData = loadPlanFromStorage(date);
            renderApp();
        }

        function renderApp() {
            renderCalendar();
            renderHeader();
            renderTasks();
        }

        function renderHeader() {
            const today = new Date();
            const isToday = isSameDay(state.selectedDate, today);
            
            document.getElementById('selected-date-weekday').textContent = state.selectedDate.toLocaleDateString('default', { weekday: 'long', year: 'numeric' });
            document.getElementById('selected-date-title').textContent = isToday ? "Today’s Plan" : state.selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric' });

            // Progress
            let total = 9;
            let completed = 0;
            if (state.planData.big.completed) completed++;
            state.planData.medium.forEach(t => t.completed && completed++);
            state.planData.small.forEach(t => t.completed && completed++);
            
            const percentage = Math.round((completed / total) * 100);
            document.getElementById('progress-text').textContent = `${percentage}% Done`;
            document.getElementById('progress-bar').style.width = `${percentage}%`;
        }

        function renderCalendar() {
            const grid = document.getElementById('calendar-grid');
            grid.innerHTML = '';

            const year = state.calendarMonth.getFullYear();
            const month = state.calendarMonth.getMonth();
            const daysInMonth = getDaysInMonth(year, month);
            const firstDay = getFirstDayOfMonth(year, month);
            const today = new Date();

            document.getElementById('calendar-month-label').textContent = state.calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

            for (let i = 0; i < firstDay; i++) {
                const div = document.createElement('div');
                grid.appendChild(div);
            }

            for (let i = 1; i <= daysInMonth; i++) {
                const date = new Date(year, month, i);
                const btn = document.createElement('button');
                
                const isSelected = isSameDay(date, state.selectedDate);
                const isToday = isSameDay(date, today);

                btn.className = 'calendar-day';
                if (isSelected) btn.classList.add('is-selected');
                if (isToday) btn.classList.add('is-today');

                btn.innerHTML = `<span>${i}</span>`;
                
                if (isToday && !isSelected) {
                    btn.innerHTML += `<div class="today-dot"></div>`;
                }

                btn.onclick = () => {
                    state.selectedDate = date;
                    loadPlanForDate(date);
                };

                grid.appendChild(btn);
            }
        }

        function renderTasks() {
            const renderRow = (category, item, index, colorClass, placeholder, points) => {
                const container = document.createElement('div');
                container.className = 'task-item';
                if (item.completed) container.classList.add('is-completed');
                
                const checkBtn = document.createElement('button');
                checkBtn.className = "task-checkbox-btn";
                checkBtn.innerHTML = item.completed 
                    ? Icons.checkCircle.replace('__COLOR_CLASS__', colorClass) 
                    : Icons.circle;
                
                checkBtn.onclick = () => toggleComplete(category, index);

                const input = document.createElement('input');
                input.type = "text";
                input.value = item.text;
                input.placeholder = placeholder;
                input.className = 'task-input';
                input.oninput = (e) => handleTaskChange(category, index, 'text', e.target.value);

                container.appendChild(checkBtn);
                container.appendChild(input);

                if (item.text && !item.completed) {
                    const pill = document.createElement('div');
                    pill.className = "points-pill";
                    pill.textContent = `${points} pts`;
                    container.appendChild(pill);
                }

                return container;
            };

            // Big Task
            const bigContainer = document.getElementById('container-big');
            bigContainer.innerHTML = '';
            bigContainer.appendChild(renderRow('big', state.planData.big, 0, 'color-red', 'What is the one absolute must-do today?', 1));

            // Medium Tasks
            const medContainer = document.getElementById('container-medium');
            medContainer.innerHTML = '';
            state.planData.medium.forEach((task, idx) => {
                medContainer.appendChild(renderRow('medium', task, idx, 'color-blue', `Medium priority task #${idx + 1}`, 3));
            });

            // Small Tasks
            const smallContainer = document.getElementById('container-small');
            smallContainer.innerHTML = '';
            state.planData.small.forEach((task, idx) => {
                smallContainer.appendChild(renderRow('small', task, idx, 'color-green', `Quick win #${idx + 1}`, 5));
            });
        }

        // --- GLOBAL HANDLERS ---
        window.toggleComplete = (category, index) => {
            const newData = { ...state.planData };
            if (category === 'big') {
                newData.big.completed = !newData.big.completed;
            } else {
                newData[category][index].completed = !newData[category][index].completed;
            }
            state.planData = newData;
            renderTasks(); 
            renderHeader();
            savePlanToStorage(state.selectedDate, newData);
        };

        window.handleTaskChange = (category, index, field, value) => {
            const newData = { ...state.planData };
            if (category === 'big') {
                newData.big[field] = value;
            } else {
                newData[category][index][field] = value;
            }
            state.planData = newData;
            savePlanToStorage(state.selectedDate, newData);
        };

        window.changeMonth = (delta) => {
            const newDate = new Date(state.calendarMonth);
            newDate.setMonth(newDate.getMonth() + delta);
            state.calendarMonth = newDate;
            renderCalendar();
        };

        window.jumpToToday = () => {
            const now = new Date();
            state.selectedDate = now;
            state.calendarMonth = now;
            loadPlanForDate(now);
            renderCalendar();
        };

        window.toggleModal = (show) => {
            const modal = document.getElementById('info-modal');
            if (show) {
                modal.classList.add('active');
            } else {
                modal.classList.remove('active');
            }
        };

        // Start App
        init();
 // --- State Management ---
        let appData = {
            frog: { text: null, completed: false },
            q1: [],
            q2: [],
            q3: [],
            q4: []
        };

        // --- Initialization ---
        document.addEventListener('DOMContentLoaded', () => {
            loadData();
            renderAll();
            updateDate();
        });

        function updateDate() {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            document.getElementById('dateDisplay').textContent = new Date().toLocaleDateString('en-US', options);
        }

        // --- Local Storage ---
        function saveData() {
            localStorage.setItem('plannerData', JSON.stringify(appData));
        }

        function loadData() {
            const stored = localStorage.getItem('plannerData');
            if (stored) {
                appData = JSON.parse(stored);
            }
        }

        function clearAllData() {
            if(confirm("Are you sure you want to reset your entire planner?")) {
                appData = { frog: { text: null, completed: false }, q1: [], q2: [], q3: [], q4: [] };
                saveData();
                renderAll();
            }
        }

        // --- Rendering ---
        function renderAll() {
            renderFrog();
            renderList('q1');
            renderList('q2');
            renderList('q3');
            renderList('q4');
        }

        // --- Eat The Frog Logic ---
        function setFrog() {
            const input = document.getElementById('frogInput');
            const text = input.value.trim();
            if (!text) return;

            appData.frog = { text: text, completed: false };
            input.value = '';
            saveData();
            renderFrog();
        }

        function toggleFrog() {
            appData.frog.completed = !appData.frog.completed;
            saveData();
            renderFrog();
        }

        function clearFrog() {
            appData.frog = { text: null, completed: false };
            saveData();
            renderFrog();
        }

        function renderFrog() {
            const inputArea = document.getElementById('frogInputArea');
            const displayArea = document.getElementById('frogDisplayArea');
            const frogText = document.getElementById('frogText');
            const checkbox = document.getElementById('frogCheckbox');

            if (appData.frog.text) {
                inputArea.style.display = 'none';
                displayArea.style.display = 'flex';
                frogText.textContent = appData.frog.text;
                checkbox.checked = appData.frog.completed;
                
                if (appData.frog.completed) {
                    displayArea.classList.add('completed');
                } else {
                    displayArea.classList.remove('completed');
                }
            } else {
                inputArea.style.display = 'block';
                displayArea.style.display = 'none';
            }
        }

        // --- Matrix Logic ---
        function addTask(quadrantId) {
            const input = document.getElementById(`input-${quadrantId}`);
            const text = input.value.trim();
            if (!text) return;

            const newTask = {
                id: Date.now().toString(),
                text: text,
                completed: false
            };

            appData[quadrantId].push(newTask);
            input.value = '';
            saveData();
            renderList(quadrantId);
        }

        function handleEnter(event, quadrantId) {
            if (event.key === 'Enter') {
                addTask(quadrantId);
            }
        }

        function toggleTask(quadrantId, taskId) {
            const task = appData[quadrantId].find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                saveData();
                renderList(quadrantId);
            }
        }

        function deleteTask(quadrantId, taskId) {
            appData[quadrantId] = appData[quadrantId].filter(t => t.id !== taskId);
            saveData();
            renderList(quadrantId);
        }

        function renderList(quadrantId) {
            const listEl = document.getElementById(`list-${quadrantId}`);
            listEl.innerHTML = '';

            appData[quadrantId].forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.draggable = true;
                li.ondragstart = (e) => drag(e, quadrantId, task.id);
                
                li.innerHTML = `
                    <input type="checkbox" class="task-checkbox" 
                        ${task.completed ? 'checked' : ''} 
                        onchange="toggleTask('${quadrantId}', '${task.id}')">
                    <span class="task-text">${task.text}</span>
                    <button class="delete-btn" onclick="deleteTask('${quadrantId}', '${task.id}')">×</button>
                `;
                listEl.appendChild(li);
            });
        }

        // --- Drag and Drop Logic ---
        function drag(ev, sourceQuad, taskId) {
            ev.dataTransfer.setData("text/plain", JSON.stringify({ sourceQuad, taskId }));
            ev.target.classList.add('dragging');
        }

        function allowDrop(ev) {
            ev.preventDefault();
            const quadrant = ev.target.closest('.quadrant');
            if (quadrant) {
                quadrant.classList.add('drag-over');
            }
        }

        // Handle drag leave to remove visual feedback
        document.addEventListener('dragleave', (ev) => {
             const quadrant = ev.target.closest('.quadrant');
             if (quadrant && !quadrant.contains(ev.relatedTarget)) {
                 quadrant.classList.remove('drag-over');
             }
        }, true);

        function drop(ev) {
            ev.preventDefault();
            const targetQuadrantEl = ev.target.closest('.quadrant');
            
            // Clean up visuals
            document.querySelectorAll('.quadrant').forEach(q => q.classList.remove('drag-over'));
            
            if (!targetQuadrantEl) return;

            const targetQuadId = targetQuadrantEl.id;
            const data = JSON.parse(ev.dataTransfer.getData("text/plain"));
            const { sourceQuad, taskId } = data;

            if (sourceQuad === targetQuadId) return; // Dropped in same list

            // Find and move task
            const taskIndex = appData[sourceQuad].findIndex(t => t.id === taskId);
            if (taskIndex > -1) {
                const task = appData[sourceQuad][taskIndex];
                
                // Remove from source
                appData[sourceQuad].splice(taskIndex, 1);
                
                // Add to target
                appData[targetQuadId].push(task);

                saveData();
                renderList(sourceQuad);
                renderList(targetQuadId);
            }
        }